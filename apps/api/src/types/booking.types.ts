export type CreateBookingRequest = {
    serviceId: string;
    startTime: string;
};

export type CreateBookingInput = CreateBookingRequest & {
    customerId: string;
};

export type RescheduleBookingInput = {
    startTime: string;
};