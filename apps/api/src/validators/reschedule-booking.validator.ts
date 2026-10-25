import type { RescheduleBookingInput } from "../types/booking.types.js";

export function validateRescheduleBookingInput(
    input: unknown,
): RescheduleBookingInput | null {
    if (
        typeof input !== "object" ||
        input === null ||
        Array.isArray(input)
    ) {
        return null;
    }

    const body = input as Record<string, unknown>;

    const hasExplicitTimeZone =
        typeof body.startTime === "string" &&
        /(?:Z|[+-]\d{2}:\d{2})$/i.test(body.startTime);

    if (
        typeof body.startTime !== "string" ||
        !hasExplicitTimeZone ||
        !Number.isFinite(Date.parse(body.startTime))
    ) {
        return null;
    }

    return {
        startTime: body.startTime,
    };
}