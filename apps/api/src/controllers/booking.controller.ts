
import type { Request, Response } from "express";
import { validateBookingInput } from "../validators/booking.validator.js";
import { createBooking as createBookingService } from "../services/booking.service.js";


export async function createBooking(
    req: Request,
    res: Response,
): Promise<void> {
    const input = validateBookingInput(req.body);

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid booking request",
        });
        return;
    }

    const result = await createBookingService(input);

    if (!result.ok) {
        switch (result.reason) {
            case "customer_not_found":
            case "service_not_found":
                res.status(404).json({
                    status: "error",
                    message: result.reason,
                });
            return;

            case "outside_availability":
            case "slot_unavailable":
                res.status(409).json({
                    status: "error",
                    message: result.reason,
                });
            return;
        }
    }

    res.status(201).json({
        status: "success",
        data: result.booking,
    });
}