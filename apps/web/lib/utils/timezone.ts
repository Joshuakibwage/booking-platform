function getDateParts(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    return Object.fromEntries(
        parts.map(({ type, value }) => [type, value]),
    ) as Record<string, string>;
}

export function getTodayInTimeZone(timeZone: string): string {
    const { year, month, day } = getDateParts(new Date(), timeZone);

    return `${year}-${month}-${day}`;
}

export function zonedDateTimeToIso(
    date: string,
    time: string,
    timeZone: string,
): string {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute, second = 0] = time.split(":").map(Number);

    const targetTime = Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
        second,
    );

    let timestamp = targetTime;

    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    });

    for (let attempt = 0; attempt < 4; attempt++) {
        const parts = Object.fromEntries(
            formatter
                .formatToParts(new Date(timestamp))
                .map(({ type, value }) => [type, value]),
        ) as Record<string, string>;

        const representedTime = Date.UTC(
            Number(parts.year),
            Number(parts.month) - 1,
            Number(parts.day),
            Number(parts.hour),
            Number(parts.minute),
            Number(parts.second),
        );

        const difference = targetTime - representedTime;

        if (difference === 0) break;

        timestamp += difference;
    }

    return new Date(timestamp).toISOString();
}