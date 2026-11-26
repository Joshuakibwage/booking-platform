
import pool from "../db.js";
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

export type BookingStatus =
    | "confirmed"
    | "cancelled"
    | "completed"
    | "no_show";

export type BookingOwner =
    | {
          type: "customer";
          id: string;
      }
    | {
          type: "professional";
          id: string;
      };

export type BookingActor = {
    userId: string;
    professionalProfileId: string | null;
};

export type FindBookingsInput = {
    owner: BookingOwner;
    status?: BookingStatus;
    from?: string;
    to?: string;
    page: number;
    limit: number;
};

export type BookingListItem = CreatedBooking & {
    customer_display_name: string;
    professional_time_zone: string;
};

export type FindBookingsResult = {
    bookings: BookingListItem[];
    total: number;
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

export async function findBookings(
    input: FindBookingsInput,
): Promise<FindBookingsResult> {

    const ownerColumn =
        input.owner.type === "customer"
            ? "b.customer_id"
            : "b.professional_id";

    const conditions: string[] = [`${ownerColumn} = $1`];

    const values: unknown[] = [input.owner.id];

    if (input.status) {
        values.push(input.status);
        conditions.push(`b.status = $${values.length}`);
    }

    if (input.from) {
        values.push(input.from);
        conditions.push(`b.start_time >= $${values.length}::date`);
    }

    if (input.to) {
        const dayAfterTo = new Date(`${input.to}T00:00:00Z`);
        dayAfterTo.setUTCDate(dayAfterTo.getUTCDate() + 1);

        values.push(dayAfterTo.toISOString().slice(0, 10));
        conditions.push(`b.start_time < $${values.length}::date`);
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await pool.query<{ total: string }>(
        `
        SELECT COUNT(*) AS total
        FROM bookings AS b
        WHERE ${whereClause}
        `,
        values,
    );

    const total = Number(countResult.rows[0]?.total ?? 0);
    const offset = (input.page - 1) * input.limit;

    const paginationValues = [
        ...values,
        input.limit,
        offset,
    ];

    const bookingsResult = await pool.query<BookingListItem>(
        `
        SELECT
            b.booking_id,
            b.customer_id,
            b.professional_id,
            b.service_id,
            b.service_name,
            b.service_duration_minutes,
            b.service_price,
            b.start_time,
            b.end_time,
            b.status,
            b.created_at,
            u.display_name AS customer_display_name,
            p.time_zone AS professional_time_zone
        FROM bookings AS b
        INNER JOIN users AS u
            ON u.user_id = b.customer_id
        INNER JOIN professional_profiles AS p
            ON p.profile_id = b.professional_id
        WHERE ${whereClause}
        ORDER BY b.start_time DESC, b.booking_id DESC
        LIMIT $${paginationValues.length - 1}
        OFFSET $${paginationValues.length}
        `,
        paginationValues,
    );

    return {
        bookings: bookingsResult.rows,
        total,
    };
}

export async function cancelBooking(
    bookingId: string,
    actor: BookingActor,
): Promise<CreatedBooking | null> {
    const result = await pool.query<CreatedBooking>(
        `
        UPDATE bookings
        SET status = 'cancelled'
        WHERE booking_id = $1
          AND status = 'confirmed'
          AND (
              customer_id = $2
              OR ($3::uuid IS NOT NULL AND professional_id = $3)
          )
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
        [bookingId, actor.userId, actor.professionalProfileId],
    );

    return result.rows[0] ?? null;
}


export async function rescheduleBooking(
    bookingId: string,
    startTime: Date,
    actor: BookingActor,
    client?: PoolClient,
): Promise<CreatedBooking | null> {
    const db = client ?? pool;

    const result = await db.query<CreatedBooking>(
        `
        UPDATE bookings
        SET
            start_time = $2,
            end_time = $2 + (service_duration_minutes * INTERVAL '1 minute')
        WHERE booking_id = $1
          AND status = 'confirmed'
          AND (
              customer_id = $3
              OR ($4::uuid IS NOT NULL AND professional_id = $4)
          )
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
            bookingId,
            startTime,
            actor.userId,
            actor.professionalProfileId,
        ],
    );

    return result.rows[0] ?? null;
}

export async function findBookingById(
    bookingId: string,
    client?: PoolClient,
): Promise<CreatedBooking | null> {
    const db = client ?? pool;

    const result = await db.query<CreatedBooking>(
        `
        SELECT
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
        FROM bookings
        WHERE booking_id = $1
        FOR UPDATE
        `,
        [bookingId],
    );

    return result.rows[0] ?? null;
}

export async function findBookingByIdForActor(
    bookingId: string,
    actor: BookingActor,
): Promise<CreatedBooking | null> {
    const result = await pool.query<CreatedBooking>(
        `
        SELECT
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
        FROM bookings
        WHERE booking_id = $1
          AND (
              customer_id = $2
              OR ($3::uuid IS NOT NULL AND professional_id = $3)
          )
        `,
        [bookingId, actor.userId, actor.professionalProfileId],
    );

    return result.rows[0] ?? null;
}