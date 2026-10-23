
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const {
    createBookingMock,
    cancelBookingByIdMock,
} = vi.hoisted(() => ({
    createBookingMock: vi.fn(),
    cancelBookingByIdMock: vi.fn(),
}));

vi.mock("../services/booking.service.js", () => ({
    createBooking: createBookingMock,
    cancelBookingById: cancelBookingByIdMock,
}));

import app from "../app.js";

describe("POST /bookings", () => {
    beforeEach(() => {
        createBookingMock.mockReset();
    });

    it("rejects an invalid request with 400", async () => {
        const response = await request(app)
            .post("/bookings")
            .send({ customerId: "invalid" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid booking request",
        });

        expect(createBookingMock).not.toHaveBeenCalled();
    });

    it("creates a booking and returns 201", async () => {
        const booking = {
            booking_id: "booking-123",
            customer_id: "550e8400-e29b-41d4-a716-446655440000",
            service_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
            status: "confirmed",
        };

        createBookingMock.mockResolvedValue({
            ok: true,
            booking,
        });

        const response = await request(app)
            .post("/bookings")
            .send({
                customerId: "550e8400-e29b-41d4-a716-446655440000",
                serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
                startTime: "2026-11-02T09:00:00+03:00",
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            status: "success",
            data: booking,
        });

        expect(createBookingMock).toHaveBeenCalledWith({
            customerId: "550e8400-e29b-41d4-a716-446655440000",
            serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
            startTime: "2026-11-02T09:00:00+03:00",
        });
    });

    it("returns 404 when the customer does not exist", async () => {
        createBookingMock.mockResolvedValue({
            ok: false,
            reason: "customer_not_found",
        });

        const response = await request(app)
            .post("/bookings")
            .send({
                customerId: "550e8400-e29b-41d4-a716-446655440000",
                serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
                startTime: "2026-11-02T09:00:00+03:00",
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("customer_not_found");
    });

    it("returns 404 when the service does not exist or is inactive", async () => {
        createBookingMock.mockResolvedValue({
            ok: false,
            reason: "service_not_found",
        });

        const response = await request(app)
            .post("/bookings")
            .send({
                customerId: "550e8400-e29b-41d4-a716-446655440000",
                serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
                startTime: "2026-11-02T09:00:00+03:00",
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("service_not_found");
    });

    it("returns 409 when the requested time is outside availability", async () => {
        createBookingMock.mockResolvedValue({
            ok: false,
            reason: "outside_availability",
        });

        const response = await request(app)
            .post("/bookings")
            .send({
                customerId: "550e8400-e29b-41d4-a716-446655440000",
                serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
                startTime: "2026-11-02T09:00:00+03:00",
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("outside_availability");
    });

    it("returns 409 when the time slot is already booked", async () => {
        createBookingMock.mockResolvedValue({
            ok: false,
            reason: "slot_unavailable",
        });

        const response = await request(app)
            .post("/bookings")
            .send({
                customerId: "550e8400-e29b-41d4-a716-446655440000",
                serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
                startTime: "2026-11-02T09:00:00+03:00",
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("slot_unavailable");
    });
});

describe("PATCH /bookings/:bookingId/cancel", () => {
    const bookingId = "9ba7b810-9dad-41d1-80b4-00c04fd430c8";

    beforeEach(() => {
        cancelBookingByIdMock.mockReset();
    });

    it("returns 400 when the booking ID is invalid", async () => {
        const response = await request(app)
            .patch("/bookings/not-a-uuid/cancel");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid booking ID",
        });

        expect(cancelBookingByIdMock).not.toHaveBeenCalled();
    });

    it("cancels a booking and returns 200", async () => {
        const booking = {
            booking_id: bookingId,
            status: "cancelled",
        };

        cancelBookingByIdMock.mockResolvedValue({
            ok: true,
            booking,
        });

        const response = await request(app)
            .patch(`/bookings/${bookingId}/cancel`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "success",
            data: booking,
        });

        expect(cancelBookingByIdMock).toHaveBeenCalledWith(bookingId);
    });

    it("returns 404 when the booking does not exist", async () => {
        cancelBookingByIdMock.mockResolvedValue({
            ok: false,
            reason: "booking_not_found",
        });

        const response = await request(app)
            .patch(`/bookings/${bookingId}/cancel`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: "error",
            message: "booking_not_found",
        });

        expect(cancelBookingByIdMock).toHaveBeenCalledWith(bookingId);
    });

    it("returns 409 when the booking cannot be cancelled", async () => {
        cancelBookingByIdMock.mockResolvedValue({
            ok: false,
            reason: "booking_not_cancellable",
        });

        const response = await request(app)
            .patch(`/bookings/${bookingId}/cancel`);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            status: "error",
            message: "booking_not_cancellable",
        });

        expect(cancelBookingByIdMock).toHaveBeenCalledWith(bookingId);
    });
});
