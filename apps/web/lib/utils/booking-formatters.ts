export function formatBookingDate(value: string, timeZone: string) {
    return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone,
    }).format(new Date(value));
}

export function formatBookingTime(value: string, timeZone: string) {
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        timeZone,
    }).format(new Date(value));
}

export function formatBookingMonth(value: string, timeZone: string) {
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        timeZone,
    }).format(new Date(value));
}

export function formatBookingDay(value: string, timeZone: string) {
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        timeZone,
    }).format(new Date(value));
}

export function formatBookingPrice(value: string) {
    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}