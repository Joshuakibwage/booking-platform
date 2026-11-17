
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

const { findPublicProfessionalsMock } = vi.hoisted(() => ({
    findPublicProfessionalsMock: vi.fn(),
}));

vi.mock("../repositories/professional-profile.repository.js", () => ({
    findPublicProfessionals: findPublicProfessionalsMock,
}));

import { getPublicProfessionalsHandler } from "./public-professional.controller.js";

describe("getPublicProfessionalsHandler", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns public professionals successfully", async () => {
        const professionals = [
            {
                profile_id: "professional-1",
                public_name: "Alex",
                bio: "Experienced hair stylist",
                time_zone: "Africa/Nairobi",
                image_url: "https://example.com/profile.jpg",
                service_count: 3,
            },
        ];

        const req = {
            query: {},
        } as Request;

        findPublicProfessionalsMock.mockResolvedValue(professionals);

        await getPublicProfessionalsHandler(req, res, next);

        expect(findPublicProfessionalsMock).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            data: professionals,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("passes valid search and category filters to the repository", async () => {
        const req = {
            query: {
                search: "Alex",
                category: "beauty-personal-care",
            },
        } as unknown as Request;

        findPublicProfessionalsMock.mockResolvedValue([]);

        await getPublicProfessionalsHandler(req, res, next);

        expect(findPublicProfessionalsMock).toHaveBeenCalledWith({
            search: "Alex",
            category: "beauty-personal-care",
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when filters are invalid", async () => {
        const req = {
            query: {
                search: ["Alex"],
            },
        } as unknown as Request;

        await getPublicProfessionalsHandler(req, res, next);

        expect(findPublicProfessionalsMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Invalid professional filters.",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("forwards repository errors to the error handler", async () => {
        const error = new Error("Database connection failed");

        const req = {
            query: {},
        } as Request;

        findPublicProfessionalsMock.mockRejectedValue(error);

        await getPublicProfessionalsHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
