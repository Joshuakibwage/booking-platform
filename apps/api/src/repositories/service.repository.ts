
import pool from "../db.js";
import type { PoolClient } from "pg";

export type ProfessionalService = {
    service_id: string;
    professional_id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    is_active: boolean;
    created_at: Date;
};

export type PublicService = {
    service_id: string;
    professional_id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    created_at: Date;
    professional_name: string;
    category_name: string | null;
    category_slug: string | null;
};

export type PublicServiceFilters = {
    search?: string;
    category?: string;
};

export type CreateServiceInput = {
    professionalId: string;
    categoryId: string;
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
    categoryId?: string;
    name?: string;
    description?: string | null;
    durationMinutes?: number;
    price?: number;
};

export type ProfessionalServiceWithCategory = ProfessionalService & {
    category_name: string | null;
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
            category_id,
            name,
            description,
            duration_minutes,
            price
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            service_id,
            professional_id,
            category_id,
            name,
            description,
            duration_minutes,
            price,
            is_active,
            created_at
        `,
        [
            input.professionalId,
            input.categoryId,
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
): Promise<ProfessionalServiceWithCategory[]> {
    const result = await pool.query<ProfessionalServiceWithCategory>(
        `
        SELECT
            s.service_id,
            s.professional_id,
            s.category_id,
            c.name AS category_name,
            s.name,
            s.description,
            s.duration_minutes,
            s.price,
            s.is_active,
            s.created_at
        FROM services AS s
        LEFT JOIN service_categories AS c
            ON c.category_id = s.category_id
           AND c.is_active = TRUE
        WHERE s.professional_id = $1
          AND s.is_active = TRUE
        ORDER BY s.created_at DESC, s.service_id DESC
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
            category_id = CASE
                WHEN $3::boolean THEN $4::uuid
                ELSE category_id
            END,
            name = CASE
                WHEN $5::boolean THEN $6::varchar
                ELSE name
            END,
            description = CASE
                WHEN $7::boolean THEN $8::text
                ELSE description
            END,
            duration_minutes = CASE
                WHEN $9::boolean THEN $10::integer
                ELSE duration_minutes
            END,
            price = CASE
                WHEN $11::boolean THEN $12::numeric
                ELSE price
            END
        WHERE service_id = $1
          AND professional_id = $2
          AND is_active = TRUE
        RETURNING
            service_id,
            professional_id,
            category_id,
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
            input.categoryId !== undefined,
            input.categoryId ?? null,
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
            category_id,
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

export async function findPublicServices(
    filters: PublicServiceFilters = {},
): Promise<PublicService[]> {
    const search = filters.search?.trim() || null;
    const category = filters.category?.trim() || null;

    const result = await pool.query<PublicService>(
        `
        SELECT
            s.service_id,
            s.professional_id,
            s.category_id,
            s.name,
            s.description,
            s.duration_minutes,
            s.price,
            s.created_at,
            p.public_name AS professional_name,
            c.name AS category_name,
            c.slug AS category_slug
        FROM services AS s
        JOIN professional_profiles AS p
            ON p.profile_id = s.professional_id
        LEFT JOIN service_categories AS c
            ON c.category_id = s.category_id
           AND c.is_active = TRUE
        WHERE s.is_active = TRUE
          AND ($1::text IS NULL OR (
              s.name ILIKE '%' || $1 || '%'
              OR s.description ILIKE '%' || $1 || '%'
          ))
          AND ($2::text IS NULL OR c.slug = $2)
        ORDER BY s.created_at DESC, s.service_id DESC
        `,
        [search, category],
    );

    return result.rows;
}
