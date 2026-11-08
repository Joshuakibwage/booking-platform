import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type CreateProfessionalProfileInput = {
    publicName: string;
    bio?: string;
    timeZone: string;
};

export type ProfessionalProfile = {
    profile_id: string;
    user_id: string;
    public_name: string;
    bio: string | null;
    time_zone: string;
    created_at: string;
};

export async function createProfessionalProfile(
    input: CreateProfessionalProfileInput,
): Promise<ProfessionalProfile> {
    const response = await api.post<ApiResponse<ProfessionalProfile>>(
        "/professionals/profile",
        input,
    );

    return response.data.data;
}