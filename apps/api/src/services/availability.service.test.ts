
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    generateCandidateSlots,
    getAvailableSlots,
    isWithinAvailability,
} from "./availability.service.js";

const {
    findExceptionMock,
    findWeeklyAvailabilityMock,
    findConfirmedBookingsMock,
    findActiveServiceMock,
} = vi.hoisted(() => ({
    findExceptionMock: vi.fn(),
    findWeeklyAvailabilityMock: vi.fn(),
    findConfirmedBookingsMock: vi.fn(),
    findActiveServiceMock: vi.fn(),
}));

vi.mock("../repositories/availability.repository.js", () => ({
    findAvailabilityException: findExceptionMock,
    findWeeklyAvailability: findWeeklyAvailabilityMock,
    findConfirmedBookingsForDate: findConfirmedBookingsMock,
}));

vi.mock("../repositories/service.repository.js", () => ({
    findActiveServiceById: findActiveServiceMock,
}));

const professionalId = "550e8400-e29b-41d4-a716-446655440000";
const timeZone = "Africa/Nairobi";

describe("isWithinAvailability", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findExceptionMock.mockResolvedValue(null);
        findWeeklyAvailabilityMock.mockResolvedValue([
            { start_time: "09:00:00", end_time: "17:00:00" },
        ]);
    });

    it("accepts an appointment inside weekly availability", async () => {
        const result = await isWithinAvailability(
            professionalId,
            timeZone,
            new Date("2026-11-02T07:00:00Z"),
            new Date("2026-11-02T07:30:00Z"),
        );

        // 10:00–10:30 in Nairobi.
        expect(result).toBe(true);
        expect(findWeeklyAvailabilityMock).toHaveBeenCalledWith(
            professionalId,
            1,
            undefined,
        );
    });

    it("rejects an appointment outside weekly availability", async () => {
        const result = await isWithinAvailability(
            professionalId,
            timeZone,
            new Date("2026-11-02T14:30:00Z"),
            new Date("2026-11-02T15:30:00Z"),
        );

        // 17:30–18:30 in Nairobi.
        expect(result).toBe(false);
    });

    it("rejects an appointment on a closed exception date", async () => {
        findExceptionMock.mockResolvedValue({
            is_available: false,
            start_time: null,
            end_time: null,
        });

        const result = await isWithinAvailability(
            professionalId,
            timeZone,
            new Date("2026-11-02T07:00:00Z"),
            new Date("2026-11-02T07:30:00Z"),
        );

        expect(result).toBe(false);
        expect(findWeeklyAvailabilityMock).not.toHaveBeenCalled();
    });

    it("uses an available exception window instead of weekly hours", async () => {
        findExceptionMock.mockResolvedValue({
            is_available: true,
            start_time: "11:00:00",
            end_time: "13:00:00",
        });

        const result = await isWithinAvailability(
            professionalId,
            timeZone,
            new Date("2026-11-02T08:00:00Z"),
            new Date("2026-11-02T08:30:00Z"),
        );

        // 11:00–11:30 in Nairobi.
        expect(result).toBe(true);
        expect(findWeeklyAvailabilityMock).not.toHaveBeenCalled();
    });

    it("rejects an appointment that crosses a local date boundary", async () => {
        const result = await isWithinAvailability(
            professionalId,
            timeZone,
            new Date("2026-11-02T20:30:00Z"),
            new Date("2026-11-02T21:30:00Z"),
        );

        // 23:30 on Nov 2 to 00:30 on Nov 3 in Nairobi.
        expect(result).toBe(false);
    });
});

describe("generateCandidateSlots", () => {
    it("generates slots that fit within the working window", () => {
        const slots = generateCandidateSlots(
            "10:00:00",
            "12:00:00",
            60,
        );

        expect(slots).toHaveLength(5);

        expect(slots[0]).toEqual({
            startTime: "10:00",
            endTime: "11:00",
        });

        expect(slots[4]).toEqual({
            startTime: "11:00",
            endTime: "12:00",
        });
    });

    it("returns no slots when the service is longer than the window", () => {
        const slots = generateCandidateSlots(
            "10:00:00",
            "10:30:00",
            60,
        );

        expect(slots).toEqual([]);
    });
});

describe("getAvailableSlots", () => {
    const serviceId = "660e8400-e29b-41d4-a716-446655440000";
    const date = "2026-11-04";

    beforeEach(() => {
        vi.clearAllMocks();

        findActiveServiceMock.mockResolvedValue({
            service_id: serviceId,
            professional_id: professionalId,
            name: "Consultation",
            duration_minutes: 60,
            price: "1500.00",
            time_zone: timeZone,
        });

        findExceptionMock.mockResolvedValue(null);

        findWeeklyAvailabilityMock.mockResolvedValue([
            {
                start_time: "10:00:00",
                end_time: "13:00:00",
            },
        ]);

        findConfirmedBookingsMock.mockResolvedValue([]);
    });

    it("returns all candidate slots and the professional's time zone when there are no bookings", async () => {
        const result = await getAvailableSlots(
            professionalId,
            serviceId,
            date,
        );

        expect(result).not.toBeNull();
        expect(result?.timeZone).toBe(timeZone);
        expect(result?.slots).toHaveLength(9);

        expect(result?.slots[0]).toEqual({
            startTime: "10:00",
            endTime: "11:00",
        });

        expect(result?.slots[8]).toEqual({
            startTime: "12:00",
            endTime: "13:00",
        });
    });

    it("excludes slots that overlap confirmed bookings", async () => {
        findConfirmedBookingsMock.mockResolvedValue([
            {
                start_time: new Date("2026-11-04T08:00:00Z"),
                end_time: new Date("2026-11-04T09:00:00Z"),
            },
        ]);

        const result = await getAvailableSlots(
            professionalId,
            serviceId,
            date,
        );

        // The booking is 11:00–12:00 in Nairobi.
        expect(result?.slots).toEqual([
            {
                startTime: "10:00",
                endTime: "11:00",
            },
            {
                startTime: "12:00",
                endTime: "13:00",
            },
        ]);
    });

    it("returns no slots when the professional has no working windows", async () => {
        findWeeklyAvailabilityMock.mockResolvedValue([]);

        const result = await getAvailableSlots(
            professionalId,
            serviceId,
            date,
        );

        expect(result).toEqual({
            timeZone,
            slots: [],
        });

        expect(findConfirmedBookingsMock).not.toHaveBeenCalled();
    });

    it("returns null when the service does not belong to the professional", async () => {
        findActiveServiceMock.mockResolvedValue({
            service_id: serviceId,
            professional_id: "770e8400-e29b-41d4-a716-446655440000",
            name: "Consultation",
            duration_minutes: 60,
            price: "1500.00",
            time_zone: timeZone,
        });

        const result = await getAvailableSlots(
            professionalId,
            serviceId,
            date,
        );

        expect(result).toBeNull();
        expect(findWeeklyAvailabilityMock).not.toHaveBeenCalled();
        expect(findConfirmedBookingsMock).not.toHaveBeenCalled();
    });
});
