import { describe, expect, it } from "vitest";

import { availabilityExceptionSchema } from "@/schemas/professional/availability-exception.schema";

describe("availabilityExceptionSchema", () => {
    const validDayOff = {
        exceptionDate: "2026-11-14",
        isAvailable: false,
        startTime: null,
        endTime: null,
        reason: "Personal commitments",
    };

    const validCustomHours = {
        exceptionDate: "2026-11-20",
        isAvailable: true,
        startTime: "10:00",
        endTime: "15:00",
        reason: "Adjusted working hours",
    };

    it("accepts a valid unavailable date", () => {
        const result = availabilityExceptionSchema.safeParse(validDayOff);

        expect(result.success).toBe(true);
    });

    it("accepts a valid exception with custom hours", () => {
        const result = availabilityExceptionSchema.safeParse(validCustomHours);

        expect(result.success).toBe(true);
    });

    it("rejects an invalid calendar date", () => {
        const result = availabilityExceptionSchema.safeParse({
            ...validDayOff,
            exceptionDate: "2026-02-30",
        });

        expect(result.success).toBe(false);
    });

    it("rejects unavailable dates with working hours", () => {
        const result = availabilityExceptionSchema.safeParse({
            ...validDayOff,
            startTime: "09:00",
            endTime: "17:00",
        });

        expect(result.success).toBe(false);
    });

    it("rejects available dates without valid working hours", () => {
        const result = availabilityExceptionSchema.safeParse({
            ...validCustomHours,
            startTime: null,
            endTime: null,
        });

        expect(result.success).toBe(false);
    });

    it("rejects custom hours when the end time is not later", () => {
        const result = availabilityExceptionSchema.safeParse({
            ...validCustomHours,
            startTime: "15:00",
            endTime: "10:00",
        });

        expect(result.success).toBe(false);
    });

    it("rejects a reason longer than 1000 characters", () => {
        const result = availabilityExceptionSchema.safeParse({
            ...validDayOff,
            reason: "a".repeat(1001),
        });

        expect(result.success).toBe(false);
    });
});