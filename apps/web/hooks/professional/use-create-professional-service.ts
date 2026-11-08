"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createProfessionalService,
    type CreateProfessionalServiceInput,
} from "@/lib/api/professional-services.api";
import { queryKeys } from "@/lib/query-keys";

export function useCreateProfessionalService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateProfessionalServiceInput) =>
            createProfessionalService(input),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.services,
            });
        },
    });
}