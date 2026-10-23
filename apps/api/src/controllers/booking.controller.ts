
import type { NextFunction, Request, Response } from "express";
import {
    cancelBookingById,
    createBooking as createBookingService,
} from "../services/booking.service.js";
import { validateBookingInput } from "../validators/booking.validator.js";
import { validateBookingId } from "../validators/cancel-booking.validator.js";

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

export async function cancelBooking(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const bookingId = validateBookingId(req.params.bookingId);

    if (!bookingId) {
        res.status(400).json({
            status: "error",
            message: "Invalid booking ID",
        });
        return;
    }

    try {
        const result = await cancelBookingById(bookingId);

        if (!result.ok) {
            const statusCode =
                result.reason === "booking_not_found" ? 404 : 409;

            res.status(statusCode).json({
                status: "error",
                message: result.reason,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: result.booking,
        });
    } catch (error) {
        next(error);
    }
}
