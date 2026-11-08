"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deactivateProfessionalService } from "@/lib/api/professional-services.api";
import { queryKeys } from "@/lib/query-keys";

export function useDeactivateProfessionalService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (serviceId: string) =>
            deactivateProfessionalService(serviceId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.services,
            });
        },
    });
}