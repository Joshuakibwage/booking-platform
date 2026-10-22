
const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AvailabilityInput = {
    professionalId: string;
    serviceId: string;
    date: string;
};

export function validateAvailabilityInput(
    professionalId: unknown,
    serviceId: unknown,
    date: unknown,
): AvailabilityInput | null {
    if (
        typeof professionalId !== "string" ||
        !UUID_PATTERN.test(professionalId) ||
        typeof serviceId !== "string" ||
        !UUID_PATTERN.test(serviceId) ||
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return null;
    }

    const [year, month, day] = date.split("-").map(Number);

    const parsedDate = new Date(Date.UTC(year!, month! - 1, day!));

    const isRealDate =
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month! - 1 &&
        parsedDate.getUTCDate() === day;

    if (!isRealDate) {
        return null;
    }

    return {
        professionalId,
        serviceId,
        date,
    };
}
