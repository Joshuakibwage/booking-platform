"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadProfessionalProfileImage } from "@/lib/api/professional-profile.api";
import { queryKeys } from "@/lib/query-keys";

export function useUploadProfessionalProfileImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (image: File) =>
            uploadProfessionalProfileImage(image),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.professional.profile,
            });
        },
    });
}