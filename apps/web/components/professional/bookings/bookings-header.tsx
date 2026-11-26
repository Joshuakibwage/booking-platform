
import type { BookingStatus } from "@/lib/api/booking.api";

type BookingsHeaderProps = {
    total: number | undefined;
    status: BookingStatus | "";
    onStatusChange: (status: string) => void;
};

export function BookingsHeader({
    total,
    status,
    onStatusChange,
}: BookingsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold">
                    Customer bookings
                </h2>

                {total !== undefined && (
                    <p className="text-sm text-muted-foreground">
                        {total} bookings
                    </p>
                )}
            </div>

            <label className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Status</span>

                <select
                    value={status}
                    onChange={(event) =>
                        onStatusChange(event.target.value)
                    }
                    className="h-9 rounded-lg border border-input bg-background px-3 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="">All bookings</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No show</option>
                </select>
            </label>
        </div>
    );
}
