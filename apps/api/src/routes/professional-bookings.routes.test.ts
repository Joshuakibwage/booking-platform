
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import professionalRouter from "./availability.routes.js";

const {
    getBookingsMock,
    findProfessionalProfileIdByUserIdMock,
} = vi.hoisted(() => ({
    getBookingsMock: vi.fn(),
    findProfessionalProfileIdByUserIdMock: vi.fn(),
}));

vi.mock("../services/booking.service.js", () => ({
    getBookings: getBookingsMock,
    createBooking: vi.fn(),
}));

vi.mock("../repositories/professional-profile.repository.js", () => ({
    findProfessionalProfileIdByUserId: findProfessionalProfileIdByUserIdMock,
}));

const professionalId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";
const userId = "550e8400-e29b-41d4-a716-446655440000";
const endpoint = "/professionals/bookings";

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
    req.session = {
        user: {
            userId,
        },
    } as Request["session"];

    next();
});

app.use("/professionals", professionalRouter);

describe("GET /professionals/bookings", () => {
    beforeEach(() => {
        getBookingsMock.mockReset();
        findProfessionalProfileIdByUserIdMock.mockReset();
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(professionalId);
    });

    it("rejects invalid query parameters with 400", async () => {
        const response = await request(app)
            .get(endpoint)
            .query({ limit: "500" });

        expect(response.status).toBe(400);
        expect(getBookingsMock).not.toHaveBeenCalled();
    });

    it("returns 403 when the user has no professional profile", async () => {
        findProfessionalProfileIdByUserIdMock.mockResolvedValue(null);

        const response = await request(app).get(endpoint);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            status: "error",
            message: "Professional profile required",
        });

        expect(getBookingsMock).not.toHaveBeenCalled();
    });

    it("looks up the profile using the authenticated user's ID", async () => {
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
        expect(findProfessionalProfileIdByUserIdMock).toHaveBeenCalledWith(userId);
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
