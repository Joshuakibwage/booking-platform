
import type { Request, Response } from "express";
import { findProfessionalProfileIdByUserId } from "../repositories/professional-profile.repository.js";
import { getBookings } from "../services/booking.service.js";
import { validateBookingsListInput } from "../validators/bookings-list.validator.js";

export async function getProfessionalBookings(
    req: Request,
    res: Response,
): Promise<void> {
    const profileId = await findProfessionalProfileIdByUserId(
        req.session.user!.userId,
    );

    if (!profileId) {
        res.status(403).json({
            status: "error",
            message: "Professional profile required",
        });
        return;
    }

    const input = validateBookingsListInput(
        "professional",
        profileId,
        req.query,
    );

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid bookings list request",
        });
        return;
    }

    const result = await getBookings(input);

    res.status(200).json({
        status: "success",
        data: result,
    });
}
