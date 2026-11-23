
import { describe, expect, it } from "vitest";
import {
    validatePublicServiceFilters,
    validatePublicServiceId,
} from "./public-service.validator.js";

describe("validatePublicServiceFilters", () => {
    const professionalId = "550e8400-e29b-41d4-a716-446655440000";

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

    it("accepts a valid professional ID filter", () => {
        expect(
            validatePublicServiceFilters({ professionalId }),
        ).toEqual({ professionalId });
    });

    it("accepts all three filters together", () => {
        expect(
            validatePublicServiceFilters({
                search: "haircut",
                category: "beauty-personal-care",
                professionalId,
            }),
        ).toEqual({
            search: "haircut",
            category: "beauty-personal-care",
            professionalId,
        });
    });

    it("trims whitespace from filters", () => {
        expect(
            validatePublicServiceFilters({
                search: "  haircut  ",
                category: "  beauty-personal-care  ",
                professionalId: `  ${professionalId}  `,
            }),
        ).toEqual({
            search: "haircut",
            category: "beauty-personal-care",
            professionalId,
        });
    });

    it("omits filters containing only whitespace", () => {
        expect(
            validatePublicServiceFilters({
                search: "   ",
                category: " ",
                professionalId: " ",
            }),
        ).toEqual({});
    });

    it("rejects non-string search values", () => {
        expect(
            validatePublicServiceFilters({ search: ["haircut"] }),
        ).toBeNull();
    });

    it("rejects non-string category values", () => {
        expect(
            validatePublicServiceFilters({ category: 123 }),
        ).toBeNull();
    });

    it("rejects non-string professional IDs", () => {
        expect(
            validatePublicServiceFilters({ professionalId: 123 }),
        ).toBeNull();
    });

    it("rejects invalid professional UUIDs", () => {
        expect(
            validatePublicServiceFilters({
                professionalId: "not-a-uuid",
            }),
        ).toBeNull();
    });

    it("rejects search values longer than 100 characters", () => {
        expect(
            validatePublicServiceFilters({ search: "a".repeat(101) }),
        ).toBeNull();
    });

    it("rejects category values longer than 120 characters", () => {
        expect(
            validatePublicServiceFilters({ category: "a".repeat(121) }),
        ).toBeNull();
    });

    it("rejects non-object query values", () => {
        expect(validatePublicServiceFilters(null)).toBeNull();
        expect(validatePublicServiceFilters([])).toBeNull();
        expect(validatePublicServiceFilters("haircut")).toBeNull();
    });

});

describe("validatePublicServiceId", () => {
    const serviceId = "550e8400-e29b-41d4-a716-446655440000";

    it("accepts a valid service UUID", () => {
        expect(validatePublicServiceId(serviceId)).toBe(serviceId);
    });

    it("rejects an invalid UUID", () => {
        expect(validatePublicServiceId("not-a-uuid")).toBeNull();
    });

    it("rejects non-string values", () => {
        expect(validatePublicServiceId(undefined)).toBeNull();
        expect(validatePublicServiceId(null)).toBeNull();
        expect(validatePublicServiceId(123)).toBeNull();
    });
});
