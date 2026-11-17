
import pool from "../db.js";
import type { PublicProfessionalFilters } from "../validators/public-professional.validator.js";

export type ProfessionalProfile = {
    profile_id: string;
    user_id: string;
    public_name: string;
    bio: string | null;
    time_zone: string;
    created_at: Date;
};

export type CreateProfessionalProfileInput = {
    userId: string;
    publicName: string;
    bio?: string | null;
    timeZone: string;
};

export async function findProfessionalProfileIdByUserId(
    userId: string,
): Promise<string | null> {
    const result = await pool.query<{ profile_id: string }>(
        `
        SELECT profile_id
        FROM professional_profiles
        WHERE user_id = $1
        `,
        [userId],
    );

    return result.rows[0]?.profile_id ?? null;
}

export type AuthenticatedProfessionalProfile = {
    profile_id: string;
    user_id: string;
    public_name: string;
    bio: string | null;
    time_zone: string;
    image_url: string | null;
    created_at: Date;
};

export async function findProfessionalProfileByUserId(
    userId: string,
): Promise<AuthenticatedProfessionalProfile | null> {
    const result = await pool.query<AuthenticatedProfessionalProfile>(
        `
        SELECT
            profile_id,
            user_id,
            public_name,
            bio,
            time_zone,
            image_url,
            created_at
        FROM professional_profiles
        WHERE user_id = $1
        `,
        [userId],
    );

    return result.rows[0] ?? null;
}

export async function createProfessionalProfile(
    input: CreateProfessionalProfileInput,
): Promise<ProfessionalProfile> {
    const result = await pool.query<ProfessionalProfile>(
        `
        INSERT INTO professional_profiles (
            user_id,
            public_name,
            bio,
            time_zone
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            profile_id,
            user_id,
            public_name,
            bio,
            time_zone,
            created_at
        `,
        [
            input.userId,
            input.publicName,
            input.bio ?? null,
            input.timeZone,
        ],
    );

    return result.rows[0]!;
}

export type UpdateProfessionalProfileInput = {
    userId: string;
    publicName?: string;
    bio?: string | null;
    timeZone?: string;
};

export async function updateProfessionalProfile(
    input: UpdateProfessionalProfileInput,
): Promise<ProfessionalProfile | null> {
    const result = await pool.query<ProfessionalProfile>(
        `
        UPDATE professional_profiles
        SET
            public_name = CASE
                WHEN $2::boolean THEN $3::varchar
                ELSE public_name
            END,
            bio = CASE
                WHEN $4::boolean THEN $5::text
                ELSE bio
            END,
            time_zone = CASE
                WHEN $6::boolean THEN $7::varchar
                ELSE time_zone
            END
        WHERE user_id = $1
        RETURNING
            profile_id,
            user_id,
            public_name,
            bio,
            time_zone,
            created_at
        `,
        [
            input.userId,
            input.publicName !== undefined,
            input.publicName ?? null,
            input.bio !== undefined,
            input.bio ?? null,
            input.timeZone !== undefined,
            input.timeZone ?? null,
        ],
    );

    return result.rows[0] ?? null;
}

export type PublicProfessionalProfile = {
    profile_id: string;
    public_name: string;
    bio: string | null;
    time_zone: string;
    image_url: string | null;
    created_at: Date;
};

export type PublicProfessionalProfileSummary = {
    profile_id: string;
    public_name: string;
    bio: string | null;
    time_zone: string;
    image_url: string | null;
    service_count: number;
};

export async function findProfessionalProfileById(
    profileId: string,
): Promise<PublicProfessionalProfile | null> {
    const result = await pool.query<PublicProfessionalProfile>(
        `
        SELECT
            profile_id,
            public_name,
            bio,
            time_zone,
            image_url,
            created_at
        FROM professional_profiles
        WHERE profile_id = $1
        `,
        [profileId],
    );

    return result.rows[0] ?? null;
}

export type UpdateProfessionalProfileImageResult = {
    image_url: string;
    image_public_id: string;
    previous_image_public_id: string | null;
};

export async function updateProfessionalProfileImage(
    userId: string,
    imageUrl: string,
    imagePublicId: string,
): Promise<UpdateProfessionalProfileImageResult | null> {
    const result = await pool.query<UpdateProfessionalProfileImageResult>(
        `
        WITH previous AS MATERIALIZED (
            SELECT image_public_id
            FROM professional_profiles
            WHERE user_id = $1
        ),
        updated AS (
            UPDATE professional_profiles
            SET
                image_url = $2,
                image_public_id = $3
            WHERE user_id = $1
            RETURNING image_url, image_public_id
        )
        SELECT
            updated.image_url,
            updated.image_public_id,
            previous.image_public_id AS previous_image_public_id
        FROM updated
        CROSS JOIN previous
        `,
        [userId, imageUrl, imagePublicId],
    );

    return result.rows[0] ?? null;
}


export async function findPublicProfessionals(
    filters: PublicProfessionalFilters = {},
): Promise<PublicProfessionalProfileSummary[]> {
    const search = filters.search?.trim() || null;
    const category = filters.category?.trim() || null;

    const result = await pool.query<PublicProfessionalProfileSummary>(
        `
        SELECT
            p.profile_id,
            p.public_name,
            p.bio,
            p.time_zone,
            p.image_url,
            (
                SELECT COUNT(*)::integer
                FROM services AS count_s
                WHERE count_s.professional_id = p.profile_id
                  AND count_s.is_active = TRUE
            ) AS service_count
        FROM professional_profiles AS p
        WHERE EXISTS (
            SELECT 1
            FROM services AS s
            WHERE s.professional_id = p.profile_id
              AND s.is_active = TRUE
              AND (
                  $2::text IS NULL
                  OR EXISTS (
                      SELECT 1
                      FROM service_categories AS c
                      WHERE c.category_id = s.category_id
                        AND c.is_active = TRUE
                        AND c.slug = $2
                  )
              )
        )
          AND (
              $1::text IS NULL
              OR p.public_name ILIKE '%' || $1 || '%'
              OR p.bio ILIKE '%' || $1 || '%'
          )
        ORDER BY p.created_at DESC, p.profile_id DESC
        `,
        [search, category],
    );

    return result.rows;
}
