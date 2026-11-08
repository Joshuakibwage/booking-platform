
import { describe, expect, it } from "vitest";
import {
    validateCreateProfessionalProfile,
    validateUpdateProfessionalProfile,
} from "./professional-profile.validator.js";

describe("validateCreateProfessionalProfile", () => {
    it("accepts a valid profile", () => {
        expect(
            validateCreateProfessionalProfile({
                publicName: "Joe's Barbershop",
                bio: "Experienced barber",
                timeZone: "Africa/Nairobi",
            }),
        ).toEqual({
            publicName: "Joe's Barbershop",
            bio: "Experienced barber",
            timeZone: "Africa/Nairobi",
        });
    });

    it("accepts an omitted biography", () => {
        expect(
            validateCreateProfessionalProfile({
                publicName: "Joe's Barbershop",
                timeZone: "Africa/Nairobi",
            }),
        ).toEqual({
            publicName: "Joe's Barbershop",
            timeZone: "Africa/Nairobi",
        });
    });

    it("trims whitespace around the public name", () => {
        expect(
            validateCreateProfessionalProfile({
                publicName: "  Joe's Barbershop  ",
                timeZone: "Africa/Nairobi",
            }),
        ).toEqual({
            publicName: "Joe's Barbershop",
            timeZone: "Africa/Nairobi",
        });
    });

    it("rejects a missing or invalid public name", () => {
        expect(
            validateCreateProfessionalProfile({
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();

        expect(
            validateCreateProfessionalProfile({
                publicName: "",
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();

        expect(
            validateCreateProfessionalProfile({
                publicName: "   ",
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();

        expect(
            validateCreateProfessionalProfile({
                publicName: 123,
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();

        expect(
            validateCreateProfessionalProfile({
                publicName: "a".repeat(101),
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();
    });

    it("rejects a missing or invalid time zone", () => {
        expect(
            validateCreateProfessionalProfile({
                publicName: "Joe's Barbershop",
            }),
        ).toBeNull();

        expect(
            validateCreateProfessionalProfile({
                publicName: "Joe's Barbershop",
                timeZone: "Not/ARealZone",
            }),
        ).toBeNull();
    });

    it("rejects a biography that is not a string or null", () => {
        expect(
            validateCreateProfessionalProfile({
                publicName: "Joe's Barbershop",
                bio: 123,
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();
    });

    it("rejects a biography longer than 5000 characters", () => {
        expect(
            validateCreateProfessionalProfile({
                publicName: "Joe's Barbershop",
                bio: "a".repeat(5001),
                timeZone: "Africa/Nairobi",
            }),
        ).toBeNull();
    });
});

describe("validateUpdateProfessionalProfile", () => {
    it("accepts a public-name-only update", () => {
        expect(
            validateUpdateProfessionalProfile({
                publicName: "Joe's Barbershop",
            }),
        ).toEqual({
            publicName: "Joe's Barbershop",
        });
    });

    it("trims whitespace around an updated public name", () => {
        expect(
            validateUpdateProfessionalProfile({
                publicName: "  Joe's Barbershop  ",
            }),
        ).toEqual({
            publicName: "Joe's Barbershop",
        });
    });

    it("rejects an invalid public name", () => {
        expect(
            validateUpdateProfessionalProfile({
                publicName: "",
            }),
        ).toBeNull();

        expect(
            validateUpdateProfessionalProfile({
                publicName: "   ",
            }),
        ).toBeNull();

        expect(
            validateUpdateProfessionalProfile({
                publicName: 123,
            }),
        ).toBeNull();

        expect(
            validateUpdateProfessionalProfile({
                publicName: "a".repeat(101),
            }),
        ).toBeNull();
    });

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
