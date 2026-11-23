
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
    findPublicServiceById,
    findPublicServices,
} from "./service.repository.js";

describe("findPublicServices", () => {
    const professionalId = "550e8400-e29b-41d4-a716-446655440000";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns public services with professional and category details", async () => {
        const services = [
            {
                service_id: "service-1",
                professional_id: professionalId,
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
        expect(query).toContain(
            "s.professional_id = $3::uuid",
        );

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            null,
            null,
            null,
        ]);
    });

    it("filters services by search term", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({
            search: "haircut",
        });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            "haircut",
            null,
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
            null,
        ]);
    });

    it("filters services by professional ID", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({ professionalId });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            null,
            null,
            professionalId,
        ]);
    });

    it("supports all three filters together", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({
            search: "haircut",
            category: "beauty-personal-care",
            professionalId,
        });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            "haircut",
            "beauty-personal-care",
            professionalId,
        ]);
    });

    it("trims whitespace from filters", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        await findPublicServices({
            search: "  haircut  ",
            category: "  beauty-personal-care  ",
            professionalId: `  ${professionalId}  `,
        });

        expect(queryMock.mock.calls[0]?.[1]).toEqual([
            "haircut",
            "beauty-personal-care",
            professionalId,
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


describe("findPublicServiceById", () => {
    const serviceId = "550e8400-e29b-41d4-a716-446655440000";

    it("returns a public service by ID", async () => {
        const service = {
            service_id: serviceId,
            professional_id: "550e8400-e29b-41d4-a716-446655440001",
            category_id: null,
            name: "Haircut",
            description: "Professional haircut service",
            duration_minutes: 45,
            price: "1500.00",
            professional_name: "Alex",
            category_name: null,
            category_slug: null,
        };

        queryMock.mockResolvedValue({ rows: [service] });

        const result = await findPublicServiceById(serviceId);

        expect(result).toEqual(service);
        expect(queryMock).toHaveBeenCalledOnce();

        const query = queryMock.mock.calls[0]?.[0];

        expect(query).toContain("WHERE s.service_id = $1");
        expect(query).toContain("s.is_active = TRUE");
        expect(query).toContain("JOIN professional_profiles AS p");
        expect(query).toContain("LEFT JOIN service_categories AS c");
        expect(query).toContain("LIMIT 1");

        expect(queryMock.mock.calls[0]?.[1]).toEqual([serviceId]);
    });

    it("returns null when the service does not exist or is inactive", async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const result = await findPublicServiceById(serviceId);

        expect(result).toBeNull();
    });
});