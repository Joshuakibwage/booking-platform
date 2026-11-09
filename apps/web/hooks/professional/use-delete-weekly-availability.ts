"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteWeeklyAvailability } from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteWeeklyAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (availabilityId: string) =>
            deleteWeeklyAvailability(availabilityId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.weeklyAvailability,
            });
        },
    });
}