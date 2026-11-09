"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createWeeklyAvailability,
    type CreateWeeklyAvailabilityInput,
} from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

export function useCreateWeeklyAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateWeeklyAvailabilityInput) =>
            createWeeklyAvailability(input),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.weeklyAvailability,
            });
        },
    });
}