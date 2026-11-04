
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { register } from "@/lib/api/auth.api";
import { queryKeys } from "@/lib/query-keys";
import type { RegisterFormValues } from "@/schemas/auth/register.schema";

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: RegisterFormValues) => register(values),

        onSuccess: (user) => {
            queryClient.setQueryData(
                queryKeys.auth.currentUser,
                user,
            );
        },
    });
}
