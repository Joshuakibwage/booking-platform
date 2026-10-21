
import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: queryMock,
    },
}));

import { findActiveServiceById } from "./service.repository.js";

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
