import type { NextFunction, Request, Response } from "express";
import {
    findPublicServiceById,
    findPublicServices,
} from "../repositories/service.repository.js";

import {
    validatePublicServiceFilters,
    validatePublicServiceId,
} from "../validators/public-service.validator.js";

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

export async function getPublicServiceHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const serviceId = validatePublicServiceId(req.params.serviceId);

        if (serviceId === null) {
            return res.status(400).json({
                status: "error",
                message: "Invalid service ID.",
            });
        }

        const service = await findPublicServiceById(serviceId);

        if (service === null) {
            return res.status(404).json({
                status: "error",
                message: "Service not found.",
            });
        }

        return res.status(200).json({
            status: "success",
            data: service,
        });
    } catch (error) {
        next(error);
    }
}