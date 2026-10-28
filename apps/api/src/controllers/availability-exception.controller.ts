
import type { NextFunction, Request, Response } from "express";
import {
    createAvailabilityException,
    deleteAvailabilityException,
    listAvailabilityExceptions,
    updateAvailabilityException,
} from "../repositories/availability.repository.js";

import {
    validateCreateAvailabilityException,
    validateUpdateAvailabilityException,
} from "../validators/availability-exception.validator.js";

import { findProfessionalProfileIdByUserId } from "../repositories/professional-profile.repository.js";

export async function listAvailabilityExceptionsHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.session?.user?.userId;

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const professionalId =
            await findProfessionalProfileIdByUserId(userId);

        if (!professionalId) {
            return res.status(403).json({
                status: "error",
                message: "Professional profile required",
            });
        }

        const exceptions =
            await listAvailabilityExceptions(professionalId);

        return res.status(200).json({
            status: "success",
            data: exceptions,
        });
    } catch (error) {
        next(error);
    }
};



export async function createAvailabilityExceptionHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const validation = validateCreateAvailabilityException(req.body);

        if (!validation) {
            return res.status(400).json({
                status: "error",
                message: "Invalid availability exception input",
            });
        }

        const userId = req.session?.user?.userId;

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const professionalId =
            await findProfessionalProfileIdByUserId(userId);

        if (!professionalId) {
            return res.status(403).json({
                status: "error",
                message: "Professional profile required",
            });
        }

        const exception = await createAvailabilityException({
            professionalId,
            ...validation,
        });

        return res.status(201).json({
            status: "success",
            data: exception,
        });
    } catch (error) {
        const databaseError = error as { code?: string };

        if (databaseError.code === "23505") {
            return res.status(409).json({
                status: "error",
                message: "An availability exception already exists for this date",
            });
        }

        next(error);
    }
};


export async function updateAvailabilityExceptionHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { exceptionId } = req.params;

        if (!exceptionId || typeof exceptionId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid availability exception ID",
            });
        }

        const validation = validateUpdateAvailabilityException(req.body);

        if (!validation) {
            return res.status(400).json({
                status: "error",
                message: "Invalid availability exception input",
            });
        }

        const userId = req.session?.user?.userId;

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const professionalId =
            await findProfessionalProfileIdByUserId(userId);

        if (!professionalId) {
            return res.status(403).json({
                status: "error",
                message: "Professional profile required",
            });
        }

        const exception = await updateAvailabilityException({
            exceptionId,
            professionalId,
            ...validation,
        });

        if (!exception) {
            return res.status(404).json({
                status: "error",
                message: "Availability exception not found",
            });
        }

        return res.status(200).json({
            status: "success",
            data: exception,
        });
    } catch (error) {
        const databaseError = error as { code?: string };

        if (databaseError.code === "23505") {
            return res.status(409).json({
                status: "error",
                message: "An availability exception already exists for this date",
            });
        }

        next(error);
    }
};


export async function deleteAvailabilityExceptionHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { exceptionId } = req.params;

        if (!exceptionId || typeof exceptionId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid availability exception ID",
            });
        }

        const userId = req.session?.user?.userId;

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const professionalId =
            await findProfessionalProfileIdByUserId(userId);

        if (!professionalId) {
            return res.status(403).json({
                status: "error",
                message: "Professional profile required",
            });
        }

        const deleted = await deleteAvailabilityException(
            exceptionId,
            professionalId,
        );

        if (!deleted) {
            return res.status(404).json({
                status: "error",
                message: "Availability exception not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Availability exception deleted",
        });
    } catch (error) {
        next(error);
    }
}

