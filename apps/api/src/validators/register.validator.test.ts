
import { describe, it, expect } from "vitest";
import { validateRegisterInput } from "./register.validator.js";

describe("validateRegisterInput", () => {
    it("accepts valid input and normalizes the email", () => {
        expect(
            validateRegisterInput({
                email: "  JOE@example.com ",
                password: "secure-password-123",
                displayName: "  Joe Kibwage  ",
            }),
        ).toEqual({
            email: "joe@example.com",
            password: "secure-password-123",
            displayName: "Joe Kibwage",
        });
    });

    it("rejects input that is not an object", () => {
        expect(validateRegisterInput(null)).toBeNull();
        expect(validateRegisterInput("invalid")).toBeNull();
        expect(validateRegisterInput([])).toBeNull();
    });

    it("rejects an invalid email", () => {
        expect(
            validateRegisterInput({
                email: "not-an-email",
                password: "secure-password-123",
                displayName: "Joe",
            }),
        ).toBeNull();
    });

    it("rejects passwords outside the allowed length", () => {
        expect(
            validateRegisterInput({
                email: "joe@example.com",
                password: "short",
                displayName: "Joe",
            }),
        ).toBeNull();

        expect(
            validateRegisterInput({
                email: "joe@example.com",
                password: "a".repeat(129),
                displayName: "Joe",
            }),
        ).toBeNull();
    });

    it("rejects invalid display names", () => {
        expect(
            validateRegisterInput({
                email: "joe@example.com",
                password: "secure-password-123",
                displayName: " ",
            }),
        ).toBeNull();

        expect(
            validateRegisterInput({
                email: "joe@example.com",
                password: "secure-password-123",
                displayName: "a".repeat(101),
            }),
        ).toBeNull();
    });
});
