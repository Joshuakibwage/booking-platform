
import { describe, it, expect } from "vitest";
import { validateBookingInput } from "./booking.validator.js";

const validInput = {
    customerId: "550e8400-e29b-41d4-a716-446655440000",
    serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    startTime: "2026-11-02T09:00:00+03:00",
};

describe("validateBookingInput", () => {
    it("accepts a valid booking request", () => {
        expect(validateBookingInput(validInput)).toEqual(validInput);
    });

    it("rejects a non-object input", () => {
        expect(validateBookingInput(null)).toBeNull();
        expect(validateBookingInput([])).toBeNull();
        expect(validateBookingInput("invalid")).toBeNull();
    });

    it("rejects invalid customer and service UUIDs", () => {
        expect(
            validateBookingInput({
                ...validInput,
                customerId: "not-a-uuid",
            }),
        ).toBeNull();

        expect(
            validateBookingInput({
                ...validInput,
                serviceId: "not-a-uuid",
            }),
        ).toBeNull();
    });

    it("rejects an invalid start time", () => {
        expect(
            validateBookingInput({
                ...validInput,
                startTime: "not-a-date",
            }),
        ).toBeNull();
    });

    it("rejects a start time without an explicit timezone", () => {
        expect(
            validateBookingInput({
                ...validInput,
                startTime: "2026-11-02T09:00:00",
            }),
        ).toBeNull();
    });
});
