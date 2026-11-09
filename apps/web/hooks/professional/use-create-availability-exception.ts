"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createAvailabilityException,
    type CreateAvailabilityExceptionInput,
} from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

export function useCreateAvailabilityException() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateAvailabilityExceptionInput) =>
            createAvailabilityException(input),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.availabilityExceptions,
            });
        },
    });
}