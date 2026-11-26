"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelBooking } from "@/lib/api/booking.api";
import { queryKeys } from "@/lib/query-keys";

export function useCancelProfessionalBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelBooking,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.bookings({}),
            });
        },
    });
}