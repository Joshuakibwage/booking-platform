import { describe, expect, it } from "vitest";
import {
    validateCreateWeeklyAvailability,
    validateUpdateWeeklyAvailability,
} from "./weekly-availability.validator.js";

describe("weekly availability validator", () => {
    it("accepts valid weekly availability", () => {
        expect(
            validateCreateWeeklyAvailability({
                dayOfWeek: 1,
                startTime: "09:00",
                endTime: "17:00",
            }),
        ).toEqual({
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "17:00",
        });
    });

    it("rejects a weekday outside 1–7", () => {
        expect(
            validateCreateWeeklyAvailability({
                dayOfWeek: 8,
                startTime: "09:00",
                endTime: "17:00",
            }),
        ).toBeNull();
    });

    it("rejects invalid time formats", () => {
        expect(
            validateCreateWeeklyAvailability({
                dayOfWeek: 1,
                startTime: "9am",
                endTime: "17:00",
            }),
        ).toBeNull();
    });

    it("rejects an end time equal to the start time", () => {
        expect(
            validateCreateWeeklyAvailability({
                dayOfWeek: 1,
                startTime: "09:00",
                endTime: "09:00",
            }),
        ).toBeNull();
    });

    it("rejects an end time earlier than the start time", () => {
        expect(
            validateCreateWeeklyAvailability({
                dayOfWeek: 1,
                startTime: "17:00",
                endTime: "09:00",
            }),
        ).toBeNull();
    });

    it("rejects a non-object request body", () => {
        expect(validateCreateWeeklyAvailability(null)).toBeNull();
        expect(validateCreateWeeklyAvailability([])).toBeNull();
    });

    it("validates update input using the same schedule rules", () => {
        expect(
            validateUpdateWeeklyAvailability({
                dayOfWeek: 5,
                startTime: "10:00:00",
                endTime: "16:30:00",
            }),
        ).toEqual({
            dayOfWeek: 5,
            startTime: "10:00:00",
            endTime: "16:30:00",
        });
    });
});