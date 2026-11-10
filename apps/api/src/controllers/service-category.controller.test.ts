import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

const { findActiveServiceCategoriesMock } = vi.hoisted(() => ({
    findActiveServiceCategoriesMock: vi.fn(),
}));

vi.mock("../repositories/service-category.repository.js", () => ({
    findActiveServiceCategories: findActiveServiceCategoriesMock,
}));

import { getServiceCategoriesHandler } from "./service-category.controller.js";

describe("getServiceCategoriesHandler", () => {
    const req = {} as Request;

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns active categories successfully", async () => {
        const categories = [
            {
                category_id: "category-1",
                name: "Beauty & personal care",
                slug: "beauty-personal-care",
            },
        ];

        findActiveServiceCategoriesMock.mockResolvedValue(categories);

        await getServiceCategoriesHandler(req, res, next);

        expect(findActiveServiceCategoriesMock).toHaveBeenCalledOnce();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            data: categories,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns an empty array when no categories exist", async () => {
        findActiveServiceCategoriesMock.mockResolvedValue([]);

        await getServiceCategoriesHandler(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            data: [],
        });
    });

    it("forwards repository errors to the error handler", async () => {
        const error = new Error("Database connection failed");

        findActiveServiceCategoriesMock.mockRejectedValue(error);

        await getServiceCategoriesHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});