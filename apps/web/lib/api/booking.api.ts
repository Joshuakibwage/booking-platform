
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
    status: BookingStatus;
    created_at: string;
};

export type BookingListItem = Booking & {
    customer_display_name: string;
    professional_time_zone: string;
};

export type BookingStatus =
    | "confirmed"
    | "cancelled"
    | "completed"
    | "no_show";

export type BookingListResponse = {
    bookings: BookingListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type BookingListFilters = {
    status?: BookingStatus;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
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

export async function getCustomerBookings(
    filters: BookingListFilters = {},
): Promise<BookingListResponse> {
    const response = await api.get<ApiResponse<BookingListResponse>>(
        "/customers/bookings",
        { params: filters },
    );

    return response.data.data;
}

export async function getProfessionalBookings(
    filters: BookingListFilters = {},
): Promise<BookingListResponse> {
    const response = await api.get<ApiResponse<BookingListResponse>>(
        "/professionals/bookings",
        { params: filters },
    );

    return response.data.data;
}

export async function cancelBooking(
    bookingId: string,
): Promise<Booking> {
    const response = await api.patch<ApiResponse<Booking>>(
        `/bookings/${bookingId}/cancel`,
    );

    return response.data.data;
}
