
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "@/lib/api/auth.api";
import { queryKeys } from "@/lib/query-keys";
import type { LoginFormValues } from "@/schemas/auth/login.schema";

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: LoginFormValues) => login(values),

        onSuccess: (user) => {
            queryClient.setQueryData(
                queryKeys.auth.currentUser,
                user,
            );
        },
    });
}
