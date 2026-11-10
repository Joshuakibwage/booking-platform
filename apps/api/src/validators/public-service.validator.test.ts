import { describe, expect, it } from "vitest";
import { validatePublicServiceFilters } from "./public-service.validator.js";

describe("validatePublicServiceFilters", () => {
    it("accepts an empty query", () => {
        expect(validatePublicServiceFilters({})).toEqual({});
    });

    it("accepts valid search and category filters", () => {
        expect(
            validatePublicServiceFilters({
                search: "haircut",
                category: "beauty-personal-care",
            }),
        ).toEqual({
            search: "haircut",
            category: "beauty-personal-care",
        });
    });

    it("trims whitespace from filters", () => {
        expect(
            validatePublicServiceFilters({
                search: "  haircut  ",
                category: "  beauty-personal-care  ",
            }),
        ).toEqual({
            search: "haircut",
            category: "beauty-personal-care",
        });
    });

    it("omits filters containing only whitespace", () => {
        expect(
            validatePublicServiceFilters({
                search: "   ",
                category: " ",
            }),
        ).toEqual({});
    });

    it("rejects non-string search values", () => {
        expect(
            validatePublicServiceFilters({
                search: ["haircut"],
            }),
        ).toBeNull();
    });

    it("rejects non-string category values", () => {
        expect(
            validatePublicServiceFilters({
                category: 123,
            }),
        ).toBeNull();
    });

    it("rejects search values longer than 100 characters", () => {
        expect(
            validatePublicServiceFilters({
                search: "a".repeat(101),
            }),
        ).toBeNull();
    });

    it("rejects category values longer than 120 characters", () => {
        expect(
            validatePublicServiceFilters({
                category: "a".repeat(121),
            }),
        ).toBeNull();
    });

    it("rejects non-object query values", () => {
        expect(validatePublicServiceFilters(null)).toBeNull();
        expect(validatePublicServiceFilters([])).toBeNull();
        expect(validatePublicServiceFilters("haircut")).toBeNull();
    });
});