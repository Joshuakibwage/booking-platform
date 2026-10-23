
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const { customerExistsMock, getBookingsMock } = vi.hoisted(() => ({
    customerExistsMock: vi.fn(),
    getBookingsMock: vi.fn(),
}));

vi.mock("../repositories/customer.repository.js", () => ({
    customerExists: customerExistsMock,
}));

vi.mock("../services/booking.service.js", () => ({
    getBookings: getBookingsMock,
    createBooking: vi.fn(),
}));

import app from "../app.js";

const customerId = "550e8400-e29b-41d4-a716-446655440000";

describe("GET /customers/:customerId/bookings", () => {
    beforeEach(() => {
        customerExistsMock.mockReset();
        getBookingsMock.mockReset();
    });

    it("rejects an invalid customer ID with 400", async () => {
        const response = await request(app)
            .get("/customers/invalid/bookings");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid bookings list request",
        });

        expect(customerExistsMock).not.toHaveBeenCalled();
        expect(getBookingsMock).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid query parameters", async () => {
        const response = await request(app)
            .get(`/customers/${customerId}/bookings?page=0`);

        expect(response.status).toBe(400);
        expect(customerExistsMock).not.toHaveBeenCalled();
        expect(getBookingsMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the customer does not exist", async () => {
        customerExistsMock.mockResolvedValue(false);

        const response = await request(app)
            .get(`/customers/${customerId}/bookings`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: "error",
            message: "customer_not_found",
        });

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

        customerExistsMock.mockResolvedValue(true);
        getBookingsMock.mockResolvedValue(result);

        const response = await request(app)
            .get(`/customers/${customerId}/bookings`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "success",
            data: result,
        });

        expect(getBookingsMock).toHaveBeenCalledWith({
            owner: {
                type: "customer",
                id: customerId,
            },
            page: 1,
            limit: 20,
        });
    });

    it("passes status, date filters, and pagination to the service", async () => {
        customerExistsMock.mockResolvedValue(true);
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
            .get(`/customers/${customerId}/bookings`)
            .query({
                status: "confirmed",
                from: "2026-11-01",
                to: "2026-11-30",
                page: "2",
                limit: "10",
            });

        expect(response.status).toBe(200);
        expect(getBookingsMock).toHaveBeenCalledWith({
            owner: {
                type: "customer",
                id: customerId,
            },
            status: "confirmed",
            from: "2026-11-01",
            to: "2026-11-30",
            page: 2,
            limit: 10,
        });
    });
});
