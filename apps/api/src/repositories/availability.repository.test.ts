
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    findAvailabilityException,
    findWeeklyAvailability,
    findConfirmedBookingsForDate,
    listWeeklyAvailability,
    createWeeklyAvailability,
    updateWeeklyAvailability,
    deleteWeeklyAvailability,
    listAvailabilityExceptions,
    createAvailabilityException,
    updateAvailabilityException,
    deleteAvailabilityException,
} from "./availability.repository.js";

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: queryMock,
    },
}));


describe("availability repository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns an exception when one exists", async () => {
        const exception = {
            is_available: false,
            start_time: null,
            end_time: null,
        };

        queryMock.mockResolvedValue({
            rows: [exception],
        });

        const result = await findAvailabilityException(
            "550e8400-e29b-41d4-a716-446655440000",
            "2026-11-02",
        );

        expect(result).toEqual(exception);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM availability_exceptions"),
            [
                "550e8400-e29b-41d4-a716-446655440000",
                "2026-11-02",
            ],
        );
    });

    it("returns null when no exception exists", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await findAvailabilityException(
            "550e8400-e29b-41d4-a716-446655440000",
            "2026-11-02",
        );

        expect(result).toBeNull();
    });

    it("returns all weekly windows for the requested weekday", async () => {
        const windows = [
            { start_time: "09:00:00", end_time: "12:00:00" },
            { start_time: "13:00:00", end_time: "17:00:00" },
        ];

        queryMock.mockResolvedValue({
            rows: windows,
        });

        const result = await findWeeklyAvailability(
            "550e8400-e29b-41d4-a716-446655440000",
            1,
        );

        expect(result).toEqual(windows);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM weekly_availability"),
            ["550e8400-e29b-41d4-a716-446655440000", 1],
        );
    });

    it("returns confirmed bookings overlapping the requested day", async () => {
        const bookings = [
            {
                start_time: new Date("2026-11-04T08:00:00Z"),
                end_time: new Date("2026-11-04T09:00:00Z"),
            },
        ];

        queryMock.mockResolvedValue({
            rows: bookings,
        });

        const dayStart = new Date("2026-11-03T21:00:00Z");
        const dayEnd = new Date("2026-11-04T21:00:00Z");

        const result = await findConfirmedBookingsForDate(
            "550e8400-e29b-41d4-a716-446655440000",
            dayStart,
            dayEnd,
        );

        expect(result).toEqual(bookings);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM bookings"),
            [
                "550e8400-e29b-41d4-a716-446655440000",
                dayStart,
                dayEnd,
            ],
        );
    });

    it("lists all weekly availability periods for a professional", async () => {
        const periods = [
            {
                availability_id: "period-1",
                day_of_week: 1,
                start_time: "09:00:00",
                end_time: "12:00:00",
            },
            {
                availability_id: "period-2",
                day_of_week: 1,
                start_time: "13:00:00",
                end_time: "17:00:00",
            },
        ];

        queryMock.mockResolvedValue({ rows: periods });

        const result = await listWeeklyAvailability("professional-1");

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM weekly_availability"),
            ["professional-1"],
        );
        expect(result).toEqual(periods);
    });

    it("creates a weekly availability period for a professional", async () => {
        const period = {
            availability_id: "period-1",
            day_of_week: 1,
            start_time: "09:00:00",
            end_time: "12:00:00",
        };

        queryMock.mockResolvedValue({ rows: [period] });

        const result = await createWeeklyAvailability({
            professionalId: "professional-1",
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "12:00",
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO weekly_availability"),
            ["professional-1", 1, "09:00", "12:00"],
        );
        expect(result).toEqual(period);
    });

    it("throws if creating a weekly availability period returns no row", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await expect(
            createWeeklyAvailability({
                professionalId: "professional-1",
                dayOfWeek: 1,
                startTime: "09:00",
                endTime: "12:00",
            }),
        ).rejects.toThrow("Failed to create weekly availability");
    });

    it("updates a weekly availability period belonging to a professional", async () => {
        const period = {
            availability_id: "period-1",
            day_of_week: 2,
            start_time: "10:00:00",
            end_time: "15:00:00",
        };

        queryMock.mockResolvedValue({ rows: [period] });

        const result = await updateWeeklyAvailability({
            availabilityId: "period-1",
            professionalId: "professional-1",
            dayOfWeek: 2,
            startTime: "10:00",
            endTime: "15:00",
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE weekly_availability"),
            ["period-1", "professional-1", 2, "10:00", "15:00"],
        );
        expect(result).toEqual(period);
    });

    it("returns null when no matching weekly availability period exists", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const result = await updateWeeklyAvailability({
            availabilityId: "period-1",
            professionalId: "professional-2",
            dayOfWeek: 2,
            startTime: "10:00",
            endTime: "15:00",
        });

        expect(result).toBeNull();
    });

    it("deletes a weekly availability period belonging to a professional", async () => {
        queryMock.mockResolvedValue({
            rows: [{ availability_id: "period-1" }],
            rowCount: 1,
        });

        const result = await deleteWeeklyAvailability(
            "period-1",
            "professional-1",
        );

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM weekly_availability"),
            ["period-1", "professional-1"],
        );
        expect(result).toBe(true);
    });

    it("returns false when no matching weekly availability period exists to delete", async () => {
        queryMock.mockResolvedValue({
            rows: [],
            rowCount: 0,
        });

        const result = await deleteWeeklyAvailability(
            "period-1",
            "professional-2",
        );

        expect(result).toBe(false);
    });

    it("lists all availability exceptions for a professional", async () => {
        const exceptions = [
            {
                exception_id: "exception-1",
                exception_date: "2026-12-25",
                is_available: false,
                start_time: null,
                end_time: null,
                reason: "Holiday",
            },
            {
                exception_id: "exception-2",
                exception_date: "2026-12-31",
                is_available: true,
                start_time: "10:00:00",
                end_time: "14:00:00",
                reason: "Reduced hours",
            },
        ];

        queryMock.mockResolvedValue({ rows: exceptions });

        const result = await listAvailabilityExceptions("professional-1");

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("FROM availability_exceptions"),
            ["professional-1"],
        );
        expect(result).toEqual(exceptions);
    });

    it("creates a closed-date exception", async () => {
        const exception = {
            exception_id: "exception-1",
            exception_date: "2026-12-25",
            is_available: false,
            start_time: null,
            end_time: null,
            reason: "Holiday",
        };

        queryMock.mockResolvedValue({ rows: [exception] });

        const result = await createAvailabilityException({
            professionalId: "professional-1",
            exceptionDate: "2026-12-25",
            isAvailable: false,
            reason: "Holiday",
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO availability_exceptions"),
            [
                "professional-1",
                "2026-12-25",
                false,
                null,
                null,
                "Holiday",
            ],
        );
        expect(result).toEqual(exception);
    });

    it("creates an exception with custom hours", async () => {
        const exception = {
            exception_id: "exception-2",
            exception_date: "2026-12-31",
            is_available: true,
            start_time: "10:00:00",
            end_time: "14:00:00",
            reason: "Reduced hours",
        };

        queryMock.mockResolvedValue({ rows: [exception] });

        const result = await createAvailabilityException({
            professionalId: "professional-1",
            exceptionDate: "2026-12-31",
            isAvailable: true,
            startTime: "10:00",
            endTime: "14:00",
            reason: "Reduced hours",
        });

        expect(result).toEqual(exception);
    });

    it("updates an availability exception belonging to a professional", async () => {
        const exception = {
            exception_id: "exception-1",
            exception_date: "2026-12-25",
            is_available: true,
            start_time: "10:00:00",
            end_time: "14:00:00",
            reason: "Updated hours",
        };

        queryMock.mockResolvedValue({ rows: [exception] });

        const result = await updateAvailabilityException({
            exceptionId: "exception-1",
            professionalId: "professional-1",
            exceptionDate: "2026-12-25",
            isAvailable: true,
            startTime: "10:00",
            endTime: "14:00",
            reason: "Updated hours",
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE availability_exceptions"),
            [
                "exception-1",
                "professional-1",
                "2026-12-25",
                true,
                "10:00",
                "14:00",
                "Updated hours",
            ],
        );
        expect(result).toEqual(exception);
    });

    it("returns null when the availability exception does not belong to the professional", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const result = await updateAvailabilityException({
            exceptionId: "exception-1",
            professionalId: "professional-2",
            exceptionDate: "2026-12-25",
            isAvailable: false,
        });

        expect(result).toBeNull();
    });

    it("deletes an availability exception belonging to a professional", async () => {
        queryMock.mockResolvedValue({
            rows: [{ exception_id: "exception-1" }],
            rowCount: 1,
        });

        const result = await deleteAvailabilityException(
            "exception-1",
            "professional-1",
        );

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM availability_exceptions"),
            ["exception-1", "professional-1"],
        );
        expect(result).toBe(true);
    });

    it("returns false when no matching availability exception exists to delete", async () => {
        queryMock.mockResolvedValue({ rows: [], rowCount: 0 });

        const result = await deleteAvailabilityException(
            "exception-1",
            "professional-2",
        );

        expect(result).toBe(false);
    });
});
