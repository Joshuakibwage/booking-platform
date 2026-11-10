import pool from "../db.js";

export type ServiceCategory = {
    category_id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    is_active: boolean;
    display_order: number;
    created_at: Date;
};

export async function findActiveServiceCategories(): Promise<
    ServiceCategory[]
> {
    const result = await pool.query<ServiceCategory>(
        `
        SELECT
            category_id,
            name,
            slug,
            description,
            image_url,
            is_active,
            display_order,
            created_at
        FROM service_categories
        WHERE is_active = TRUE
        ORDER BY display_order ASC, name ASC
        `,
    );

    return result.rows;
}

export async function findActiveServiceCategoryBySlug(
    slug: string,
): Promise<ServiceCategory | null> {
    const result = await pool.query<ServiceCategory>(
        `
        SELECT
            category_id,
            name,
            slug,
            description,
            image_url,
            is_active,
            display_order,
            created_at
        FROM service_categories
        WHERE slug = $1
          AND is_active = TRUE
        `,
        [slug],
    );

    return result.rows[0] ?? null;
}