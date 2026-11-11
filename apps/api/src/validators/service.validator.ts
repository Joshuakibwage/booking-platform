
export type CreateServiceInput = {
    name: string;
    description?: string | null;
    durationMinutes: number;
    price: number;
    categoryId: string;
};

export type UpdateServiceInput = {
    name?: string;
    description?: string | null;
    durationMinutes?: number;
    price?: number;
    categoryId?: string;
};

function isObject(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function isValidName(value: unknown): value is string {
    return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        value.length <= 120
    );
}

function isValidDescription(
    value: unknown,
): value is string | null {
    return (
        value === null ||
        (typeof value === "string" && value.length <= 5000)
    );
}

function isValidDuration(value: unknown): value is number {
    return (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value > 0
    );
}

function isValidPrice(value: unknown): value is number {
    return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 99_999_999.99 &&
        Number.isInteger(value * 100)
    );
}

function isValidCategoryId(value: unknown): value is string {
    return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value,
        )
    );
}

export function validateCreateService(
    body: unknown,
): CreateServiceInput | null {
    if (!isObject(body)) {
        return null;
    }

    if (
        !isValidName(body.name) ||
        !isValidDuration(body.durationMinutes) ||
        !isValidPrice(body.price) ||
        !isValidCategoryId(body.categoryId)
    ) {
        return null;
    }

    if (
        body.description !== undefined &&
        !isValidDescription(body.description)
    ) {
        return null;
    }

    return {
        name: body.name.trim(),
        durationMinutes: body.durationMinutes,
        price: body.price,
        categoryId: body.categoryId,
        ...(body.description !== undefined
            ? { description: body.description }
            : {}),
    };
}

export function validateUpdateService(
    body: unknown,
): UpdateServiceInput | null {
    if (!isObject(body)) {
        return null;
    }

    const hasName = Object.hasOwn(body, "name");
    const hasDescription = Object.hasOwn(body, "description");
    const hasDuration = Object.hasOwn(body, "durationMinutes");
    const hasPrice = Object.hasOwn(body, "price");
    const hasCategoryId = Object.hasOwn(body, "categoryId");

    if (
        !hasName &&
        !hasDescription &&
        !hasDuration &&
        !hasPrice &&
        !hasCategoryId
    ) {
        return null;
    }

    if (hasName && !isValidName(body.name)) {
        return null;
    }

    if (
        hasDescription &&
        !isValidDescription(body.description)
    ) {
        return null;
    }

    if (hasDuration && !isValidDuration(body.durationMinutes)) {
        return null;
    }

    if (hasPrice && !isValidPrice(body.price)) {
        return null;
    }

    if (hasCategoryId && !isValidCategoryId(body.categoryId)) {
        return null;
    }

    return {
        ...(hasName ? { name: (body.name as string).trim() } : {}),
        ...(hasDescription
            ? { description: body.description as string | null }
            : {}),
        ...(hasDuration
            ? { durationMinutes: body.durationMinutes as number }
            : {}),
        ...(hasPrice ? { price: body.price as number } : {}),
        ...(hasCategoryId
            ? { categoryId: body.categoryId as string }
            : {}),
    };
}
