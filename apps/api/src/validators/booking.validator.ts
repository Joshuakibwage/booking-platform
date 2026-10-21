
import type { CreateBookingInput } from "../types/booking.types.js";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateBookingInput(
    input: unknown,
): CreateBookingInput | null {
    if (
        typeof input !== "object" ||
        input === null ||
        Array.isArray(input)
    ) {
        return null;
    }

    const body = input as Record<string, unknown>;

    if (
        typeof body.customerId !== "string" ||
        !UUID_PATTERN.test(body.customerId)
    ) {
        return null;
    }

    if (
        typeof body.serviceId !== "string" ||
        !UUID_PATTERN.test(body.serviceId)
    ) {
        return null;
    }

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
        customerId: body.customerId,
        serviceId: body.serviceId,
        startTime: body.startTime,
    };
}
