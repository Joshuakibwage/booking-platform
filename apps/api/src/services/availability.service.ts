import type { PoolClient } from "pg";
import {
    findAvailabilityException,
    findWeeklyAvailability,
} from "../repositories/availability.repository.js";

type LocalDateTime = {
    date: string;
    time: string;
    dayOfWeek: number;
};

function getLocalDateTime(
    date: Date,
    timeZone: string,
): LocalDateTime {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value]),
    );

    const year = values.year!;
    const month = values.month!;
    const day = values.day!;
    const hour = values.hour!;
    const minute = values.minute!;
    const second = values.second!;

    const localDate = `${year}-${month}-${day}`;

    // UTC is used here only to calculate the weekday from
    // the already-extracted local calendar date.
    const weekday = new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day)),
    ).getUTCDay();

    return {
        date: localDate,
        time: `${hour}:${minute}:${second}`,
        dayOfWeek: weekday === 0 ? 7 : weekday,
    };
}

export async function isWithinAvailability(
    professionalId: string,
    timeZone: string,
    startTime: Date,
    endTime: Date,
    client?: PoolClient,
): Promise<boolean> {
    if (
        !Number.isFinite(startTime.getTime()) ||
        !Number.isFinite(endTime.getTime()) ||
        endTime <= startTime
    ) {
        return false;
    }

    let localStart: LocalDateTime;
    let localEnd: LocalDateTime;

    try {
        localStart = getLocalDateTime(startTime, timeZone);
        localEnd = getLocalDateTime(endTime, timeZone);
    } catch {
        // For example, Intl rejects an invalid time-zone identifier.
        return false;
    }

    // This schedule model supports appointments within one
    // local calendar date, not overnight appointments.
    if (localStart.date !== localEnd.date) {
        return false;
    }

    const exception = await findAvailabilityException(
        professionalId,
        localStart.date,
        client,
    );

    if (exception) {
        if (!exception.is_available) {
            return false;
        }

        return (
            exception.start_time !== null &&
            exception.end_time !== null &&
            localStart.time >= exception.start_time &&
            localEnd.time <= exception.end_time
        );
    }

    const windows = await findWeeklyAvailability(
        professionalId,
        localStart.dayOfWeek,
        client
    );

    return windows.some(
        (window) =>
            localStart.time >= window.start_time &&
            localEnd.time <= window.end_time,
    );
}
