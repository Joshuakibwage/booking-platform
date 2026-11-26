
export function BookingsSkeleton() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
            <span className="sr-only">
                Loading customer bookings...
            </span>

            {Array.from({ length: 2 }).map((_, index) => (
                <div
                    key={index}
                    aria-hidden="true"
                    className="h-56 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                />
            ))}
        </div>
    );
}
