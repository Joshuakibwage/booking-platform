
export type PublicServiceFilters = {
    search?: string;
    category?: string;
    professionalId?: string;
};

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validatePublicServiceFilters(
    query: unknown,
): PublicServiceFilters | null {
    if (
        typeof query !== "object" ||
        query === null ||
        Array.isArray(query)
    ) {
        return null;
    }

    const params = query as Record<string, unknown>;

    if (
        (params.search !== undefined &&
            typeof params.search !== "string") ||
        (params.category !== undefined &&
            typeof params.category !== "string") ||
        (params.professionalId !== undefined &&
            typeof params.professionalId !== "string")
    ) {
        return null;
    }

    const search =
        typeof params.search === "string"
            ? params.search.trim()
            : "";

    const category =
        typeof params.category === "string"
            ? params.category.trim()
            : "";

    const professionalId =
        typeof params.professionalId === "string"
            ? params.professionalId.trim()
            : "";

    if (
        search.length > 100 ||
        category.length > 120 ||
        (professionalId && !UUID_REGEX.test(professionalId))
    ) {
        return null;
    }

    return {
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
        ...(professionalId ? { professionalId } : {}),
    };
}
