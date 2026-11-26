
"use client";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import { BookingCard } from "./booking-card";

import type { BookingListItem } from "@/lib/api/booking.api";

type BookingsListProps = {
    bookings: BookingListItem[];
    onViewDetails: (booking: BookingListItem) => void;
    onCancel: (booking: BookingListItem) => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function BookingsList({
    bookings,
    onViewDetails,
    onCancel,
}: BookingsListProps) {
    const reduce = useReducedMotion();

    const listVariants: Variants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: reduce ? 0 : 0.06,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: reduce ? 0 : 14,
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: reduce ? 0 : 0.55,
                ease: EASE,
            },
        },
        exit: {
            opacity: 0,
            scale: reduce ? 1 : 0.97,
            transition: {
                duration: reduce ? 0 : 0.22,
                ease: EASE,
            },
        },
    };

    return (
        <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            variants={listVariants}
            initial="hidden"
            animate="show"
        >
            <AnimatePresence mode="popLayout">
                {bookings.map((booking) => (
                    <motion.div
                        key={booking.booking_id}
                        layout
                        variants={cardVariants}
                        exit="exit"
                        transition={{
                            layout: {
                                duration: reduce ? 0 : 0.4,
                                ease: EASE,
                            },
                        }}
                    >
                        <BookingCard
                            booking={booking}
                            onViewDetails={onViewDetails}
                            onCancel={onCancel}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
