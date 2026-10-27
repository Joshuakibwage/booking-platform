
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
    createService,
    deactivateService,
    findActiveServiceById,
    findActiveServicesByProfessionalId,
    updateService,
} from "./service.repository.js";

const service = {
    service_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    professional_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Consultation",
    duration_minutes: 30,
    price: "1500.00",
    time_zone: "Africa/Nairobi",
};

describe("findActiveServiceById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the active service when found", async () => {
        queryMock.mockResolvedValue({
            rows: [service],
        });

        const result = await findActiveServiceById(
            service.service_id,
        );

        expect(result).toEqual(service);
        expect(queryMock).toHaveBeenCalledOnce();
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("s.is_active = TRUE"),
            [service.service_id],
        );
    });

    it("returns null when the service does not exist or is inactive", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await findActiveServiceById(
            service.service_id,
        );

        expect(result).toBeNull();
    });
});

describe("createService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a service and returns the created record", async () => {
        const createdService = {
            service_id: service.service_id,
            professional_id: service.professional_id,
            name: "Consultation",
            description: "A 30-minute consultation",
            duration_minutes: 30,
            price: "1500.00",
            is_active: true,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        queryMock.mockResolvedValue({
            rows: [createdService],
        });

        const result = await createService({
            professionalId: service.professional_id,
            name: "Consultation",
            description: "A 30-minute consultation",
            durationMinutes: 30,
            price: 1500,
        });

        expect(result).toEqual(createdService);

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO services"),
            [
                service.professional_id,
                "Consultation",
                "A 30-minute consultation",
                30,
                1500,
            ],
        );
    });

    it("uses null when the description is omitted", async () => {
        queryMock.mockResolvedValue({
            rows: [
                {
                    service_id: service.service_id,
                    professional_id: service.professional_id,
                    name: "Consultation",
                    description: null,
                    duration_minutes: 30,
                    price: "1500.00",
                    is_active: true,
                    created_at: new Date("2026-10-27T07:00:00.000Z"),
                },
            ],
        });

        await createService({
            professionalId: service.professional_id,
            name: "Consultation",
            durationMinutes: 30,
            price: 1500,
        });

        expect(queryMock).toHaveBeenCalledWith(
            expect.any(String),
            [
                service.professional_id,
                "Consultation",
                null,
                30,
                1500,
            ],
        );
    });

    it("throws if the insert returns no record", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        await expect(
            createService({
                professionalId: service.professional_id,
                name: "Consultation",
                durationMinutes: 30,
                price: 1500,
            }),
        ).rejects.toThrow("Service insert returned no record");
    });
});


describe("findActiveServicesByProfessionalId", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns active services for a professional", async () => {
        const services = [
            {
                service_id: service.service_id,
                professional_id: service.professional_id,
                name: "Consultation",
                description: "A 30-minute consultation",
                duration_minutes: 30,
                price: "1500.00",
                is_active: true,
                created_at: new Date("2026-10-27T07:00:00.000Z"),
            },
        ];

        queryMock.mockResolvedValue({
            rows: services,
        });

        const result = await findActiveServicesByProfessionalId(
            service.professional_id,
        );

        expect(result).toEqual(services);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("is_active = TRUE"),
            [service.professional_id],
        );
    });

    it("returns an empty array when no active services exist", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await findActiveServicesByProfessionalId(
            service.professional_id,
        );

        expect(result).toEqual([]);
    });
});


describe("updateService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates a service and returns the updated record", async () => {
        const updatedService = {
            service_id: service.service_id,
            professional_id: service.professional_id,
            name: "Extended Consultation",
            description: "A longer consultation",
            duration_minutes: 60,
            price: "2500.00",
            is_active: true,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        queryMock.mockResolvedValue({
            rows: [updatedService],
        });

        const result = await updateService({
            serviceId: service.service_id,
            professionalId: service.professional_id,
            name: "Extended Consultation",
            description: "A longer consultation",
            durationMinutes: 60,
            price: 2500,
        });

        expect(result).toEqual(updatedService);

        const [sql, values] = queryMock.mock.calls[0] as [
            string,
            unknown[],
        ];

        expect(sql).toContain("UPDATE services");
        expect(sql).toContain("professional_id = $2");
        expect(sql).toContain("is_active = TRUE");
        expect(values).toEqual([
            service.service_id,
            service.professional_id,
            true,
            "Extended Consultation",
            true,
            "A longer consultation",
            true,
            60,
            true,
            2500,
        ]);
    });

    it("returns null when the service is not owned by the professional or is inactive", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await updateService({
            serviceId: service.service_id,
            professionalId: service.professional_id,
            price: 2000,
        });

        expect(result).toBeNull();
    });

    it("supports updating only the price", async () => {
        queryMock.mockResolvedValue({
            rows: [{ ...service, is_active: true, description: null }],
        });

        await updateService({
            serviceId: service.service_id,
            professionalId: service.professional_id,
            price: 2000,
        });

        const values = queryMock.mock.calls[0]?.[1] as unknown[];

        expect(values).toEqual([
            service.service_id,
            service.professional_id,
            false,
            null,
            false,
            null,
            false,
            null,
            true,
            2000,
        ]);
    });
});


describe("deactivateService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deactivates an active service owned by the professional", async () => {
        const deactivatedService = {
            service_id: service.service_id,
            professional_id: service.professional_id,
            name: service.name,
            description: null,
            duration_minutes: service.duration_minutes,
            price: service.price,
            is_active: false,
            created_at: new Date("2026-10-27T07:00:00.000Z"),
        };

        queryMock.mockResolvedValue({
            rows: [deactivatedService],
        });

        const result = await deactivateService(
            service.service_id,
            service.professional_id,
        );

        expect(result).toEqual(deactivatedService);

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining("SET is_active = FALSE"),
            [service.service_id, service.professional_id],
        );

        const sql = queryMock.mock.calls[0]?.[0] as string;

        expect(sql).toContain("professional_id = $2");
        expect(sql).toContain("is_active = TRUE");
    });

    it("returns null when the service cannot be deactivated", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        const result = await deactivateService(
            service.service_id,
            service.professional_id,
        );

        expect(result).toBeNull();
    });
});
