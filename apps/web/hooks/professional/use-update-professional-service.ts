"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    updateProfessionalService,
    type UpdateProfessionalServiceInput,
} from "@/lib/api/professional-services.api";
import { queryKeys } from "@/lib/query-keys";

type UpdateServiceVariables = {
    serviceId: string;
    input: UpdateProfessionalServiceInput;
};

export function useUpdateProfessionalService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ serviceId, input }: UpdateServiceVariables) =>
            updateProfessionalService(serviceId, input),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.services,
            });
        },
    });
}