
import type { NextFunction, Request, Response } from "express";
import {
    createWeeklyAvailability,
    deleteWeeklyAvailability,
    listWeeklyAvailability,
    updateWeeklyAvailability,
} from "../repositories/availability.repository.js";
import { findProfessionalProfileIdByUserId } from "../repositories/professional-profile.repository.js";
import {
    validateCreateWeeklyAvailability,
    validateUpdateWeeklyAvailability,
} from "../validators/weekly-availability.validator.js";

export async function listWeeklyAvailabilityHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
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

        const periods = await listWeeklyAvailability(professionalId);

        return res.status(200).json({
            status: "success",
            data: periods,
        });
    } catch (error) {
        next(error);
    }
}

export async function createWeeklyAvailabilityHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const input = validateCreateWeeklyAvailability(req.body);

        if (!input) {
            return res.status(400).json({
                status: "error",
                message: "Invalid weekly availability input",
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

        const period = await createWeeklyAvailability({
            professionalId,
            ...input,
        });

        return res.status(201).json({
            status: "success",
            data: period,
        });
    } catch (error) {
        const databaseError = error as { code?: string };

        if (databaseError.code === "23P01") {
            return res.status(409).json({
                status: "error",
                message: "Weekly availability overlaps an existing period",
            });
        }

        if (databaseError.code === "23514") {
            return res.status(400).json({
                status: "error",
                message: "Invalid weekly availability input",
            });
        }

        return next(error);
    }
}

export async function updateWeeklyAvailabilityHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { availabilityId } = req.params;

        if (
            typeof availabilityId !== "string" ||
            availabilityId.length === 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid weekly availability ID",
            });
        }

        const input = validateUpdateWeeklyAvailability(req.body);

        if (!input) {
            return res.status(400).json({
                status: "error",
                message: "Invalid weekly availability input",
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

        const period = await updateWeeklyAvailability({
            availabilityId,
            professionalId,
            ...input,
        });

        if (!period) {
            return res.status(404).json({
                status: "error",
                message: "Weekly availability period not found",
            });
        }

        return res.status(200).json({
            status: "success",
            data: period,
        });
    } catch (error) {
        const databaseError = error as { code?: string };

        if (databaseError.code === "23P01") {
            return res.status(409).json({
                status: "error",
                message: "Weekly availability overlaps an existing period",
            });
        }

        if (databaseError.code === "23514") {
            return res.status(400).json({
                status: "error",
                message: "Invalid weekly availability input",
            });
        }

        return next(error);
    }
};


export async function deleteWeeklyAvailabilityHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { availabilityId } = req.params;

        if (!availabilityId || typeof availabilityId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid availability ID",
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
                message: "Professional profile not found",
            });
        }

        const deleted = await deleteWeeklyAvailability(
            availabilityId,
            professionalId,
        );

        if (!deleted) {
            return res.status(404).json({
                status: "error",
                message: "Weekly availability period not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Weekly availability period deleted",
        });
    } catch (error) {
        next(error);
    }
};
