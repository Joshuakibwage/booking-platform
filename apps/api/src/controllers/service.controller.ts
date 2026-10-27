
import type { NextFunction, Request, Response } from "express";
import {
    createService,
    deactivateService,
    updateService,
} from "../repositories/service.repository.js";
import { findProfessionalProfileIdByUserId } from "../repositories/professional-profile.repository.js";
import {
    validateCreateService,
    validateUpdateService,
} from "../validators/service.validator.js";

export async function createServiceHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const input = validateCreateService(req.body);

        if (!input) {
            return res.status(400).json({
                status: "error",
                message: "Invalid service input",
            });
        }

        const user = req.session.user;

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const professionalId =
            await findProfessionalProfileIdByUserId(user.userId);

        if (!professionalId) {
            return res.status(403).json({
                status: "error",
                message: "Professional profile required",
            });
        }

        const service = await createService({
            professionalId,
            ...input,
        });

        return res.status(201).json({
            status: "success",
            data: service,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateServiceHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const serviceId = req.params.serviceId;

        if (typeof serviceId !== "string" || !serviceId) {
            return res.status(400).json({
                status: "error",
                message: "Invalid service ID",
            });
        }

        const input = validateUpdateService(req.body);

        if (!input) {
            return res.status(400).json({
                status: "error",
                message: "Invalid service input",
            });
        }

        const user = req.session.user;

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const professionalId =
            await findProfessionalProfileIdByUserId(user.userId);

        if (!professionalId) {
            return res.status(403).json({
                status: "error",
                message: "Professional profile required",
            });
        }

        const service = await updateService({
            serviceId,
            professionalId,
            ...input,
        });

        if (!service) {
            return res.status(404).json({
                status: "error",
                message: "Service not found",
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



export async function deactivateServiceHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const serviceId = req.params.serviceId;

        if (typeof serviceId !== "string" || !serviceId) {
            return res.status(400).json({
                status: "error",
                message: "Invalid service ID",
            });
        }

        const user = req.session.user;

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const professionalId =
            await findProfessionalProfileIdByUserId(user.userId);

        if (!professionalId) {
            return res.status(403).json({
                status: "error",
                message: "Professional profile required",
            });
        }

        const service = await deactivateService(serviceId, professionalId);

        if (!service) {
            return res.status(404).json({
                status: "error",
                message: "Service not found",
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
