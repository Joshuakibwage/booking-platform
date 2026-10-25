
import { customerExists } from "../repositories/customer.repository.js";
import { findActiveServiceById } from "../repositories/service.repository.js";
import type { CreateBookingInput } from "../types/booking.types.js";
import { isWithinAvailability } from "./availability.service.js";
import type { PoolClient } from "pg";
import pool from "../db.js";

import {
    cancelBooking,
    findBookingById,
    findBookings,
    insertBooking,
    rescheduleBooking,
    type CreatedBooking,
    type FindBookingsInput,
} from "../repositories/booking.repository.js";


export type BookingPreparation =
    | {
          ok: true;
          customerId: string;
          service: NonNullable<
              Awaited<ReturnType<typeof findActiveServiceById>>
          >;
          startTime: Date;
          endTime: Date;
      }
    | {
          ok: false;
          reason:
              | "customer_not_found"
              | "service_not_found"
              | "outside_availability";
      };



export type GetBookingsResult = {
    bookings: CreatedBooking[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type CancelBookingResult =
    | {
          ok: true;
          booking: CreatedBooking;
      }
    | {
          ok: false;
          reason: "booking_not_found" | "booking_not_cancellable";
      };


export type CreateBookingResult =
    | {
          ok: true;
          booking: CreatedBooking;
      }
    | {
          ok: false;
          reason:
              | "customer_not_found"
              | "service_not_found"
              | "outside_availability"
              | "slot_unavailable";
      };

export type RescheduleBookingResult =
    | {
          ok: true;
          booking: CreatedBooking;
      }
    | {
          ok: false;
          reason:
              | "booking_not_found"
              | "booking_not_reschedulable"
              | "outside_availability"
              | "slot_unavailable";
      };



export async function prepareBooking(
    input: CreateBookingInput,
    client?: PoolClient,
): Promise<BookingPreparation> {

    const customerFound = await customerExists(input.customerId, client);

    if (!customerFound) {
        return {
            ok: false,
            reason: "customer_not_found",
        };
    }

    const service = await findActiveServiceById(input.serviceId, client);

    if (!service) {
        return {
            ok: false,
            reason: "service_not_found",
        };
    }

    const startTime = new Date(input.startTime);
    const endTime = new Date(
        startTime.getTime() + service.duration_minutes * 60_000,
    );


    const available = await isWithinAvailability(
        service.professional_id,
        service.time_zone,
        startTime,
        endTime,
        client,
    );

    if (!available) {
        return {
            ok: false,
            reason: "outside_availability",
        };
    }


    return {
        ok: true,
        customerId: input.customerId,
        service,
        startTime,
        endTime,
    };
}



export async function createBooking(
    input: CreateBookingInput,
): Promise<CreateBookingResult> {

    const client = await pool.connect();

    let transactionStarted = false;

    try {
        await client.query("BEGIN");

        transactionStarted = true;

        const prepared = await prepareBooking(input, client);

        if (!prepared.ok) {
            await client.query("ROLLBACK");
            return prepared;
        }

        const booking = await insertBooking(client, {
            customerId: prepared.customerId,
            service: prepared.service,
            startTime: prepared.startTime,
            endTime: prepared.endTime,
        });

        await client.query("COMMIT");

        return {
            ok: true,
            booking,
        };
    } catch (error) {
       
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch {
                // Preserve the original error if rollback fails.
            }
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23P01"
        ) {
            return {
                ok: false,
                reason: "slot_unavailable",
            };
        }

        throw error;
    } finally {
        client.release();
    }
}




export async function getBookings(
    input: FindBookingsInput,
): Promise<GetBookingsResult> {
    const result = await findBookings(input);

    return {
        bookings: result.bookings,
        pagination: {
            page: input.page,
            limit: input.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / input.limit),
        },
    };
}



export async function cancelBookingById(
    bookingId: string,
): Promise<CancelBookingResult> {
    const booking = await cancelBooking(bookingId);

    if (booking) {
        return {
            ok: true,
            booking,
        };
    }

    const existingBooking = await findBookingById(bookingId);

    if (!existingBooking) {
        return {
            ok: false,
            reason: "booking_not_found",
        };
    }

    return {
        ok: false,
        reason: "booking_not_cancellable",
    };
}



export async function rescheduleBookingById(
    bookingId: string,
    newStartTime: string,
): Promise<RescheduleBookingResult> {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        const existingBooking = await findBookingById(bookingId, client);

        if (!existingBooking) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                ok: false,
                reason: "booking_not_found",
            };
        }

        if (existingBooking.status !== "confirmed") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                ok: false,
                reason: "booking_not_reschedulable",
            };
        }

        const startTime = new Date(newStartTime);
        const endTime = new Date(
            startTime.getTime() +
                existingBooking.service_duration_minutes * 60_000,
        );

        // Retrieve the professional's time zone without requiring
        // the service to still be active.
        const profileResult = await client.query<{ time_zone: string }>(
            `
            SELECT time_zone
            FROM professional_profiles
            WHERE profile_id = $1
            `,
            [existingBooking.professional_id],
        );

        const profile = profileResult.rows[0];

        if (!profile) {
            throw new Error("Professional profile not found for booking");
        }

        const available = await isWithinAvailability(
            existingBooking.professional_id,
            profile.time_zone,
            startTime,
            endTime,
            client,
        );

        if (!available) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                ok: false,
                reason: "outside_availability",
            };
        }

        const booking = await rescheduleBooking(
            bookingId,
            startTime,
            client,
        );

        if (!booking) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                ok: false,
                reason: "booking_not_reschedulable",
            };
        }

        await client.query("COMMIT");
        transactionStarted = false;

        return {
            ok: true,
            booking,
        };
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch {
                // Preserve the original error if rollback fails.
            }
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23P01"
        ) {
            return {
                ok: false,
                reason: "slot_unavailable",
            };
        }

        throw error;
    } finally {
        client.release();
    }
}
