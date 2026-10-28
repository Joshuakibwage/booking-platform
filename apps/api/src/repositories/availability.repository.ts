import pool from "../db.js";
import type { PoolClient } from "pg";

export type AvailabilityException = {
    exception_id: string;
    exception_date: string;
    is_available: boolean;
    start_time: string | null;
    end_time: string | null;
    reason: string | null;
};

export type CreateAvailabilityExceptionInput = {
    professionalId: string;
    exceptionDate: string;
    isAvailable: boolean;
    startTime?: string | null;
    endTime?: string | null;
    reason?: string | null;
};

export type WeeklyAvailability = {
    start_time: string;
    end_time: string;
};

export type WeeklyAvailabilityPeriod = WeeklyAvailability & {
    availability_id: string;
    day_of_week: number;
};

export type CreateWeeklyAvailabilityInput = {
    professionalId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

export type OccupiedBookingInterval = {
    start_time: Date;
    end_time: Date;
};


export type UpdateAvailabilityExceptionInput = {
    exceptionId: string;
    professionalId: string;
    exceptionDate: string;
    isAvailable: boolean;
    startTime?: string | null;
    endTime?: string | null;
    reason?: string | null;
};

export async function listAvailabilityExceptions(
    professionalId: string,
): Promise<AvailabilityException[]> {
    const result = await pool.query<AvailabilityException>(
        `
        SELECT
            exception_id,
            exception_date,
            is_available,
            start_time,
            end_time,
            reason
        FROM availability_exceptions
        WHERE professional_id = $1
        ORDER BY exception_date
        `,
        [professionalId],
    );

    return result.rows;
}

export async function createAvailabilityException(
    input: CreateAvailabilityExceptionInput,
): Promise<AvailabilityException> {
    const result = await pool.query<AvailabilityException>(
        `
        INSERT INTO availability_exceptions (
            professional_id,
            exception_date,
            is_available,
            start_time,
            end_time,
            reason
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            exception_id,
            exception_date,
            is_available,
            start_time,
            end_time,
            reason
        `,
        [
            input.professionalId,
            input.exceptionDate,
            input.isAvailable,
            input.startTime ?? null,
            input.endTime ?? null,
            input.reason ?? null,
        ],
    );

    const exception = result.rows[0];

    if (!exception) {
        throw new Error("Failed to create availability exception");
    }

    return exception;
}

export async function updateAvailabilityException(
    input: UpdateAvailabilityExceptionInput,
): Promise<AvailabilityException | null> {
    const result = await pool.query<AvailabilityException>(
        `
        UPDATE availability_exceptions
        SET exception_date = $3,
            is_available = $4,
            start_time = $5,
            end_time = $6,
            reason = $7
        WHERE exception_id = $1
          AND professional_id = $2
        RETURNING
            exception_id,
            exception_date,
            is_available,
            start_time,
            end_time,
            reason
        `,
        [
            input.exceptionId,
            input.professionalId,
            input.exceptionDate,
            input.isAvailable,
            input.startTime ?? null,
            input.endTime ?? null,
            input.reason ?? null,
        ],
    );

    return result.rows[0] ?? null;
}

export async function deleteAvailabilityException(
    exceptionId: string,
    professionalId: string,
): Promise<boolean> {
    const result = await pool.query(
        `
        DELETE FROM availability_exceptions
        WHERE exception_id = $1
          AND professional_id = $2
        RETURNING exception_id
        `,
        [exceptionId, professionalId],
    );

    return result.rowCount === 1;
}

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

export async function listWeeklyAvailability(
    professionalId: string,
): Promise<WeeklyAvailabilityPeriod[]> {
    const result = await pool.query<WeeklyAvailabilityPeriod>(
        `
        SELECT availability_id, day_of_week, start_time, end_time
        FROM weekly_availability
        WHERE professional_id = $1
        ORDER BY day_of_week, start_time
        `,
        [professionalId],
    );

    return result.rows;
}

export async function createWeeklyAvailability(
    input: CreateWeeklyAvailabilityInput,
): Promise<WeeklyAvailabilityPeriod> {
    const result = await pool.query<WeeklyAvailabilityPeriod>(
        `
        INSERT INTO weekly_availability (
            professional_id,
            day_of_week,
            start_time,
            end_time
        )
        VALUES ($1, $2, $3, $4)
        RETURNING availability_id, day_of_week, start_time, end_time
        `,
        [
            input.professionalId,
            input.dayOfWeek,
            input.startTime,
            input.endTime,
        ],
    );

    const period = result.rows[0];

    if (!period) {
        throw new Error("Failed to create weekly availability");
    }

    return period;
}

export type UpdateWeeklyAvailabilityInput = {
    availabilityId: string;
    professionalId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

export async function updateWeeklyAvailability(
    input: UpdateWeeklyAvailabilityInput,
): Promise<WeeklyAvailabilityPeriod | null> {
    const result = await pool.query<WeeklyAvailabilityPeriod>(
        `
        UPDATE weekly_availability
        SET day_of_week = $3,
            start_time = $4,
            end_time = $5
        WHERE availability_id = $1
          AND professional_id = $2
        RETURNING availability_id, day_of_week, start_time, end_time
        `,
        [
            input.availabilityId,
            input.professionalId,
            input.dayOfWeek,
            input.startTime,
            input.endTime,
        ],
    );

    return result.rows[0] ?? null;
}

export async function deleteWeeklyAvailability(
    availabilityId: string,
    professionalId: string,
): Promise<boolean> {
    const result = await pool.query(
        `
        DELETE FROM weekly_availability
        WHERE availability_id = $1
          AND professional_id = $2
        RETURNING availability_id
        `,
        [availabilityId, professionalId],
    );

    return result.rowCount === 1;
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


export async function findConfirmedBookingsForDate(
    professionalId: string,
    dayStart: Date,
    dayEnd: Date,
    client?: PoolClient,
): Promise<OccupiedBookingInterval[]> {
    const db = client ?? pool;

    const result = await db.query<OccupiedBookingInterval>(
        `
        SELECT start_time, end_time
        FROM bookings
        WHERE professional_id = $1
          AND status = 'confirmed'
          AND start_time < $3
          AND end_time > $2
        ORDER BY start_time
        `,
        [professionalId, dayStart, dayEnd],
    );

    return result.rows;
}
