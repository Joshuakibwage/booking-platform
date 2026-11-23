import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type CreateBookingRequest = {
    serviceId: string;
    startTime: string;
};

export type Booking = {
    booking_id: string;
    customer_id: string;
    professional_id: string;
    service_id: string;
    service_name: string;
    service_duration_minutes: number;
    service_price: string;
    start_time: string;
    end_time: string;
    status: string;
    created_at: string;
};

export async function createBooking(
    input: CreateBookingRequest,
): Promise<Booking> {
    const response = await api.post<ApiResponse<Booking>>(
        "/bookings",
        input,
    );

    return response.data.data;
}