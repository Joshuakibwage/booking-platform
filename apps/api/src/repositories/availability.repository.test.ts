
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    findAvailabilityException,
    findWeeklyAvailability,
    findConfirmedBookingsForDate,
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
});
