import type { BookingStatus } from "@/lib/api/booking.api";

const statusLabels: Record<BookingStatus, string> = {
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    no_show: "No show",
};

const statusDots: Record<BookingStatus, string> = {
    confirmed: "bg-emerald-500",
    cancelled: "bg-destructive",
    completed: "bg-blue-500",
    no_show: "bg-muted-foreground/50",
};

type BookingStatusIndicatorProps = {
    status: BookingStatus;
};

export function BookingStatusIndicator({
    status,
}: BookingStatusIndicatorProps) {
    return (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
                aria-hidden="true"
                className={`size-1.5 shrink-0 rounded-full ${statusDots[status]}`}
            />

            {statusLabels[status]}
        </p>
    );
}