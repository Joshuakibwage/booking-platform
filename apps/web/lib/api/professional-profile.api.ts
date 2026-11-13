
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
    image_url: string | null;
    created_at: string;
};

export type UploadProfessionalProfileImageResponse = {
    imageUrl: string;
};

export type UpdateProfessionalProfileInput = {
    publicName?: string;
    bio?: string | null;
    timeZone?: string;
};

export type UpdatedProfessionalProfile = {
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

export async function getAuthenticatedProfessionalProfile(): Promise<ProfessionalProfile> {
    const response = await api.get<ApiResponse<ProfessionalProfile>>(
        "/professionals/profile",
    );

    return response.data.data;
}


export async function uploadProfessionalProfileImage(
    image: File,
): Promise<UploadProfessionalProfileImageResponse> {
    const formData = new FormData();
    formData.append("image", image);

    const response = await api.post<
        ApiResponse<UploadProfessionalProfileImageResponse>
    >("/professionals/profile/image", formData);

    return response.data.data;
};

export async function updateProfessionalProfile(
    input: UpdateProfessionalProfileInput,
): Promise<UpdatedProfessionalProfile> {
    const response = await api.patch<ApiResponse<UpdatedProfessionalProfile>>(
        "/professionals/profile",
        input,
    );

    return response.data.data;
}