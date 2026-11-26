"use client";

import { useQuery } from "@tanstack/react-query";

import {
    getProfessionalBookings,
    type BookingListFilters,
} from "@/lib/api/booking.api";
import { queryKeys } from "@/lib/query-keys";

export function useProfessionalBookings(
    filters: BookingListFilters = {},
) {
    return useQuery({
        queryKey: queryKeys.professional.bookings(filters),
        queryFn: () => getProfessionalBookings(filters),
    });
}