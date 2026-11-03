import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/auth.api";
import axios from "axios";
import type { AuthUser } from "@/types/auth";
import { queryKeys } from "@/lib/query-keys";


async function fetchCurrentUser(): Promise<AuthUser | null> {
    try {
        return await getCurrentUser();
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return null;
        }

        throw error;
    }
}


export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.auth.currentUser,
        queryFn: fetchCurrentUser,
    });
};