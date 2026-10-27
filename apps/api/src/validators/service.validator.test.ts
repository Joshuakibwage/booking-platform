
import { describe, expect, it } from "vitest";
import {
    validateCreateService,
    validateUpdateService,
} from "./service.validator.js";

describe("validateCreateService", () => {
    it("accepts valid service input", () => {
        const result = validateCreateService({
            name: "  Haircut  ",
            description: "A standard haircut",
            durationMinutes: 30,
            price: 500.5,
        });

        expect(result).toEqual({
            name: "Haircut",
            description: "A standard haircut",
            durationMinutes: 30,
            price: 500.5,
        });
    });

    it("accepts a service without a description", () => {
        const result = validateCreateService({
            name: "Haircut",
            durationMinutes: 30,
            price: 500,
        });

        expect(result).toEqual({
            name: "Haircut",
            durationMinutes: 30,
            price: 500,
        });
    });

    it("rejects a missing or invalid name", () => {
        const invalidNames: unknown[] = [
            undefined,
            null,
            "",
            "   ",
            123,
            "a".repeat(121),
        ];

        for (const name of invalidNames) {
            expect(
                validateCreateService({
                    name,
                    durationMinutes: 30,
                    price: 500,
                }),
            ).toBeNull();
        }
    });

    it("rejects invalid durations", () => {
        const invalidDurations: unknown[] = [
            undefined,
            null,
            0,
            -1,
            1.5,
            "30",
            NaN,
            Infinity,
        ];

        for (const durationMinutes of invalidDurations) {
            expect(
                validateCreateService({
                    name: "Haircut",
                    durationMinutes,
                    price: 500,
                }),
            ).toBeNull();
        }
    });

    it("rejects invalid prices", () => {
        const invalidPrices: unknown[] = [
            undefined,
            null,
            -1,
            "500",
            NaN,
            Infinity,
        ];

        for (const price of invalidPrices) {
            expect(
                validateCreateService({
                    name: "Haircut",
                    durationMinutes: 30,
                    price,
                }),
            ).toBeNull();
        }
    });

    it("rejects descriptions that are not strings or null", () => {
        const invalidDescriptions: unknown[] = [
            123,
            false,
            {},
            "a".repeat(5001),
        ];

        for (const description of invalidDescriptions) {
            expect(
                validateCreateService({
                    name: "Haircut",
                    description,
                    durationMinutes: 30,
                    price: 500,
                }),
            ).toBeNull();
        }
    });

    it("rejects prices with more than two decimal places", () => {
        const result = validateCreateService({
            name: "Haircut",
            durationMinutes: 30,
            price: 500.123,
        });

        expect(result).toBeNull();
    });

    it("rejects prices exceeding the database range", () => {
        const result = validateCreateService({
            name: "Haircut",
            durationMinutes: 30,
            price: 100_000_000,
        });

        expect(result).toBeNull();
    });

    it("accepts the maximum database price", () => {
        const result = validateCreateService({
            name: "Haircut",
            durationMinutes: 30,
            price: 99_999_999.99,
        });

        expect(result).not.toBeNull();
        expect(result?.price).toBe(99_999_999.99);
    });

    it("rejects non-object input", () => {
        const invalidInputs: unknown[] = [
            null,
            undefined,
            [],
            "Haircut",
            123,
        ];

        for (const input of invalidInputs) {
            expect(validateCreateService(input)).toBeNull();
        }
    });
});

describe("validateUpdateService", () => {
    it("accepts a partial update containing only a name", () => {
        expect(
            validateUpdateService({
                name: "Premium Haircut",
            }),
        ).toEqual({
            name: "Premium Haircut",
        });
    });

    it("accepts a partial update containing only a price", () => {
        expect(
            validateUpdateService({
                price: 750.25,
            }),
        ).toEqual({
            price: 750.25,
        });
    });

    it("accepts null to clear the description", () => {
        expect(
            validateUpdateService({
                description: null,
            }),
        ).toEqual({
            description: null,
        });
    });

    it("accepts a valid update containing multiple fields", () => {
        expect(
            validateUpdateService({
                name: "  Premium Haircut ",
                description: "Updated description",
                durationMinutes: 45,
                price: 850,
            }),
        ).toEqual({
            name: "Premium Haircut",
            description: "Updated description",
            durationMinutes: 45,
            price: 850,
        });
    });

    it("rejects an empty update", () => {
        expect(validateUpdateService({})).toBeNull();
    });

    it("rejects invalid update values", () => {
        const invalidUpdates: unknown[] = [
            { name: "   " },
            { name: "a".repeat(121) },
            { description: 123 },
            { description: "a".repeat(5001) },
            { durationMinutes: 0 },
            { durationMinutes: -5 },
            { durationMinutes: 2.5 },
            { price: -1 },
            { price: "500" },
            { price: 500.123 },
            { price: 100_000_000 },
        ];

        for (const update of invalidUpdates) {
            expect(validateUpdateService(update)).toBeNull();
        }
    });

    it("rejects non-object input", () => {
        const invalidInputs: unknown[] = [
            null,
            undefined,
            [],
            "Haircut",
            123,
        ];

        for (const input of invalidInputs) {
            expect(validateUpdateService(input)).toBeNull();
        }
    });
});
