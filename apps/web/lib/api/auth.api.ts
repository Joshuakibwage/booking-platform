
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AuthUser } from "@/types/auth";

type LoginCredentials = {
    email: string;
    password: string;
};

type RegisterCredentials = {
    displayName: string;
    email: string;
    password: string;
};

export async function getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<AuthUser>>("/auth/me");

    return response.data.data;
}

export async function login(
    credentials: LoginCredentials,
): Promise<AuthUser> {
    const response = await api.post<ApiResponse<AuthUser>>(
        "/auth/login",
        credentials,
    );

    return response.data.data;
}

export async function register(
    credentials: RegisterCredentials,
): Promise<AuthUser> {
    const response = await api.post<ApiResponse<AuthUser>>(
        "/auth/register",
        credentials,
    );

    return response.data.data;
}

export async function logout(): Promise<void> {
    await api.post("/auth/logout");
}
