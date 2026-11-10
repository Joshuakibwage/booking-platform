import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

const { findPublicServicesMock } = vi.hoisted(() => ({
    findPublicServicesMock: vi.fn(),
}));

vi.mock("../repositories/service.repository.js", () => ({
    findPublicServices: findPublicServicesMock,
}));

import { getPublicServicesHandler } from "./public-service.controller.js";

describe("getPublicServicesHandler", () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns public services successfully", async () => {
        const services = [
            {
                service_id: "service-1",
                professional_id: "professional-1",
                name: "Haircut",
                description: "Professional haircut",
                duration_minutes: 45,
                price: "1500.00",
                professional_name: "Alex",
                category_name: "Beauty & personal care",
                category_slug: "beauty-personal-care",
            },
        ];

        const req = {
            query: {},
        } as Request;

        findPublicServicesMock.mockResolvedValue(services);

        await getPublicServicesHandler(req, res, next);

        expect(findPublicServicesMock).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            data: services,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("passes valid search and category filters to the repository", async () => {

        const req = {
            query: {
                search: "haircut",
                category: "beauty-personal-care",
            },
        } as unknown as Request;

        findPublicServicesMock.mockResolvedValue([]);

        await getPublicServicesHandler(req, res, next);

        expect(findPublicServicesMock).toHaveBeenCalledWith({
            search: "haircut",
            category: "beauty-personal-care",
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when filters are invalid", async () => {
        const req = {
            query: {
                search: ["haircut"],
            },
        } as unknown as Request;

        await getPublicServicesHandler(req, res, next);

        expect(findPublicServicesMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Invalid service filters.",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("forwards repository errors to the error handler", async () => {
        const error = new Error("Database connection failed");

        const req = {
            query: {},
        } as Request;

        findPublicServicesMock.mockRejectedValue(error);

        await getPublicServicesHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});