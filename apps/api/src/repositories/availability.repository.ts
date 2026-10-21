import pool from "../db.js";
import type { PoolClient } from "pg";

export type AvailabilityException = {
    is_available: boolean;
    start_time: string | null;
    end_time: string | null;
};

export type WeeklyAvailability = {
    start_time: string;
    end_time: string;
};

export async function findAvailabilityException(
    professionalId: string,
    localDate: string,
    client?: PoolClient,
): Promise<AvailabilityException | null> {
    const db = client ?? pool;

    const result = await db.query<AvailabilityException>(
        `
        SELECT is_available, start_time, end_time
        FROM availability_exceptions
        WHERE professional_id = $1
          AND exception_date = $2
        `,
        [professionalId, localDate],
    );

    return result.rows[0] ?? null;
}

export async function findWeeklyAvailability(
    professionalId: string,
    dayOfWeek: number,
    client?: PoolClient,
): Promise<WeeklyAvailability[]> {
    const db = client ?? pool;

    const result = await db.query<WeeklyAvailability>(
        `
        SELECT start_time, end_time
        FROM weekly_availability
        WHERE professional_id = $1
          AND day_of_week = $2
        ORDER BY start_time
        `,
        [professionalId, dayOfWeek],
    );

    return result.rows;
}
