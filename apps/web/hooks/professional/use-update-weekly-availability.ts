"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    updateWeeklyAvailability,
    type UpdateWeeklyAvailabilityInput,
} from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

type UpdateWeeklyAvailabilityVariables = {
    availabilityId: string;
    input: UpdateWeeklyAvailabilityInput;
};

export function useUpdateWeeklyAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ availabilityId, input }: UpdateWeeklyAvailabilityVariables) =>
            updateWeeklyAvailability(availabilityId, input),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.weeklyAvailability,
            });
        },
    });
}