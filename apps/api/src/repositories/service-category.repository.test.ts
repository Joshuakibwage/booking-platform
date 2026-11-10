import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: queryMock,
    },
}));

import {
    findActiveServiceCategories,
    findActiveServiceCategoryBySlug,
} from "./service-category.repository.js";

describe("service category repository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findActiveServiceCategories", () => {
        it("returns active categories ordered by display order", async () => {
            const categories = [
                {
                    category_id: "category-1",
                    name: "Beauty & personal care",
                    slug: "beauty-personal-care",
                },
                {
                    category_id: "category-2",
                    name: "Health & wellness",
                    slug: "health-wellness",
                },
            ];

            queryMock.mockResolvedValue({ rows: categories });

            const result = await findActiveServiceCategories();

            expect(result).toEqual(categories);
            expect(queryMock).toHaveBeenCalledOnce();

            const query = queryMock.mock.calls[0]?.[0];

            expect(query).toContain("WHERE is_active = TRUE");
            expect(query).toContain(
                "ORDER BY display_order ASC, name ASC",
            );
        });

        it("returns an empty array when no active categories exist", async () => {
            queryMock.mockResolvedValue({ rows: [] });

            const result = await findActiveServiceCategories();

            expect(result).toEqual([]);
        });
    });

    describe("findActiveServiceCategoryBySlug", () => {
        it("returns an active category matching the slug", async () => {
            const category = {
                category_id: "category-1",
                name: "Beauty & personal care",
                slug: "beauty-personal-care",
            };

            queryMock.mockResolvedValue({ rows: [category] });

            const result =
                await findActiveServiceCategoryBySlug(
                    "beauty-personal-care",
                );

            expect(result).toEqual(category);
            expect(queryMock).toHaveBeenCalledWith(
                expect.stringContaining("WHERE slug = $1"),
                ["beauty-personal-care"],
            );
        });

        it("returns null when the category does not exist or is inactive", async () => {
            queryMock.mockResolvedValue({ rows: [] });

            const result =
                await findActiveServiceCategoryBySlug("unknown-category");

            expect(result).toBeNull();
        });
    });
});