
import type { PoolClient } from "pg";
import type { ServiceForBooking } from "./service.repository.js";

export type NewBooking = {
    customerId: string;
    service: ServiceForBooking;
    startTime: Date;
    endTime: Date;
};

export type CreatedBooking = {
    booking_id: string;
    customer_id: string;
    professional_id: string;
    service_id: string;
    service_name: string;
    service_duration_minutes: number;
    service_price: string;
    start_time: Date;
    end_time: Date;
    status: string;
    created_at: Date;
};

export async function insertBooking(
    client: PoolClient,
    booking: NewBooking,
): Promise<CreatedBooking> {
    const result = await client.query<CreatedBooking>(
        `
        INSERT INTO bookings (
            customer_id,
            professional_id,
            service_id,
            service_name,
            service_duration_minutes,
            service_price,
            start_time,
            end_time
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
            booking_id,
            customer_id,
            professional_id,
            service_id,
            service_name,
            service_duration_minutes,
            service_price,
            start_time,
            end_time,
            status,
            created_at
        `,
        [
            booking.customerId,
            booking.service.professional_id,
            booking.service.service_id,
            booking.service.name,
            booking.service.duration_minutes,
            booking.service.price,
            booking.startTime,
            booking.endTime,
        ],
    );

    const createdBooking = result.rows[0];

    if (!createdBooking) {
        throw new Error("Booking insert returned no record");
    }

    return createdBooking;
}
