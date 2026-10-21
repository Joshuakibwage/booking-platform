
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    findExceptionMock,
    findWeeklyAvailabilityMock,
} = vi.hoisted(() => ({
    findExceptionMock: vi.fn(),
    findWeeklyAvailabilityMock: vi.fn(),
}));

vi.mock("../repositories/availability.repository.js", () => ({
    findAvailabilityException: findExceptionMock,
    findWeeklyAvailability: findWeeklyAvailabilityMock,
}));

import { isWithinAvailability } from "./availability.service.js";

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
