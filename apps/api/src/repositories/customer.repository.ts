
import pool from "../db.js";
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
