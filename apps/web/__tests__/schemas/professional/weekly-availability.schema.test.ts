import { describe, expect, it } from "vitest";

import { weeklyAvailabilitySchema } from "@/schemas/professional/weekly-availability.schema";

describe("weeklyAvailabilitySchema", () => {
    const validAvailability = {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
    };

    it("accepts valid weekly availability", () => {
        const result = weeklyAvailabilitySchema.safeParse(validAvailability);

        expect(result.success).toBe(true);
    });

    it("rejects a day outside the ISO weekday range", () => {
        const result = weeklyAvailabilitySchema.safeParse({
            ...validAvailability,
            dayOfWeek: 0,
        });

        expect(result.success).toBe(false);
    });

    it("rejects invalid time formats", () => {
        const result = weeklyAvailabilitySchema.safeParse({
            ...validAvailability,
            startTime: "9 AM",
        });

        expect(result.success).toBe(false);
    });

    it("rejects an end time earlier than the start time", () => {
        const result = weeklyAvailabilitySchema.safeParse({
            ...validAvailability,
            startTime: "17:00",
            endTime: "09:00",
        });

        expect(result.success).toBe(false);
    });

    it("rejects equal start and end times", () => {
        const result = weeklyAvailabilitySchema.safeParse({
            ...validAvailability,
            startTime: "09:00",
            endTime: "09:00",
        });

        expect(result.success).toBe(false);
    });
});