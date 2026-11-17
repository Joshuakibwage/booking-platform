import type { NextFunction, Request, Response } from "express";
import { findPublicProfessionals } from "../repositories/professional-profile.repository.js";
import { validatePublicProfessionalFilters } from "../validators/public-professional.validator.js";

export async function getPublicProfessionalsHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const filters = validatePublicProfessionalFilters(req.query);

        if (filters === null) {
            return res.status(400).json({
                status: "error",
                message: "Invalid professional filters.",
            });
        }

        const professionals = await findPublicProfessionals(filters);

        return res.status(200).json({
            status: "success",
            data: professionals,
        });
    } catch (error) {
        next(error);
    }
}