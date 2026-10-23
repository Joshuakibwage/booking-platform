
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const { getBookingsMock } = vi.hoisted(() => ({
    getBookingsMock: vi.fn(),
}));

vi.mock("../services/booking.service.js", () => ({
    getBookings: getBookingsMock,
    createBooking: vi.fn(),
}));

import app from "../app.js";

const professionalId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";
const endpoint = `/professionals/${professionalId}/bookings`;

describe("GET /professionals/:professionalId/bookings", () => {
    beforeEach(() => {
        getBookingsMock.mockReset();
    });

    it("rejects an invalid professional ID with 400", async () => {
        const response = await request(app)
            .get("/professionals/not-a-uuid/bookings");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid bookings list request",
        });

        expect(getBookingsMock).not.toHaveBeenCalled();
    });

    it("rejects invalid query parameters with 400", async () => {
        const response = await request(app)
            .get(endpoint)
            .query({ limit: "500" });

        expect(response.status).toBe(400);
        expect(getBookingsMock).not.toHaveBeenCalled();
    });

    it("returns bookings and pagination metadata", async () => {
        const result = {
            bookings: [
                {
                    booking_id: "9ba7b810-9dad-41d1-80b4-00c04fd430c8",
                    status: "confirmed",
                },
            ],
            pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            },
        };

        getBookingsMock.mockResolvedValue(result);

        const response = await request(app).get(endpoint);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "success",
            data: result,
        });

        expect(getBookingsMock).toHaveBeenCalledWith({
            owner: {
                type: "professional",
                id: professionalId,
            },
            page: 1,
            limit: 20,
        });
    });

    it("forwards status, date filters, and pagination", async () => {
        getBookingsMock.mockResolvedValue({
            bookings: [],
            pagination: {
                page: 2,
                limit: 10,
                total: 0,
                totalPages: 0,
            },
        });

        const response = await request(app)
            .get(endpoint)
            .query({
                status: "cancelled",
                from: "2026-11-01",
                to: "2026-11-30",
                page: "2",
                limit: "10",
            });

        expect(response.status).toBe(200);
        expect(getBookingsMock).toHaveBeenCalledWith({
            owner: {
                type: "professional",
                id: professionalId,
            },
            status: "cancelled",
            from: "2026-11-01",
            to: "2026-11-30",
            page: 2,
            limit: 10,
        });
    });

    it("returns an empty list when the professional has no bookings", async () => {
        getBookingsMock.mockResolvedValue({
            bookings: [],
            pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
            },
        });

        const response = await request(app).get(endpoint);

        expect(response.status).toBe(200);
        expect(response.body.data.bookings).toEqual([]);
    });
});
