
import type { NextFunction, Request, Response } from "express";

import {
    cancelBookingById,
    createBooking as createBookingService,
    rescheduleBookingById,
} from "../services/booking.service.js";

import { validateBookingInput } from "../validators/booking.validator.js";
import { validateBookingId } from "../validators/cancel-booking.validator.js";
import { validateRescheduleBookingInput } from "../validators/reschedule-booking.validator.js";

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


export async function rescheduleBooking(
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

    const input = validateRescheduleBookingInput(req.body);

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid rescheduling request",
        });
        return;
    }

    try {
        const result = await rescheduleBookingById(
            bookingId,
            input.startTime,
        );

        if (!result.ok) {
            switch (result.reason) {
                case "booking_not_found":
                    res.status(404).json({
                        status: "error",
                        message: result.reason,
                    });
                    return;

                case "booking_not_reschedulable":
                case "outside_availability":
                case "slot_unavailable":
                    res.status(409).json({
                        status: "error",
                        message: result.reason,
                    });
                    return;
            }
        }

        res.status(200).json({
            status: "success",
            data: result.booking,
        });
    } catch (error) {
        next(error);
    }
}
