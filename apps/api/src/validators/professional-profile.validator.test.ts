
import { describe, expect, it } from "vitest";
import {
    validateCreateProfessionalProfile,
    validateUpdateProfessionalProfile,
} from "./professional-profile.validator.js";

describe("validateCreateProfessionalProfile", () => {
    it("accepts a valid profile", () => {
        expect(
            validateCreateProfessionalProfile({
                bio: "Experienced barber",
                timeZone: "Africa/Nairobi",
            }),
        ).toEqual({
            bio: "Experienced barber",
            timeZone: "Africa/Nairobi",
        });
    });

    it("accepts an omitted biography", () => {
        expect(
            validateCreateProfessionalProfile({
                timeZone: "Africa/Nairobi",
            }),
        ).toEqual({
            timeZone: "Africa/Nairobi",
        });
    });

    it("rejects a missing or invalid time zone", () => {
        expect(
            validateCreateProfessionalProfile({
                bio: "Experienced barber",
            }),
        ).toBeNull();

        expect(
            validateCreateProfessionalProfile({
                timeZone: "Not/ARealZone",
            }),
        ).toBeNull();
    });

    it("rejects a biography that is not a string or null", () => {
        expect(
            validateCreateProfessionalProfile({
                bio: 123,
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();
    });

    it("rejects a biography longer than 5000 characters", () => {
        expect(
            validateCreateProfessionalProfile({
                bio: "a".repeat(5001),
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();
    });
});

describe("validateUpdateProfessionalProfile", () => {
    it("accepts a biography-only update", () => {
        expect(
            validateUpdateProfessionalProfile({
                bio: "Senior barber",
            }),
        ).toEqual({
            bio: "Senior barber",
        });
    });

    it("allows explicitly clearing the biography", () => {
        expect(
            validateUpdateProfessionalProfile({
                bio: null,
            }),
        ).toEqual({
            bio: null,
        });
    });

    it("accepts a time-zone-only update", () => {
        expect(
            validateUpdateProfessionalProfile({
                timeZone: "Africa/Nairobi",
            }),
        ).toEqual({
            timeZone: "Africa/Nairobi",
        });
    });

    it("rejects an empty update", () => {
        expect(
            validateUpdateProfessionalProfile({}),
        ).toBeNull();
    });

    it("rejects an invalid time zone", () => {
        expect(
            validateUpdateProfessionalProfile({
                timeZone: "Not/ARealZone",
            }),
        ).toBeNull();
    });

    it("rejects non-object bodies", () => {
        expect(validateUpdateProfessionalProfile(null)).toBeNull();
        expect(validateUpdateProfessionalProfile([])).toBeNull();
        expect(validateUpdateProfessionalProfile("bio")).toBeNull();
    });
});
