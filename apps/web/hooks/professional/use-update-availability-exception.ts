"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    updateAvailabilityException,
    type UpdateAvailabilityExceptionInput,
} from "@/lib/api/professional-availability.api";
import { queryKeys } from "@/lib/query-keys";

type UpdateAvailabilityExceptionVariables = {
    exceptionId: string;
    input: UpdateAvailabilityExceptionInput;
};

export function useUpdateAvailabilityException() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ exceptionId, input }: UpdateAvailabilityExceptionVariables) =>
            updateAvailabilityException(exceptionId, input),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.availabilityExceptions,
            });
        },
    });
}