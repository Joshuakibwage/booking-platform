export interface LoginInput {
    email: string;
    password: string;
}

export function validateLoginInput(
    input: unknown,
): LoginInput | null {
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

    if (typeof body.password !== "string") {
        return null;
    }

    if (body.password.length === 0 || body.password.length > 128) {
        return null;
    }

    return {
        email,
        password: body.password,
    };
}