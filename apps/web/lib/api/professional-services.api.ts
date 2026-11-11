
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type ProfessionalService = {
    service_id: string;
    professional_id: string;
    category_id: string | null;
    category_name?: string | null;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    is_active: boolean;
    created_at: string;
};

export type CreateProfessionalServiceInput = {
    categoryId: string;
    name: string;
    description?: string | null;
    durationMinutes: number;
    price: number;
};

export type UpdateProfessionalServiceInput = {
    categoryId?: string;
    name?: string;
    description?: string | null;
    durationMinutes?: number;
    price?: number;
};

export async function getProfessionalServices(): Promise<
    ProfessionalService[]
> {
    const response = await api.get<
        ApiResponse<ProfessionalService[]>
    >("/professionals/services");

    return response.data.data;
}

export async function createProfessionalService(
    input: CreateProfessionalServiceInput,
): Promise<ProfessionalService> {
    const response = await api.post<
        ApiResponse<ProfessionalService>
    >("/professionals/services", input);

    return response.data.data;
}

export async function updateProfessionalService(
    serviceId: string,
    input: UpdateProfessionalServiceInput,
): Promise<ProfessionalService> {
    const response = await api.patch<
        ApiResponse<ProfessionalService>
    >(`/professionals/services/${serviceId}`, input);

    return response.data.data;
}

export async function deactivateProfessionalService(
    serviceId: string,
): Promise<ProfessionalService> {
    const response = await api.patch<
        ApiResponse<ProfessionalService>
    >(`/professionals/services/${serviceId}/deactivate`);

    return response.data.data;
}
