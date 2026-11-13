"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfessionalProfile } from "@/lib/api/professional-profile.api";
import { queryKeys } from "@/lib/query-keys";

export function useUpdateProfessionalProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfessionalProfile,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.profile,
            });
        },
    });
}