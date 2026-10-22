
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../app.js";

const { getAvailableSlotsMock } = vi.hoisted(() => ({
    getAvailableSlotsMock: vi.fn(),
}));

vi.mock("../services/availability.service.js", () => ({
    getAvailableSlots: getAvailableSlotsMock,
}));

const professionalId = "550e8400-e29b-41d4-a716-446655440000";
const serviceId = "660e8400-e29b-41d4-a716-446655440000";

const endpoint = `/professionals/${professionalId}/availability`;

describe("GET /professionals/:professionalId/availability", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getAvailableSlotsMock.mockResolvedValue({
            timeZone: "Africa/Nairobi",
            slots: [
                {
                    startTime: "10:00",
                    endTime: "11:00",
                },
                {
                    startTime: "12:00",
                    endTime: "13:00",
                },
            ],
        });
    });

    it("returns available slots for a valid request", async () => {
        const response = await request(app)
            .get(endpoint)
            .query({
                date: "2026-11-04",
                serviceId,
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "success",
            data: {
                date: "2026-11-04",
                timeZone: "Africa/Nairobi",
                slots: [
                    {
                        startTime: "10:00",
                        endTime: "11:00",
                    },
                    {
                        startTime: "12:00",
                        endTime: "13:00",
                    },
                ],
            },
        });

        expect(getAvailableSlotsMock).toHaveBeenCalledWith(
            professionalId,
            serviceId,
            "2026-11-04",
        );
    });

    it("returns 400 when the date is invalid", async () => {
        const response = await request(app)
            .get(endpoint)
            .query({
                date: "2026-02-31",
                serviceId,
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid availability request",
        });

        expect(getAvailableSlotsMock).not.toHaveBeenCalled();
    });

    it("returns 400 when the service ID is invalid", async () => {
        const response = await request(app)
            .get(endpoint)
            .query({
                date: "2026-11-04",
                serviceId: "not-a-uuid",
            });

        expect(response.status).toBe(400);
        expect(getAvailableSlotsMock).not.toHaveBeenCalled();
    });

    it("returns 400 when the professional ID is invalid", async () => {
        const response = await request(app)
            .get("/professionals/not-a-uuid/availability")
            .query({
                date: "2026-11-04",
                serviceId,
            });

        expect(response.status).toBe(400);
        expect(getAvailableSlotsMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the service is unavailable for the professional", async () => {
        getAvailableSlotsMock.mockResolvedValue(null);

        const response = await request(app)
            .get(endpoint)
            .query({
                date: "2026-11-04",
                serviceId,
            });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: "error",
            message: "service_not_found",
        });
    });

    it("returns an empty slot list when no appointments are available", async () => {
        getAvailableSlotsMock.mockResolvedValue({
            timeZone: "Africa/Nairobi",
            slots: [],
        });

        const response = await request(app)
            .get(endpoint)
            .query({
                date: "2026-11-04",
                serviceId,
            });

        expect(response.status).toBe(200);
        expect(response.body.data.slots).toEqual([]);
    });
});
