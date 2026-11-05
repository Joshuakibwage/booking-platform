
import pool from "../db.js";
import type { CurrentUser, RegisteredUser } from "../types/auth.types.js";
import type { PoolClient } from "pg";

export async function customerExists(
    customerId: string,
    client?: PoolClient,
): Promise<boolean> {
    const db = client ?? pool;

    const result = await db.query(
        `
        SELECT 1
        FROM users
        WHERE user_id = $1
        `,
        [customerId],
    );

    return result.rowCount !== null && result.rowCount > 0;
}

export async function createUser(
    email: string,
    passwordHash: string,
    displayName: string,
): Promise<RegisteredUser> {
    const result = await pool.query<{
        user_id: string;
        email: string;
        display_name: string;
    }>(
        `
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING user_id, email, display_name
        `,
        [email, passwordHash, displayName],
    );

    const user = result.rows[0];

    if (!user) {
        throw new Error("Failed to create user");
    }

    return {
        userId: user.user_id,
        email: user.email,
        displayName: user.display_name,
    };
};


export async function findUserByEmail(email: string): Promise<{
    userId: string;
    email: string;
    displayName: string;
    passwordHash: string;
} | null> {
    const result = await pool.query<{
        user_id: string;
        email: string;
        display_name: string;
        password_hash: string;
    }>(
        `
        SELECT user_id, email, display_name, password_hash
        FROM users
        WHERE email = $1
        `,
        [email],
    );

    const user = result.rows[0];

    if (!user) {
        return null;
    }

    return {
        userId: user.user_id,
        email: user.email,
        displayName: user.display_name,
        passwordHash: user.password_hash,
    };
};

export async function findUserById(
    userId: string,
): Promise<CurrentUser | null> {
    const result = await pool.query<{
        user_id: string;
        email: string;
        display_name: string;
        has_professional_profile: boolean;
    }>(
        `
        SELECT
            u.user_id,
            u.email,
            u.display_name,
            EXISTS (
                SELECT 1
                FROM professional_profiles pp
                WHERE pp.user_id = u.user_id
            ) AS has_professional_profile
        FROM users u
        WHERE u.user_id = $1
        `,
        [userId],
    );

    const user = result.rows[0];

    if (!user) {
        return null;
    }

    return {
        userId: user.user_id,
        email: user.email,
        displayName: user.display_name,
        hasProfessionalProfile: user.has_professional_profile,
    };
}