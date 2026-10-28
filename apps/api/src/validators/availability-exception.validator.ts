import type {
    CreateAvailabilityExceptionInput,
    UpdateAvailabilityExceptionInput,
} from "../repositories/availability.repository.js";

type AvailabilityExceptionFields = {
    exceptionDate: string;
    isAvailable: boolean;
    startTime?: string | null;
    endTime?: string | null;
    reason?: string | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function isObjectBody(
    body: unknown,
): body is Record<string, unknown> {
    return typeof body === "object" && body !== null && !Array.isArray(body);
}

function isValidDate(value: unknown): value is string {
    if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year!, month! - 1, day!));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month! - 1 &&
        date.getUTCDate() === day
    );
}

function isValidTime(value: unknown): value is string {
    return typeof value === "string" && TIME_PATTERN.test(value);
}

function isValidReason(value: unknown): value is string | null | undefined {
    return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.length <= 1000)
    );
}

function validateExceptionFields(
    input: Record<string, unknown>,
): input is Record<string, unknown> & AvailabilityExceptionFields {
    if (
        !isValidDate(input.exceptionDate) ||
        typeof input.isAvailable !== "boolean" ||
        !isValidReason(input.reason)
    ) {
        return false;
    }

    if (input.isAvailable === false) {
        return (
            (input.startTime === undefined || input.startTime === null) &&
            (input.endTime === undefined || input.endTime === null)
        );
    }

    if (!isValidTime(input.startTime) || !isValidTime(input.endTime)) {
        return false;
    }

    return input.startTime < input.endTime;
}

export function validateCreateAvailabilityException(
    body: unknown,
): Omit<CreateAvailabilityExceptionInput, "professionalId"> | null {
    if (!isObjectBody(body) || !validateExceptionFields(body)) {
        return null;
    }

    return {
        exceptionDate: body.exceptionDate,
        isAvailable: body.isAvailable,
        startTime: body.startTime ?? null,
        endTime: body.endTime ?? null,
        reason: body.reason ?? null,
    };
}

export function validateUpdateAvailabilityException(
    body: unknown,
): Omit<UpdateAvailabilityExceptionInput, "professionalId" | "exceptionId"> | null {
    if (!isObjectBody(body) || !validateExceptionFields(body)) {
        return null;
    }

    return {
        exceptionDate: body.exceptionDate,
        isAvailable: body.isAvailable,
        startTime: body.startTime ?? null,
        endTime: body.endTime ?? null,
        reason: body.reason ?? null,
    };
}