import type { NextFunction, Request, Response } from "express";
import { findActiveServiceCategories } from "../repositories/service-category.repository.js";

export async function getServiceCategoriesHandler(
    _req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const categories = await findActiveServiceCategories();

        return res.status(200).json({
            status: "success",
            data: categories,
        });
    } catch (error) {
        next(error);
    }
}