
import pool from "../db.js";

export type BookingNotificationDetails = {
    booking_id: string;
    customer_email: string;
    customer_name: string;
    professional_email: string;
    professional_name: string;
    service_name: string;
    start_time: Date;
    end_time: Date;
    status: string;
    time_zone: string;
};

export async function findBookingNotificationDetails(
    bookingId: string,
): Promise<BookingNotificationDetails | null> {
    const result = await pool.query<BookingNotificationDetails>(
        `
        SELECT
            b.booking_id,
            customer.email AS customer_email,
            customer.display_name AS customer_name,
            professional.email AS professional_email,
            professional.display_name AS professional_name,
            b.service_name,
            b.start_time,
            b.end_time,
            b.status,
            profile.time_zone
        FROM bookings AS b
        JOIN users AS customer
            ON customer.user_id = b.customer_id
        JOIN professional_profiles AS profile
            ON profile.profile_id = b.professional_id
        JOIN users AS professional
            ON professional.user_id = profile.user_id
        WHERE b.booking_id = $1
        `,
        [bookingId],
    );

    return result.rows[0] ?? null;
}
