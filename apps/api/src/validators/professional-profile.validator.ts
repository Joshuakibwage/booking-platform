
export type CreateProfessionalProfileInput = {
    bio?: string | null;
    timeZone: string;
};

export type UpdateProfessionalProfileInput = {
    bio?: string | null;
    timeZone?: string;
};

function isValidTimeZone(value: unknown): value is string {
    if (typeof value !== "string" || value.trim() === "") {
        return false;
    }

    try {
        new Intl.DateTimeFormat("en-US", {
            timeZone: value,
        });

        return true;
    } catch {
        return false;
    }
}

export function validateCreateProfessionalProfile(
    body: unknown,
): CreateProfessionalProfileInput | null {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return null;
    }

    const input = body as Record<string, unknown>;

    if (!isValidTimeZone(input.timeZone)) {
        return null;
    }

    if (
        input.bio !== undefined &&
        input.bio !== null &&
        typeof input.bio !== "string"
    ) {
        return null;
    }

    if (typeof input.bio === "string" && input.bio.length > 5000) {
        return null;
    }

    return {
        timeZone: input.timeZone,
        ...(input.bio !== undefined ? { bio: input.bio as string | null } : {}),
    };
}

export function validateUpdateProfessionalProfile(
    body: unknown,
): UpdateProfessionalProfileInput | null {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return null;
    }

    const input = body as Record<string, unknown>;
    const hasBio = Object.hasOwn(input, "bio");
    const hasTimeZone = Object.hasOwn(input, "timeZone");

    if (!hasBio && !hasTimeZone) {
        return null;
    }

    if (
        hasBio &&
        input.bio !== null &&
        (typeof input.bio !== "string" || input.bio.length > 5000)
    ) {
        return null;
    }

    if (hasTimeZone && !isValidTimeZone(input.timeZone)) {
        return null;
    }

    return {
        ...(hasBio ? { bio: input.bio as string | null } : {}),
        ...(hasTimeZone ? { timeZone: input.timeZone as string } : {}),
    };
}
