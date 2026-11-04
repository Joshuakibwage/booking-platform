
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/lib/api/auth.api";
import { queryKeys } from "@/lib/query-keys";

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,

        onSuccess: () => {
            queryClient.setQueryData(
                queryKeys.auth.currentUser,
                null,
            );
        },
    });
}
