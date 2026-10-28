import type {
    CreateWeeklyAvailabilityInput,
    UpdateWeeklyAvailabilityInput,
} from "../repositories/availability.repository.js";

type WeeklyAvailabilityFields = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function isValidTime(value: unknown): value is string {
    return typeof value === "string" && TIME_PATTERN.test(value);
}

function isValidWeeklyAvailabilityFields(
    input: Record<string, unknown>,
): input is Record<string, unknown> & WeeklyAvailabilityFields {
    if (
        typeof input.dayOfWeek !== "number" ||
        !Number.isInteger(input.dayOfWeek) ||
        input.dayOfWeek < 1 ||
        input.dayOfWeek > 7 ||
        !isValidTime(input.startTime) ||
        !isValidTime(input.endTime)
    ) {
        return false;
    }

    return input.startTime < input.endTime;
}

function isObjectBody(
    body: unknown,
): body is Record<string, unknown> {
    return typeof body === "object" && body !== null && !Array.isArray(body);
}

export function validateCreateWeeklyAvailability(
    body: unknown,
): Omit<CreateWeeklyAvailabilityInput, "professionalId"> | null {
    if (!isObjectBody(body) || !isValidWeeklyAvailabilityFields(body)) {
        return null;
    }

    return {
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
    };
}

export function validateUpdateWeeklyAvailability(
    body: unknown,
): Omit<UpdateWeeklyAvailabilityInput, "professionalId" | "availabilityId"> | null {
    if (!isObjectBody(body) || !isValidWeeklyAvailabilityFields(body)) {
        return null;
    }

    return {
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
    };
}