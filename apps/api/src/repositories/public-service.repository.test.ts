import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: queryMock,
    },
}));

import { findPublicServices } from "./service.repository.js";

describe("findPublicServices", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns public services with professional and category details", async () => {
        const services = [
            {
                service_id: "service-1",
                professional_id: "professional-1",
                category_id: "category-1",
                name: "Haircut",
                description: "Professional haircut service",
                duration_minutes: 45,
                price: "1500.00",
                professional_name: "Alex",
                category_name: "Beauty & personal care",
                category_slug: "beauty-personal-care",
            },
        ];

        queryMock.mockResolvedValue({ rows: services });

        const result = await findPublicServices();

        expect(result).toEqual(services);
        expect(queryMock).toHaveBeenCalledOnce();

        const query = queryMock.mock.calls[0]?.[0];

        expect(query).toContain("s.is_active = TRUE");
        expect(query).toContain("JOIN professional_profiles AS p");
        expect(query).toContain("LEFT JOIN service_categories AS c");
        expect(query).toContain("p.public_name AS professional_name");
        expect(query).toContain(
            "ORDER BY s.created_at DESC, s.service_id DESC",
        );
        expect(queryMock.mock.calls[0]?.[1]).toEqual([null, null]);
    });

    it("filters services by search term", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({
            search: "haircut",
        });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            "haircut",
            null,
        ]);
    });

    it("filters services by category slug", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({
            category: "beauty-personal-care",
        });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            null,
            "beauty-personal-care",
        ]);
    });

    it("supports search and category filters together", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({
            search: "haircut",
            category: "beauty-personal-care",
        });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            "haircut",
            "beauty-personal-care",
        ]);
    });

    it("trims whitespace from search and category filters", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({
            search: "  haircut  ",
            category: "  beauty-personal-care  ",
        });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            "haircut",
            "beauty-personal-care",
        ]);
    });

    it("returns an empty array when no matching services exist", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const result = await findPublicServices({
            search: "nonexistent",
        });

        expect(result).toEqual([]);
    });
});