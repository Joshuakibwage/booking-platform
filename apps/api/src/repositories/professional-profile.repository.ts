
import pool from "../db.js";

export type ProfessionalProfile = {
    profile_id: string;
    user_id: string;
    bio: string | null;
    time_zone: string;
    created_at: Date;
};

export type CreateProfessionalProfileInput = {
    userId: string;
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


export async function createProfessionalProfile(
    input: CreateProfessionalProfileInput,
): Promise<ProfessionalProfile> {
    const result = await pool.query<ProfessionalProfile>(
        `
        INSERT INTO professional_profiles (
            user_id,
            bio,
            time_zone
        )
        VALUES ($1, $2, $3)
        RETURNING
            profile_id,
            user_id,
            bio,
            time_zone,
            created_at
        `,
        [
            input.userId,
            input.bio ?? null,
            input.timeZone,
        ],
    );

    return result.rows[0]!;
}



export type UpdateProfessionalProfileInput = {
    userId: string;
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
            bio = CASE
                WHEN $2::boolean THEN $3::text
                ELSE bio
            END,
            time_zone = CASE
                WHEN $4::boolean THEN $5::varchar
                ELSE time_zone
            END
        WHERE user_id = $1
        RETURNING
            profile_id,
            user_id,
            bio,
            time_zone,
            created_at
        `,
        [
            input.userId,
            input.bio !== undefined,
            input.bio ?? null,
            input.timeZone !== undefined,
            input.timeZone ?? null,
        ],
    );

    return result.rows[0] ?? null;
}



export type PublicProfessionalProfile = ProfessionalProfile & {
    display_name: string;
};

export async function findProfessionalProfileById(
    profileId: string,
): Promise<PublicProfessionalProfile | null> {
    const result = await pool.query<PublicProfessionalProfile>(
        `
        SELECT
            p.profile_id,
            p.user_id,
            u.display_name,
            p.bio,
            p.time_zone,
            p.created_at
        FROM professional_profiles AS p
        JOIN users AS u
            ON u.user_id = p.user_id
        WHERE p.profile_id = $1
        `,
        [profileId],
    );

    return result.rows[0] ?? null;
}
