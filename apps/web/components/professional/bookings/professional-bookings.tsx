"use client";

import { useState } from "react";
import { toast } from "sonner";

import type {
    BookingListFilters,
    BookingListItem,
    BookingStatus,
} from "@/lib/api/booking.api";

import { useProfessionalBookings } from "@/hooks/professional/use-professional-bookings";
import { useCancelProfessionalBooking } from "@/hooks/professional/use-cancel-professional-booking";

import { BookingsHeader } from "./bookings-header";
import { BookingsList } from "./bookings-list";
import { BookingsEmptyState } from "./bookings-empty-state";
import { BookingsErrorState } from "./bookings-error-state";
import { BookingsSkeleton } from "./bookings-skeleton";
import { BookingsPagination } from "./bookings-pagination";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { CancelBookingDialog } from "./cancel-booking-dialog";

export function ProfessionalBookings() {
    const [status, setStatus] = useState<BookingStatus | "">("");
    const [page, setPage] = useState(1);

    const [viewingBooking, setViewingBooking] =
        useState<BookingListItem | null>(null);

    const [bookingToCancel, setBookingToCancel] =
        useState<BookingListItem | null>(null);

    const filters: BookingListFilters = {
        page,
        limit: 10,
        ...(status ? { status } : {}),
    };

    const bookingsQuery = useProfessionalBookings(filters);
    const cancelMutation = useCancelProfessionalBooking();

    const result = bookingsQuery.data;

    function handleStatusChange(value: string) {
        setStatus(value as BookingStatus | "");
        setPage(1);
    }

    function handleCancelRequest(booking: BookingListItem) {
        setBookingToCancel(booking);
    }

    function handleCancelFromDetails(booking: BookingListItem) {
        setViewingBooking(null);
        setBookingToCancel(booking);
    }

    async function handleConfirmCancellation() {
        if (!bookingToCancel) return;

        try {
            await cancelMutation.mutateAsync(bookingToCancel.booking_id);

            toast.success("Booking cancelled successfully.");
            setBookingToCancel(null);
        } catch {
            toast.error("Unable to cancel this booking. Please try again.");
        }
    }

    return (
        <section className="mt-8 space-y-8">
            <BookingsHeader
                total={result?.pagination.total}
                status={status}
                onStatusChange={handleStatusChange}
            />

            {bookingsQuery.isPending && <BookingsSkeleton />}

            {bookingsQuery.isError && !result && (
                <BookingsErrorState
                    onRetry={() => bookingsQuery.refetch()}
                />
            )}

            {result && result.bookings.length === 0 && (
                <BookingsEmptyState hasStatusFilter={Boolean(status)} />
            )}

            {result && result.bookings.length > 0 && (
                <div
                    className={
                        bookingsQuery.isFetching
                            ? "space-y-6 opacity-60 transition-opacity"
                            : "space-y-6 transition-opacity"
                    }
                >
                    <BookingsList
                        bookings={result.bookings}
                        onViewDetails={setViewingBooking}
                        onCancel={handleCancelRequest}
                    />

                    <BookingsPagination
                        page={result.pagination.page}
                        totalPages={result.pagination.totalPages}
                        isFetching={bookingsQuery.isFetching}
                        onPageChange={setPage}
                    />
                </div>
            )}

            <BookingDetailsDialog
                booking={viewingBooking}
                open={viewingBooking !== null}
                onOpenChange={(open) => {
                    if (!open) setViewingBooking(null);
                }}
                onCancel={handleCancelFromDetails}
            />

            <CancelBookingDialog
                booking={bookingToCancel}
                open={bookingToCancel !== null}
                isPending={cancelMutation.isPending}
                onOpenChange={(open) => {
                    if (!open && !cancelMutation.isPending) {
                        setBookingToCancel(null);
                    }
                }}
                onConfirm={handleConfirmCancellation}
            />
        </section>
    );
}