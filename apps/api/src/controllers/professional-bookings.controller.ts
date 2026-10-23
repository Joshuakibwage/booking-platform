
import type { Request, Response } from "express";
import { getBookings } from "../services/booking.service.js";
import { validateBookingsListInput } from "../validators/bookings-list.validator.js";

export async function getProfessionalBookings(
    req: Request,
    res: Response,
): Promise<void> {
    const input = validateBookingsListInput(
        "professional",
        req.params.professionalId,
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
