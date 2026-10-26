
export interface RegisterInput {
    email: string;
    password: string;
    displayName: string;
}

export function validateRegisterInput(
    input: unknown,
): RegisterInput | null {
    if (
        typeof input !== "object" ||
        input === null ||
        Array.isArray(input)
    ) {
        return null;
    }

    const body = input as Record<string, unknown>;

    if (typeof body.email !== "string") {
        return null;
    }

    const email = body.email.trim().toLowerCase();

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return null;
    }

    if (
        typeof body.password !== "string" ||
        body.password.length < 12 ||
        body.password.length > 128
    ) {
        return null;
    }

    if (typeof body.displayName !== "string") {
        return null;
    }

    const displayName = body.displayName.trim();

    if (displayName.length < 2 || displayName.length > 100) {
        return null;
    }

    return {
        email,
        password: body.password,
        displayName,
    };
}
