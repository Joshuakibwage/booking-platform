import type { PoolClient } from "pg";
import {
    findAvailabilityException,
    findWeeklyAvailability,
    findConfirmedBookingsForDate,
} from "../repositories/availability.repository.js";
import { findActiveServiceById } from "../repositories/service.repository.js";

type LocalDateTime = {
    date: string;
    time: string;
    dayOfWeek: number;
};

export type AvailableSlot = {
    startTime: string;
    endTime: string;
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


function localDateTimeToDate(
    date: string,
    time: string,
    timeZone: string,
): Date {
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    // Start by treating the local date/time as UTC.
    const utcGuess = Date.UTC(
        year!,
        month! - 1,
        day!,
        hours!,
        minutes!,
    );

    // Find how that instant appears in the professional's time zone.
    const local = getLocalDateTime(new Date(utcGuess), timeZone);

    const [localYear, localMonth, localDay] = local.date
        .split("-")
        .map(Number);
    const [localHours, localMinutes] = local.time.split(":").map(Number);

    const representedAsUtc = Date.UTC(
        localYear!,
        localMonth! - 1,
        localDay!,
        localHours!,
        localMinutes!,
    );

    // Correct the initial guess by the time-zone difference.
    return new Date(utcGuess - (representedAsUtc - utcGuess));
}


function getDayBoundaries(
    date: string,
    timeZone: string,
): { dayStart: Date; dayEnd: Date } {
    const dayStart = localDateTimeToDate(date, "00:00", timeZone);

    const [year, month, day] = date.split("-").map(Number);
    const nextDay = new Date(
        Date.UTC(year!, month! - 1, day! + 1),
    );

    const nextDate = [
        nextDay.getUTCFullYear(),
        String(nextDay.getUTCMonth() + 1).padStart(2, "0"),
        String(nextDay.getUTCDate()).padStart(2, "0"),
    ].join("-");

    const dayEnd = localDateTimeToDate(
        nextDate,
        "00:00",
        timeZone,
    );

    return { dayStart, dayEnd };
}


export function generateCandidateSlots(
    windowStart: string,
    windowEnd: string,
    durationMinutes: number,
    intervalMinutes = 15,
): { startTime: string; endTime: string }[] {
    if (
        !Number.isInteger(durationMinutes) ||
        durationMinutes <= 0 ||
        !Number.isInteger(intervalMinutes) ||
        intervalMinutes <= 0
    ) {
        return [];
    }

    function toMinutes(time: string): number | null {
        const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);

        if (!match) {
            return null;
        }

        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        const seconds = Number(match[3] ?? "0");

        if (
            hours < 0 ||
            hours > 24 ||
            minutes < 0 ||
            minutes > 59 ||
            seconds !== 0 ||
            (hours === 24 && (minutes !== 0 || seconds !== 0))
        ) {
            return null;
        }

        return hours * 60 + minutes;
    }

    function toTimeString(totalMinutes: number): string {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    const startMinutes = toMinutes(windowStart);
    const endMinutes = toMinutes(windowEnd);

    if (
        startMinutes === null ||
        endMinutes === null ||
        endMinutes <= startMinutes
    ) {
        return [];
    }

    const latestStartMinutes = endMinutes - durationMinutes;

    if (latestStartMinutes < startMinutes) {
        return [];
    }

    const slots: { startTime: string; endTime: string }[] = [];

    for (
        let start = startMinutes;
        start <= latestStartMinutes;
        start += intervalMinutes
    ) {
        const end = start + durationMinutes;

        slots.push({
            startTime: toTimeString(start),
            endTime: toTimeString(end),
        });
    }

    return slots;
}

async function findWorkingWindowsForDate(
    professionalId: string,
    date: string,
    timeZone: string,
    client?: PoolClient,
): Promise<{ start_time: string; end_time: string }[]> {

    const exception = await findAvailabilityException(
        professionalId,
        date,
        client,
    );

    if (exception) {
        if (!exception.is_available) {
            return [];
        }

        if (
            exception.start_time === null ||
            exception.end_time === null
        ) {
            return [];
        }

        return [
            {
                start_time: exception.start_time,
                end_time: exception.end_time,
            },
        ];
    }

    const [year, month, day] = date.split("-").map(Number);

    const weekday = new Date(
        Date.UTC(year!, month! - 1, day!),
    ).getUTCDay();

    const dayOfWeek = weekday === 0 ? 7 : weekday;

    return findWeeklyAvailability(
        professionalId,
        dayOfWeek,
        client,
    );
}



export async function getAvailableSlots(
    professionalId: string,
    serviceId: string,
    date: string,
): Promise<{
    timeZone: string;
    slots: AvailableSlot[];
} | null> {
    const service = await findActiveServiceById(serviceId);

    if (!service || service.professional_id !== professionalId) {
        return null;
    }

    const windows = await findWorkingWindowsForDate(
        professionalId,
        date,
        service.time_zone,
    );

    if (windows.length === 0) {
        return {
            timeZone: service.time_zone,
            slots: [],
        };
    }
    
    // 1. Generate possible slots within the working windows.
    const candidateSlots = windows.flatMap((window) =>
        generateCandidateSlots(
            window.start_time,
            window.end_time,
            service.duration_minutes,
        ),
    );

    // 2. Fetch confirmed bookings that overlap this local calendar day.
    const { dayStart, dayEnd } = getDayBoundaries(
        date,
        service.time_zone,
    );

    const bookings = await findConfirmedBookingsForDate(
        professionalId,
        dayStart,
        dayEnd,
    );

    // 3. Keep only slots that do not overlap existing bookings.
    return {
        timeZone: service.time_zone,
        slots: candidateSlots.filter((slot) => {
            const slotStart = localDateTimeToDate(
                date,
                slot.startTime,
                service.time_zone,
            );

            const slotEnd = localDateTimeToDate(
                date,
                slot.endTime,
                service.time_zone,
            );

            return !bookings.some(
                (booking) =>
                    slotStart < booking.end_time &&
                    slotEnd > booking.start_time,
            );
        }),
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
