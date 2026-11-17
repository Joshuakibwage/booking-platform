import { describe, expect, it } from "vitest";
import { validatePublicProfessionalFilters } from "./public-professional.validator.js";

describe("validatePublicProfessionalFilters", () => {
    it("accepts an empty query", () => {
        expect(validatePublicProfessionalFilters({})).toEqual({});
    });

    it("accepts valid search and category filters", () => {
        expect(
            validatePublicProfessionalFilters({
                search: "barber",
                category: "beauty-personal-care",
            }),
        ).toEqual({
            search: "barber",
            category: "beauty-personal-care",
        });
    });

    it("trims whitespace from filters", () => {
        expect(
            validatePublicProfessionalFilters({
                search: "  barber  ",
                category: "  beauty-personal-care  ",
            }),
        ).toEqual({
            search: "barber",
            category: "beauty-personal-care",
        });
    });

    it("omits empty filters", () => {
        expect(
            validatePublicProfessionalFilters({
                search: " ",
                category: "",
            }),
        ).toEqual({});
    });

    it.each([null, undefined, [], "barber", 42])(
        "rejects invalid query values: %s",
        (query) => {
            expect(
                validatePublicProfessionalFilters(query),
            ).toBeNull();
        },
    );

    it("rejects non-string search values", () => {
        expect(
            validatePublicProfessionalFilters({ search: 123 }),
        ).toBeNull();
    });

    it("rejects non-string category values", () => {
        expect(
            validatePublicProfessionalFilters({ category: true }),
        ).toBeNull();
    });

    it("rejects search terms longer than 100 characters", () => {
        expect(
            validatePublicProfessionalFilters({
                search: "a".repeat(101),
            }),
        ).toBeNull();
    });

    it("rejects category slugs longer than 120 characters", () => {
        expect(
            validatePublicProfessionalFilters({
                category: "a".repeat(121),
            }),
        ).toBeNull();
    });
});