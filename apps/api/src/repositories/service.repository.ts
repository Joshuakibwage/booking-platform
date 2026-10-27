
import pool from "../db.js";
import type { PoolClient } from "pg";

export type ProfessionalService = {
    service_id: string;
    professional_id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    is_active: boolean;
    created_at: Date;
};

export type CreateServiceInput = {
    professionalId: string;
    name: string;
    description?: string | null;
    durationMinutes: number;
    price: number;
};

export type ServiceForBooking = {
    service_id: string;
    professional_id: string;
    name: string;
    duration_minutes: number;
    price: string;
    time_zone: string;
};


export type UpdateServiceInput = {
    serviceId: string;
    professionalId: string;
    name?: string;
    description?: string | null;
    durationMinutes?: number;
    price?: number;
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

export async function createService(
    input: CreateServiceInput,
): Promise<ProfessionalService> {
    const result = await pool.query<ProfessionalService>(
        `
        INSERT INTO services (
            professional_id,
            name,
            description,
            duration_minutes,
            price
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            service_id,
            professional_id,
            name,
            description,
            duration_minutes,
            price,
            is_active,
            created_at
        `,
        [
            input.professionalId,
            input.name,
            input.description ?? null,
            input.durationMinutes,
            input.price,
        ],
    );

    const service = result.rows[0];

    if (!service) {
        throw new Error("Service insert returned no record");
    }

    return service;
}


export async function findActiveServicesByProfessionalId(
    professionalId: string,
): Promise<ProfessionalService[]> {
    const result = await pool.query<ProfessionalService>(
        `
        SELECT
            service_id,
            professional_id,
            name,
            description,
            duration_minutes,
            price,
            is_active,
            created_at
        FROM services
        WHERE professional_id = $1
          AND is_active = TRUE
        ORDER BY created_at DESC, service_id DESC
        `,
        [professionalId],
    );

    return result.rows;
}


export async function updateService(
    input: UpdateServiceInput,
): Promise<ProfessionalService | null> {
    const result = await pool.query<ProfessionalService>(
        `
        UPDATE services
        SET
            name = CASE
                WHEN $3::boolean THEN $4::varchar
                ELSE name
            END,
            description = CASE
                WHEN $5::boolean THEN $6::text
                ELSE description
            END,
            duration_minutes = CASE
                WHEN $7::boolean THEN $8::integer
                ELSE duration_minutes
            END,
            price = CASE
                WHEN $9::boolean THEN $10::numeric
                ELSE price
            END
        WHERE service_id = $1
          AND professional_id = $2
          AND is_active = TRUE
        RETURNING
            service_id,
            professional_id,
            name,
            description,
            duration_minutes,
            price,
            is_active,
            created_at
        `,
        [
            input.serviceId,
            input.professionalId,
            input.name !== undefined,
            input.name ?? null,
            input.description !== undefined,
            input.description ?? null,
            input.durationMinutes !== undefined,
            input.durationMinutes ?? null,
            input.price !== undefined,
            input.price ?? null,
        ],
    );

    return result.rows[0] ?? null;
}


export async function deactivateService(
    serviceId: string,
    professionalId: string,
): Promise<ProfessionalService | null> {
    const result = await pool.query<ProfessionalService>(
        `
        UPDATE services
        SET is_active = FALSE
        WHERE service_id = $1
          AND professional_id = $2
          AND is_active = TRUE
        RETURNING
            service_id,
            professional_id,
            name,
            description,
            duration_minutes,
            price,
            is_active,
            created_at
        `,
        [serviceId, professionalId],
    );

    return result.rows[0] ?? null;
}
