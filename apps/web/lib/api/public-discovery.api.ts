import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type PublicService = {
    service_id: string;
    professional_id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    created_at: string;
    professional_name: string;
    category_name: string | null;
    category_slug: string | null;
};

export type PublicServiceCategory = {
    category_id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
};

export type PublicServiceFilters = {
    search?: string;
    category?: string;
    professionalId?: string;
};

export type PublicProfessional = {
    profile_id: string;
    public_name: string;
    bio: string | null;
    time_zone: string;
    image_url: string | null;
    service_count: number;
};

export type PublicProfessionalFilters = {
    search?: string;
    category?: string;
};

export type PublicProfessionalProfile = Omit<
    PublicProfessional,
    "service_count"
> & {
    created_at: string;
};

export async function getPublicServices(
    filters: PublicServiceFilters = {},
): Promise<PublicService[]> {
    const response = await api.get<ApiResponse<PublicService[]>>(
        "/services",
        { params: filters },
    );

    return response.data.data;
}

export async function getPublicService(
    serviceId: string,
): Promise<PublicService> {
    const response = await api.get<ApiResponse<PublicService>>(
        `/services/${serviceId}`,
    );

    return response.data.data;
}

export async function getPublicServiceCategories(): Promise<
    PublicServiceCategory[]
> {
    const response = await api.get<ApiResponse<PublicServiceCategory[]>>(
        "/categories",
    );

    return response.data.data;
}

export async function getPublicProfessionals(
    filters: PublicProfessionalFilters = {},
): Promise<PublicProfessional[]> {
    const response = await api.get<ApiResponse<PublicProfessional[]>>(
        "/professionals",
        { params: filters },
    );

    return response.data.data;
}

export async function getPublicProfessionalProfile(
    professionalId: string,
): Promise<PublicProfessionalProfile> {
    const response = await api.get<ApiResponse<PublicProfessionalProfile>>(
        `/professionals/${professionalId}/profile`,
    );

    return response.data.data;
}