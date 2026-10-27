
import type { Request, Response } from "express";
import {
    createProfessionalProfile,
    findProfessionalProfileById,
    findProfessionalProfileIdByUserId,
    updateProfessionalProfile,
} from "../repositories/professional-profile.repository.js";

import {
    validateCreateProfessionalProfile,
    validateUpdateProfessionalProfile,
} from "../validators/professional-profile.validator.js";

export async function createProfessionalProfileHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const user = req.session.user;

    if (!user) {
        res.status(401).json({
            status: "error",
            message: "Authentication required",
        });
        return;
    }

    const input = validateCreateProfessionalProfile(req.body);

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid professional profile",
        });
        return;
    }

    const existingProfileId = await findProfessionalProfileIdByUserId(
        user.userId,
    );

    if (existingProfileId) {
        res.status(409).json({
            status: "error",
            message: "Professional profile already exists",
        });
        return;
    }

    const profile = await createProfessionalProfile({
        userId: user.userId,
        ...input,
    });

    res.status(201).json({
        status: "success",
        data: profile,
    });
}


export async function updateProfessionalProfileHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const user = req.session.user;

    if (!user) {
        res.status(401).json({
            status: "error",
            message: "Authentication required",
        });
        return;
    }

    const input = validateUpdateProfessionalProfile(req.body);

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid professional profile update",
        });
        return;
    }

    const profile = await updateProfessionalProfile({
        userId: user.userId,
        ...input,
    });

    if (!profile) {
        res.status(404).json({
            status: "error",
            message: "Professional profile not found",
        });
        return;
    }

    res.status(200).json({
        status: "success",
        data: profile,
    });
}

export async function getProfessionalProfileHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const { professionalId } = req.params;

    if (
        typeof professionalId !== "string" ||
        professionalId.trim() === ""
    ) {
        res.status(400).json({
            status: "error",
            message: "Invalid professional ID",
        });
        return;
    }

    const profile = await findProfessionalProfileById(professionalId);

    if (!profile) {
        res.status(404).json({
            status: "error",
            message: "Professional profile not found",
        });
        return;
    }

    res.status(200).json({
        status: "success",
        data: profile,
    });
}