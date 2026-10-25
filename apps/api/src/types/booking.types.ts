
export type CreateBookingInput = {
    customerId: string;
    serviceId: string;
    startTime: string;
};

export type RescheduleBookingInput = {
    startTime: string;
};