
import type { Request, Response } from "express";
import { getAvailableSlots } from "../services/availability.service.js";
import { validateAvailabilityInput } from "../validators/availability.validator.js";

export async function getAvailability(
    req: Request,
    res: Response,
): Promise<void> {
    const input = validateAvailabilityInput(
        req.params.professionalId,
        req.query.serviceId,
        req.query.date,
    );

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid availability request",
        });
        return;
    }

    const result = await getAvailableSlots(
        input.professionalId,
        input.serviceId,
        input.date,
    );

    if (result === null) {
        res.status(404).json({
            status: "error",
            message: "service_not_found",
        });
        return;
    }

    res.status(200).json({
        status: "success",
        data: {
            date: input.date,
            timeZone: result.timeZone,
            slots: result.slots,
        },
    });
}
