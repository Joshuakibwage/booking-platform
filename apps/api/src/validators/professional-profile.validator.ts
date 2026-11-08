
export type CreateProfessionalProfileInput = {
    publicName: string;
    bio?: string | null;
    timeZone: string;
};

export type UpdateProfessionalProfileInput = {
    publicName?: string;
    bio?: string | null;
    timeZone?: string;
};

function isValidPublicName(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 && trimmedValue.length <= 100;
}

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

    if (!isValidPublicName(input.publicName)) {
        return null;
    }

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
        publicName: input.publicName.trim(),
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

    const hasPublicName = Object.hasOwn(input, "publicName");
    const hasBio = Object.hasOwn(input, "bio");
    const hasTimeZone = Object.hasOwn(input, "timeZone");

    if (!hasPublicName && !hasBio && !hasTimeZone) {
        return null;
    }

    if (hasPublicName && !isValidPublicName(input.publicName)) {
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
        ...(hasPublicName
            ? { publicName: (input.publicName as string).trim() }
            : {}),
        ...(hasBio ? { bio: input.bio as string | null } : {}),
        ...(hasTimeZone ? { timeZone: input.timeZone as string } : {}),
    };
}
