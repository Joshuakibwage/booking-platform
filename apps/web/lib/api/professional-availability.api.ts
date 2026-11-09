
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type WeeklyAvailabilityPeriod = {
    availability_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
};

export type AvailabilityException = {
    exception_id: string;
    exception_date: string;
    is_available: boolean;
    start_time: string | null;
    end_time: string | null;
    reason: string | null;
};

export type CreateWeeklyAvailabilityInput = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

export type UpdateWeeklyAvailabilityInput = CreateWeeklyAvailabilityInput;

export type CreateAvailabilityExceptionInput = {
    exceptionDate: string;
    isAvailable: boolean;
    startTime?: string | null;
    endTime?: string | null;
    reason?: string | null;
};

export type UpdateAvailabilityExceptionInput =
    CreateAvailabilityExceptionInput;

export async function getWeeklyAvailability(): Promise<
    WeeklyAvailabilityPeriod[]
> {
    const response = await api.get<
        ApiResponse<WeeklyAvailabilityPeriod[]>
    >("/professionals/weekly-availability");

    return response.data.data;
}

export async function createWeeklyAvailability(
    input: CreateWeeklyAvailabilityInput,
): Promise<WeeklyAvailabilityPeriod> {
    const response = await api.post<
        ApiResponse<WeeklyAvailabilityPeriod>
    >("/professionals/weekly-availability", input);

    return response.data.data;
}

export async function updateWeeklyAvailability(
    availabilityId: string,
    input: UpdateWeeklyAvailabilityInput,
): Promise<WeeklyAvailabilityPeriod> {
    const response = await api.patch<
        ApiResponse<WeeklyAvailabilityPeriod>
    >(`/professionals/weekly-availability/${availabilityId}`, input);

    return response.data.data;
}

export async function deleteWeeklyAvailability(
    availabilityId: string,
): Promise<void> {
    await api.delete(
        `/professionals/weekly-availability/${availabilityId}`,
    );
}

export async function getAvailabilityExceptions(): Promise<
    AvailabilityException[]
> {
    const response = await api.get<
        ApiResponse<AvailabilityException[]>
    >("/professionals/exceptions");

    return response.data.data;
}

export async function createAvailabilityException(
    input: CreateAvailabilityExceptionInput,
): Promise<AvailabilityException> {
    const response = await api.post<
        ApiResponse<AvailabilityException>
    >("/professionals/exceptions", input);

    return response.data.data;
}

export async function updateAvailabilityException(
    exceptionId: string,
    input: UpdateAvailabilityExceptionInput,
): Promise<AvailabilityException> {
    const response = await api.patch<
        ApiResponse<AvailabilityException>
    >(`/professionals/exceptions/${exceptionId}`, input);

    return response.data.data;
}

export async function deleteAvailabilityException(
    exceptionId: string,
): Promise<void> {
    await api.delete(`/professionals/exceptions/${exceptionId}`);
}
