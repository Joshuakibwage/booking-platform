import type { NextFunction, Request, Response } from "express";
import { findPublicServices } from "../repositories/service.repository.js";
import { validatePublicServiceFilters } from "../validators/public-service.validator.js";

export async function getPublicServicesHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const filters = validatePublicServiceFilters(req.query);

        if (filters === null) {
            return res.status(400).json({
                status: "error",
                message: "Invalid service filters.",
            });
        }

        const services = await findPublicServices(filters);

        return res.status(200).json({
            status: "success",
            data: services,
        });
    } catch (error) {
        next(error);
    }
}