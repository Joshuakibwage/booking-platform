
import { beforeEach, describe, expect, it, vi } from "vitest";

const { customerExistsMock, findActiveServiceMock, isWithinAvailabilityMock } = vi.hoisted(
    () => ({
        customerExistsMock: vi.fn(),
        findActiveServiceMock: vi.fn(),
        isWithinAvailabilityMock: vi.fn(),
    }),
);

vi.mock("../repositories/customer.repository.js", () => ({
    customerExists: customerExistsMock,
}));

vi.mock("../repositories/service.repository.js", () => ({
    findActiveServiceById: findActiveServiceMock,
}));

vi.mock("./availability.service.js", () => ({
    isWithinAvailability: isWithinAvailabilityMock,
}));

import { prepareBooking } from "./booking.service.js";

const input = {
    customerId: "550e8400-e29b-41d4-a716-446655440000",
    serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    startTime: "2026-11-02T09:00:00+03:00",
};

const service = {
    service_id: input.serviceId,
    professional_id: "7ba7b810-9dad-41d1-80b4-00c04fd430c8",
    name: "Consultation",
    duration_minutes: 30,
    price: "1500.00",
    time_zone: "Africa/Nairobi",
};

describe("prepareBooking", () => {
    beforeEach(() => {
        vi.clearAllMocks(),
        isWithinAvailabilityMock.mockResolvedValue(true);
    });

    it("rejects a booking when the customer does not exist", async () => {
        customerExistsMock.mockResolvedValue(false);

        const result = await prepareBooking(input);

        expect(result).toEqual({
            ok: false,
            reason: "customer_not_found",
        });

        expect(findActiveServiceMock).not.toHaveBeenCalled();
    });

    it("rejects a booking when the service is not found", async () => {
        customerExistsMock.mockResolvedValue(true);
        findActiveServiceMock.mockResolvedValue(null);

        const result = await prepareBooking(input);

        expect(result).toEqual({
            ok: false,
            reason: "service_not_found",
        });
    });

    it("calculates the end time using the service duration", async () => {
        customerExistsMock.mockResolvedValue(true);
        findActiveServiceMock.mockResolvedValue(service);

        const result = await prepareBooking(input);

        expect(result.ok).toBe(true);

        if (!result.ok) {
            throw new Error("Expected booking preparation to succeed");
        }

        expect(result.customerId).toBe(input.customerId);
        expect(result.service).toEqual(service);
        expect(result.startTime.toISOString()).toBe(
            "2026-11-02T06:00:00.000Z",
        );
        expect(result.endTime.toISOString()).toBe(
            "2026-11-02T06:30:00.000Z",
        );
    });

    it("rejects a booking outside professional availability", async () => {
        customerExistsMock.mockResolvedValue(true);
        findActiveServiceMock.mockResolvedValue(service);
        isWithinAvailabilityMock.mockResolvedValue(false);

        const result = await prepareBooking(input);

        expect(result).toEqual({
            ok: false,
            reason: "outside_availability",
        });
    });
});
