
import pool from "../db.js";
import type { PoolClient } from "pg";

export type ServiceForBooking = {
    service_id: string;
    professional_id: string;
    name: string;
    duration_minutes: number;
    price: string;
    time_zone: string;
};

export async function findActiveServiceById(
    serviceId: string,
    client?: PoolClient,
): Promise<ServiceForBooking | null> {

    const db = client ?? pool;

    const result = await db.query<ServiceForBooking>(
        `
        SELECT
            s.service_id,
            s.professional_id,
            s.name,
            s.duration_minutes,
            s.price,
            p.time_zone
        FROM services AS s
        JOIN professional_profiles AS p
            ON p.profile_id = s.professional_id
        WHERE s.service_id = $1
          AND s.is_active = TRUE
        `,
        [serviceId],
    );

    return result.rows[0] ?? null;
}
