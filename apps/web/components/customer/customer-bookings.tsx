"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCancelBooking } from "@/hooks/customer/use-cancel-booking";
import { useCustomerBookings } from "@/hooks/customer/use-customer-bookings";

import type {
    Booking,
    BookingStatus,
    BookingListFilters,
} from "@/lib/api/booking.api";

const EASE = [0.22, 1, 0.36, 1] as const;

const statusLabels: Record<BookingStatus, string> = {
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    no_show: "No show",
};

// A small dot carries the status color; the label stays quiet.
const statusDots: Record<BookingStatus, string> = {
    confirmed: "bg-emerald-500",
    cancelled: "bg-destructive",
    completed: "bg-blue-500",
    no_show: "bg-muted-foreground/50",
};

function formatBookingDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(value));
}

function formatBookingTime(value: string) {
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatPrice(value: string) {
    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

export function CustomerBookings() {
    const reduce = useReducedMotion();

    const [status, setStatus] = useState<BookingStatus | "">("");
    const [page, setPage] = useState(1);
    const [selectedBooking, setSelectedBooking] =
        useState<Booking | null>(null);

    const bookingsQuery = useCustomerBookings({
        page,
        limit: 10,
        ...(status ? { status } : {}),
    } satisfies BookingListFilters);

    const cancelBookingMutation = useCancelBooking();
    const result = bookingsQuery.data;

    function handleStatusChange(value: string) {
        setStatus(value as BookingStatus | "");
        setPage(1);
    }

    async function handleCancelBooking() {
        if (!selectedBooking) return;

        try {
            await cancelBookingMutation.mutateAsync(
                selectedBooking.booking_id,
            );

            toast.success("Booking cancelled successfully.");
            setSelectedBooking(null);
        } catch {
            toast.error(
                "Unable to cancel your booking. Please try again.",
            );
        }
    }

    // Cards rise in one after another; later changes animate on their own.
    const list: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
    };

    const cardMotion: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 14 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.55, ease: EASE },
        },
        exit: {
            opacity: 0,
            scale: reduce ? 1 : 0.97,
            transition: { duration: reduce ? 0 : 0.22, ease: EASE },
        },
    };

    const fadeIn = {
        initial: { opacity: 0, y: reduce ? 0 : 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: reduce ? 0 : 0.45, ease: EASE },
    };

    return (
        <section className="mt-8 space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        Your bookings
                    </h2>

                    {result && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {result.pagination.total}{" "}
                            {result.pagination.total === 1
                                ? "booking"
                                : "bookings"}{" "}
                            in total
                        </p>
                    )}
                </div>

                <label className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                        Status
                    </span>

                    <select
                        value={status}
                        onChange={(event) =>
                            handleStatusChange(event.target.value)
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

            {bookingsQuery.isPending && (
                <div
                    role="status"
                    aria-live="polite"
                    className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                    <span className="sr-only">Loading your bookings...</span>

                    {Array.from({ length: 2 }).map((_, index) => (
                        <div
                            key={index}
                            aria-hidden="true"
                            className="h-56 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                        />
                    ))}
                </div>
            )}

            {bookingsQuery.isError && (
                <motion.div
                    {...fadeIn}
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
                        onClick={() => bookingsQuery.refetch()}
                        className="mt-6"
                    >
                        Try again
                    </Button>
                </motion.div>
            )}

            {result && result.bookings.length === 0 && (
                <motion.div
                    {...fadeIn}
                    className="relative isolate overflow-hidden rounded-3xl rounded-tr-[5rem] bg-secondary px-8 py-14 sm:px-12 sm:py-16"
                >
                    {/* Quarter-circle accent, same shape language as the rest of the site */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 right-0 -z-10 size-28 rounded-tl-full bg-primary/15 sm:size-40"
                    />

                    <h3 className="text-lg font-medium">
                        {status
                            ? "No matching bookings"
                            : "No bookings yet"}
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                        {status
                            ? "Try selecting a different status."
                            : "Your service bookings will appear here once you make one."}
                    </p>
                </motion.div>
            )}

            {result && result.bookings.length > 0 && (
                <>
                    {/* Dims slightly while the next page or filter loads */}
                    <div
                        className={`transition-opacity duration-300 motion-reduce:transition-none ${
                            bookingsQuery.isFetching ? "opacity-60" : ""
                        }`}
                    >
                        <motion.div
                            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                            variants={list}
                            initial="hidden"
                            animate="show"
                        >
                            <AnimatePresence mode="popLayout">
                                {result.bookings.map((booking) => {
                                    const start = new Date(booking.start_time);

                                    return (
                                        <motion.div
                                            key={booking.booking_id}
                                            layout
                                            variants={cardMotion}
                                            exit="exit"
                                            transition={{
                                                layout: {
                                                    duration: reduce ? 0 : 0.4,
                                                    ease: EASE,
                                                },
                                            }}
                                        >
                                            <Card className="h-full gap-0 py-0 transition-colors duration-300 hover:border-foreground/25 motion-reduce:transition-none">
                                                <CardContent className="flex h-full flex-col p-6 sm:p-8">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex min-w-0 items-start gap-4">
                                                            {/* Arch date tile, same shape language as the rest of the site */}
                                                            <div
                                                                aria-hidden="true"
                                                                className={`grid h-16 w-14 shrink-0 place-items-center rounded-t-full rounded-b-lg text-center leading-none transition-colors duration-500 ${
                                                                    booking.status ===
                                                                    "confirmed"
                                                                        ? "bg-primary/10 text-primary"
                                                                        : "bg-muted text-muted-foreground"
                                                                }`}
                                                            >
                                                                <span className="mt-2 block">
                                                                    <span className="block text-[10px] font-medium uppercase">
                                                                        {new Intl.DateTimeFormat(
                                                                            undefined,
                                                                            {
                                                                                month: "short",
                                                                            },
                                                                        ).format(
                                                                            start,
                                                                        )}
                                                                    </span>
                                                                    <span className="mt-0.5 block text-xl font-semibold tabular-nums">
                                                                        {start.getDate()}
                                                                    </span>
                                                                </span>
                                                            </div>

                                                            <div className="min-w-0 pt-1">
                                                                <h3 className="font-semibold tracking-tight">
                                                                    {booking.service_name}
                                                                </h3>

                                                                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className={`size-1.5 rounded-full transition-colors duration-500 ${statusDots[booking.status]}`}
                                                                    />
                                                                    {statusLabels[booking.status]}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {booking.status === "confirmed" && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    aria-label={`Actions for ${booking.service_name}`}
                                                                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                                                >
                                                                    <MoreHorizontal className="size-5" />
                                                                </DropdownMenuTrigger>

                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            setSelectedBooking(
                                                                                booking,
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel booking
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>

                                                    <div className="mt-auto flex items-end justify-between gap-4 pt-10">
                                                        <div className="space-y-1 text-sm text-muted-foreground">
                                                            <p>
                                                                {formatBookingDate(
                                                                    booking.start_time,
                                                                )}
                                                            </p>

                                                            <p>
                                                                {formatBookingTime(
                                                                    booking.start_time,
                                                                )}
                                                                {" – "}
                                                                {formatBookingTime(
                                                                    booking.end_time,
                                                                )}
                                                                {" · "}
                                                                {booking.service_duration_minutes}{" "}
                                                                min
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0 text-right">
                                                            <p className="text-xs text-muted-foreground">
                                                                Price
                                                            </p>

                                                            <p className="mt-0.5 text-lg font-semibold tabular-nums">
                                                                {formatPrice(
                                                                    booking.service_price,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-6">
                        <p className="text-sm tabular-nums text-muted-foreground">
                            Page {result.pagination.page} of{" "}
                            {Math.max(result.pagination.totalPages, 1)}
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    page <= 1 || bookingsQuery.isFetching
                                }
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                            >
                                Previous
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    page >= result.pagination.totalPages ||
                                    bookingsQuery.isFetching
                                }
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <Dialog
                open={selectedBooking !== null}
                onOpenChange={(open) => {
                    if (
                        !open &&
                        !cancelBookingMutation.isPending
                    ) {
                        setSelectedBooking(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Cancel this booking?
                        </DialogTitle>

                        <DialogDescription>
                            Are you sure you want to cancel your booking
                            for{" "}
                            <strong>
                                {selectedBooking?.service_name}
                            </strong>
                            ? This action will change its status to
                            cancelled.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={cancelBookingMutation.isPending}
                            onClick={() => setSelectedBooking(null)}
                        >
                            Keep booking
                        </Button>

                        <Button
                            variant="destructive"
                            disabled={cancelBookingMutation.isPending}
                            onClick={handleCancelBooking}
                        >
                            {cancelBookingMutation.isPending
                                ? "Cancelling..."
                                : "Yes, cancel booking"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}