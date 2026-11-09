"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAvailabilityException } from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteAvailabilityException() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (exceptionId: string) =>
            deleteAvailabilityException(exceptionId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.availabilityExceptions,
            });
        },
    });
}