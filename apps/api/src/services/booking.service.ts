
import { customerExists } from "../repositories/customer.repository.js";
import { findActiveServiceById } from "../repositories/service.repository.js";
import type { CreateBookingInput } from "../types/booking.types.js";
import { isWithinAvailability } from "./availability.service.js";
import type { PoolClient } from "pg";
import pool from "../db.js";
import {
    findBookings,
    insertBooking,
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
