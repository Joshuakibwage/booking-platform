
import type {
    BookingStatus,
    FindBookingsInput,
} from "../repositories/booking.repository.js";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const BOOKING_STATUSES: BookingStatus[] = [
    "confirmed",
    "cancelled",
    "completed",
    "no_show",
];

function isValidDate(value: unknown): value is string {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year!, month! - 1, day!));

    return (
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month! - 1 &&
        parsedDate.getUTCDate() === day
    );
}

export function validateBookingsListInput(
    ownerType: "customer" | "professional",
    ownerId: unknown,
    query: unknown,
): FindBookingsInput | null {
    if (
        typeof ownerId !== "string" ||
        !UUID_PATTERN.test(ownerId) ||
        typeof query !== "object" ||
        query === null ||
        Array.isArray(query)
    ) {
        return null;
    }

    const params = query as Record<string, unknown>;

    let status: BookingStatus | undefined;
    let from: string | undefined;
    let to: string | undefined;

    if (params.status !== undefined) {
        if (
            typeof params.status !== "string" ||
            !BOOKING_STATUSES.includes(params.status as BookingStatus)
        ) {
            return null;
        }

        status = params.status as BookingStatus;
    }

    if (params.from !== undefined) {
        if (!isValidDate(params.from)) {
            return null;
        }

        from = params.from;
    }

    if (params.to !== undefined) {
        if (!isValidDate(params.to)) {
            return null;
        }

        to = params.to;
    }

    if (from && to && from > to) {
        return null;
    }

    const page = params.page === undefined
        ? 1
        : Number(params.page);

    const limit = params.limit === undefined
        ? 20
        : Number(params.limit);

    if (
        (params.page !== undefined &&
            (typeof params.page !== "string" ||
                params.page.trim() === "")) ||
        (params.limit !== undefined &&
            (typeof params.limit !== "string" ||
                params.limit.trim() === "")) ||
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        return null;
    }

    return {
        owner: {
            type: ownerType,
            id: ownerId,
        },
        ...(status !== undefined ? { status } : {}),
        ...(from !== undefined ? { from } : {}),
        ...(to !== undefined ? { to } : {}),
        page,
        limit,
    };
}
