
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { usePublicAvailability } from "@/hooks/public/use-public-availability";
import { useCreateBooking } from "@/hooks/customer/use-create-booking";
import {
    getTodayInTimeZone,
    zonedDateTimeToIso,
} from "@/lib/utils/timezone";

type BookingSchedulerProps = {
    serviceId: string;
    professionalId: string;
    timeZone: string;
};

export function BookingScheduler({
    serviceId,
    professionalId,
    timeZone,
}: BookingSchedulerProps) {
    const [date, setDate] = useState(() =>
        getTodayInTimeZone(timeZone),
    );
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const availability = usePublicAvailability(
        professionalId,
        serviceId,
        date,
    );

    const createBooking = useCreateBooking();

    function handleDateChange(value: string) {
        setDate(value);
        setSelectedSlot(null);
    }

    async function handleBooking() {
        if (!selectedSlot) return;

        try {
            const startTime = zonedDateTimeToIso(
                date,
                selectedSlot,
                timeZone,
            );

            await createBooking.mutateAsync({
                booking: {
                    serviceId,
                    startTime,
                },
                professionalId,
                date,
            });

            toast.success("Booking created successfully.");
            setSelectedSlot(null);
        } catch {
            toast.error(
                "Unable to create your booking. Please try again.",
            );
        }
    }

    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Choose a date</h2>

                <input
                    type="date"
                    value={date}
                    min={getTodayInTimeZone(timeZone)}
                    onChange={(event) =>
                        handleDateChange(event.target.value)
                    }
                    className="rounded-md border px-3 py-2"
                />
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Available times</h2>

                {availability.isPending && (
                    <p className="text-sm text-muted-foreground">
                        Loading available times...
                    </p>
                )}

                {availability.isError && (
                    <div className="space-y-2">
                        <p className="text-sm text-destructive">
                            Could not load availability.
                        </p>
                        <button
                            type="button"
                            onClick={() => availability.refetch()}
                            className="text-sm underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {availability.data?.slots.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No available times for this date. Try another date.
                    </p>
                )}

                <div className="flex flex-wrap gap-2">
                    {availability.data?.slots.map((slot) => (
                        <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => setSelectedSlot(slot.startTime)}
                            aria-pressed={selectedSlot === slot.startTime}
                            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                                selectedSlot === slot.startTime
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:bg-accent"
                            }`}
                        >
                            {slot.startTime}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="button"
                disabled={!selectedSlot || createBooking.isPending}
                onClick={handleBooking}
                className="rounded-md bg-primary px-5 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
                {createBooking.isPending
                    ? "Booking..."
                    : "Confirm booking"}
            </button>
        </section>
    );
}
