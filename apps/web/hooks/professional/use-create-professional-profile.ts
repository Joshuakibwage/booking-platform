"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createProfessionalProfile,
    type CreateProfessionalProfileInput,
} from "@/lib/api/professional-profile.api";
import { queryKeys } from "@/lib/query-keys";
import type { AuthUser } from "@/types/auth";

export function useCreateProfessionalProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateProfessionalProfileInput) =>
            createProfessionalProfile(input),

        onSuccess: () => {
            queryClient.setQueryData<AuthUser>(
                queryKeys.auth.currentUser,
                (currentUser) =>
                    currentUser
                        ? {
                              ...currentUser,
                              hasProfessionalProfile: true,
                          }
                        : currentUser,
            );
        },
    });
}