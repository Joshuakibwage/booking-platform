
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";

type BookingsErrorStateProps = {
    onRetry: () => void;
};

export function BookingsErrorState({
    onRetry,
}: BookingsErrorStateProps) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.45 }}
            className="rounded-xl border border-destructive/30 p-8 sm:p-10"
        >
            <p className="font-medium">
                We couldn&apos;t load your bookings.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
                Please check your connection and try again.
            </p>

            <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-6"
            >
                Try again
            </Button>
        </motion.div>
    );
}
