import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AuthUser } from "@/types/auth";

export async function getCurrentUser(): Promise<AuthUser> {

    const resp = await api.get<ApiResponse<AuthUser>>("/auth/me");

    return resp.data.data;
    
};