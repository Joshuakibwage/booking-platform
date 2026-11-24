"use client";

import { useQuery } from "@tanstack/react-query";

import {
    getCustomerBookings,
    type BookingListFilters,
} from "@/lib/api/booking.api";
import { queryKeys } from "@/lib/query-keys";

export function useCustomerBookings(
    filters: BookingListFilters = {},
) {
    return useQuery({
        queryKey: queryKeys.customer.bookings(filters),
        queryFn: () => getCustomerBookings(filters),
    });
}