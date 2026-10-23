
import type { Request, Response } from "express";
import { customerExists } from "../repositories/customer.repository.js";
import { getBookings } from "../services/booking.service.js";
import { validateBookingsListInput } from "../validators/bookings-list.validator.js";

export async function getCustomerBookings(
    req: Request,
    res: Response,
): Promise<void> {
    const input = validateBookingsListInput(
        "customer",
        req.params.customerId,
        req.query,
    );

    if (!input) {
        res.status(400).json({
            status: "error",
            message: "Invalid bookings list request",
        });
        return;
    }

    const exists = await customerExists(input.owner.id);

    if (!exists) {
        res.status(404).json({
            status: "error",
            message: "customer_not_found",
        });
        return;
    }

    const result = await getBookings(input);

    res.status(200).json({
        status: "success",
        data: result,
    });
}
