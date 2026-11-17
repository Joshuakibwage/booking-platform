export type PublicProfessionalFilters = {
    search?: string;
    category?: string;
};

export function validatePublicProfessionalFilters(
    query: unknown,
): PublicProfessionalFilters | null {
    if (
        typeof query !== "object" ||
        query === null ||
        Array.isArray(query)
    ) {
        return null;
    }

    const params = query as Record<string, unknown>;

    if (
        params.search !== undefined &&
        typeof params.search !== "string"
    ) {
        return null;
    }

    if (
        params.category !== undefined &&
        typeof params.category !== "string"
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

    if (search.length > 100 || category.length > 120) {
        return null;
    }

    return {
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
    };
}