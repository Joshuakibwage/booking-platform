import { describe, expect, it } from "vitest";
import {
    validateCreateAvailabilityException,
    validateUpdateAvailabilityException,
} from "./availability-exception.validator.js";

describe("availability exception validator", () => {
    it("accepts a closed date without hours", () => {
        expect(
            validateCreateAvailabilityException({
                exceptionDate: "2026-12-25",
                isAvailable: false,
                reason: "Holiday",
            }),
        ).toEqual({
            exceptionDate: "2026-12-25",
            isAvailable: false,
            startTime: null,
            endTime: null,
            reason: "Holiday",
        });
    });

    it("accepts a date with custom hours", () => {
        expect(
            validateCreateAvailabilityException({
                exceptionDate: "2026-12-31",
                isAvailable: true,
                startTime: "10:00",
                endTime: "14:00",
                reason: "Reduced hours",
            }),
        ).toEqual({
            exceptionDate: "2026-12-31",
            isAvailable: true,
            startTime: "10:00",
            endTime: "14:00",
            reason: "Reduced hours",
        });
    });

    it("rejects an impossible calendar date", () => {
        expect(
            validateCreateAvailabilityException({
                exceptionDate: "2026-02-30",
                isAvailable: false,
            }),
        ).toBeNull();
    });

    it("rejects a closed date that includes hours", () => {
        expect(
            validateCreateAvailabilityException({
                exceptionDate: "2026-12-25",
                isAvailable: false,
                startTime: "09:00",
                endTime: "12:00",
            }),
        ).toBeNull();
    });

    it("rejects an available date without hours", () => {
        expect(
            validateCreateAvailabilityException({
                exceptionDate: "2026-12-25",
                isAvailable: true,
            }),
        ).toBeNull();
    });

    it("rejects custom hours where the end is not later", () => {
        expect(
            validateCreateAvailabilityException({
                exceptionDate: "2026-12-25",
                isAvailable: true,
                startTime: "14:00",
                endTime: "10:00",
            }),
        ).toBeNull();
    });

    it("rejects an invalid reason", () => {
        expect(
            validateCreateAvailabilityException({
                exceptionDate: "2026-12-25",
                isAvailable: false,
                reason: 123,
            }),
        ).toBeNull();
    });

    it("validates update input using the same rules", () => {
        expect(
            validateUpdateAvailabilityException({
                exceptionDate: "2026-12-25",
                isAvailable: false,
            }),
        ).toEqual({
            exceptionDate: "2026-12-25",
            isAvailable: false,
            startTime: null,
            endTime: null,
            reason: null,
        });
    });
});