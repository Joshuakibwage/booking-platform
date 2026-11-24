"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createBooking,
    type CreateBookingRequest,
} from "@/lib/api/booking.api";
import { queryKeys } from "@/lib/query-keys";

type CreateBookingMutationInput = {
    booking: CreateBookingRequest;
    professionalId: string;
    date: string;
};

export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ booking }: CreateBookingMutationInput) =>
            createBooking(booking),

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.public.availability(
                    variables.professionalId,
                    variables.booking.serviceId,
                    variables.date,
                ),
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.customer.bookings({}),
            });
        },
    });
}