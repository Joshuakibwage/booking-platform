import { describe, it, expect } from "vitest";
import { validateLoginInput } from "./login.validator.js";

describe("validateLoginInput", () => {
    it("should accept valid input and normalize the email", () => {
        const result = validateLoginInput({
            email: "  JOE@EXAMPLE.COM  ",
            password: "short",
        });

        expect(result).toEqual({
            email: "joe@example.com",
            password: "short",
        });
    });

    it("should reject non-object input", () => {
        expect(validateLoginInput(null)).toBeNull();
        expect(validateLoginInput("joe@example.com")).toBeNull();
        expect(validateLoginInput([])).toBeNull();
    });

    it("should reject an invalid email", () => {
        expect(
            validateLoginInput({
                email: "not-an-email",
                password: "some-password",
            }),
        ).toBeNull();
    });

    it("should reject a missing or non-string email", () => {
        expect(
            validateLoginInput({
                password: "some-password",
            }),
        ).toBeNull();

        expect(
            validateLoginInput({
                email: 123,
                password: "some-password",
            }),
        ).toBeNull();
    });

    it("should reject a missing or non-string password", () => {
        expect(
            validateLoginInput({
                email: "joe@example.com",
            }),
        ).toBeNull();

        expect(
            validateLoginInput({
                email: "joe@example.com",
                password: 123,
            }),
        ).toBeNull();
    });

    it("should reject an empty password", () => {
        expect(
            validateLoginInput({
                email: "joe@example.com",
                password: "",
            }),
        ).toBeNull();
    });

    it("should reject a password longer than 128 characters", () => {
        expect(
            validateLoginInput({
                email: "joe@example.com",
                password: "a".repeat(129),
            }),
        ).toBeNull();
    });
});
