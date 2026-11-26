
import { motion, useReducedMotion } from "motion/react";

type BookingsEmptyStateProps = {
    hasStatusFilter: boolean;
};

export function BookingsEmptyState({
    hasStatusFilter,
}: BookingsEmptyStateProps) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.45 }}
            className="relative isolate overflow-hidden rounded-3xl rounded-tr-[5rem] bg-secondary px-8 py-14 sm:px-12 sm:py-16"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 -z-10 size-28 rounded-tl-full bg-primary/15 sm:size-40"
            />

            <h3 className="text-lg font-medium">
                {hasStatusFilter
                    ? "No matching bookings"
                    : "No customer bookings yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {hasStatusFilter
                    ? "Try selecting a different status."
                    : "Bookings made by your customers will appear here."}
            </p>
        </motion.div>
    );
}
