
import pool from "../db.js";

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
