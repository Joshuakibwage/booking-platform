
import type { Request, Response } from "express";

import {
    createProfessionalProfile,
    findProfessionalProfileById,
    findProfessionalProfileByUserId,
    findProfessionalProfileIdByUserId,
    updateProfessionalProfile,
    updateProfessionalProfileImage,
} from "../repositories/professional-profile.repository.js";

import {
    uploadProfileImage,
    deleteProfileImageAsset,
} from "../services/cloudinary.service.js";

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

export async function uploadProfessionalProfileImageHandler(
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

    if (!req.file) {
        res.status(400).json({
            status: "error",
            message: "Profile image is required",
        });
        return;
    }

    const profileId = await findProfessionalProfileIdByUserId(
        user.userId,
    );

    if (!profileId) {
        res.status(404).json({
            status: "error",
            message: "Professional profile not found",
        });
        return;
    }

    const uploadedImage = await uploadProfileImage(
        profileId,
        req.file.buffer,
    );

    let updatedProfile;

    try {
        updatedProfile = await updateProfessionalProfileImage(
            user.userId,
            uploadedImage.secureUrl,
            uploadedImage.publicId,
        );
    } catch (error) {
        try {
            await deleteProfileImageAsset(uploadedImage.publicId);
        } catch (cleanupError) {
            console.error(
                "Failed to clean up uploaded professional profile image:",
                {
                    profileId,
                    publicId: uploadedImage.publicId,
                    error: cleanupError,
                },
            );
        }

        throw error;
    }

    if (!updatedProfile) {
        try {
            await deleteProfileImageAsset(uploadedImage.publicId);
        } catch (error) {
            console.error(
                "Failed to clean up uploaded professional profile image:",
                {
                    profileId,
                    publicId: uploadedImage.publicId,
                    error,
                },
            );
        }

        res.status(404).json({
            status: "error",
            message: "Professional profile not found",
        });
        return;
    }

    const previousImagePublicId =
        updatedProfile.previous_image_public_id;

    if (
        previousImagePublicId &&
        previousImagePublicId !== updatedProfile.image_public_id
    ) {
        try {
            await deleteProfileImageAsset(previousImagePublicId);
        } catch (error) {
            console.error(
                "Failed to delete previous professional profile image:",
                {
                    profileId,
                    publicId: previousImagePublicId,
                    error,
                },
            );
        }
    }

    res.status(200).json({
        status: "success",
        data: {
            imageUrl: updatedProfile.image_url,
        },
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

export async function getAuthenticatedProfessionalProfileHandler(
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

    const profile = await findProfessionalProfileByUserId(user.userId);

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