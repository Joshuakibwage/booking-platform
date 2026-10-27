
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    cancelBookingById,
    getBookings,
    prepareBooking,
    rescheduleBookingById,
} from "./booking.service.js";

const {
    customerExistsMock,
    findActiveServiceMock,
    isWithinAvailabilityMock,
    findBookingsMock,
    cancelBookingMock,
    findBookingByIdMock,
    rescheduleBookingMock,
    clientQueryMock,
    poolConnectMock,
} = vi.hoisted(() => ({
    customerExistsMock: vi.fn(),
    findActiveServiceMock: vi.fn(),
    isWithinAvailabilityMock: vi.fn(),
    findBookingsMock: vi.fn(),
    cancelBookingMock: vi.fn(),
    findBookingByIdMock: vi.fn(),
    rescheduleBookingMock: vi.fn(),
    clientQueryMock: vi.fn(),
    poolConnectMock: vi.fn(),
}));

vi.mock("../repositories/customer.repository.js", () => ({
    customerExists: customerExistsMock,
}));

vi.mock("../repositories/service.repository.js", () => ({
    findActiveServiceById: findActiveServiceMock,
}));

vi.mock("./availability.service.js", () => ({
    isWithinAvailability: isWithinAvailabilityMock,
}));

vi.mock("../repositories/booking.repository.js", () => ({
    findBookings: findBookingsMock,
    insertBooking: vi.fn(),
    cancelBooking: cancelBookingMock,
    findBookingById: findBookingByIdMock,
    rescheduleBooking: rescheduleBookingMock,
}));

vi.mock("../db.js", () => ({
    default: {
        connect: poolConnectMock,
    },
}));

const input = {
    customerId: "550e8400-e29b-41d4-a716-446655440000",
    serviceId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    startTime: "2026-11-02T09:00:00+03:00",
};

const service = {
    service_id: input.serviceId,
    professional_id: "7ba7b810-9dad-41d1-80b4-00c04fd430c8",
    name: "Consultation",
    duration_minutes: 30,
    price: "1500.00",
    time_zone: "Africa/Nairobi",
};

describe("prepareBooking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isWithinAvailabilityMock.mockResolvedValue(true);
    });

    it("rejects a booking when the customer does not exist", async () => {
        customerExistsMock.mockResolvedValue(false);

        const result = await prepareBooking(input);

        expect(result).toEqual({
            ok: false,
            reason: "customer_not_found",
        });

        expect(findActiveServiceMock).not.toHaveBeenCalled();
    });

    it("rejects a booking when the service is not found", async () => {
        customerExistsMock.mockResolvedValue(true);
        findActiveServiceMock.mockResolvedValue(null);

        const result = await prepareBooking(input);

        expect(result).toEqual({
            ok: false,
            reason: "service_not_found",
        });

        expect(isWithinAvailabilityMock).not.toHaveBeenCalled();
    });

    it("rejects a booking when the service has been deactivated", async () => {
        customerExistsMock.mockResolvedValue(true);
        findActiveServiceMock.mockResolvedValue(null);

        const result = await prepareBooking(input);

        expect(result).toEqual({
            ok: false,
            reason: "service_not_found",
        });

        expect(findActiveServiceMock).toHaveBeenCalledWith(
            input.serviceId,
            undefined,
        );

        expect(isWithinAvailabilityMock).not.toHaveBeenCalled();
    });

    it("calculates the end time using the service duration", async () => {
        customerExistsMock.mockResolvedValue(true);
        findActiveServiceMock.mockResolvedValue(service);

        const result = await prepareBooking(input);

        expect(result.ok).toBe(true);

        if (!result.ok) {
            throw new Error("Expected booking preparation to succeed");
        }

        expect(result.customerId).toBe(input.customerId);
        expect(result.service).toEqual(service);
        expect(result.startTime.toISOString()).toBe(
            "2026-11-02T06:00:00.000Z",
        );
        expect(result.endTime.toISOString()).toBe(
            "2026-11-02T06:30:00.000Z",
        );
    });

    it("rejects a booking outside professional availability", async () => {
        customerExistsMock.mockResolvedValue(true);
        findActiveServiceMock.mockResolvedValue(service);
        isWithinAvailabilityMock.mockResolvedValue(false);

        const result = await prepareBooking(input);

        expect(result).toEqual({
            ok: false,
            reason: "outside_availability",
        });
    });
});

describe("getBookings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns bookings with pagination metadata", async () => {
        const bookings = [
            {
                booking_id: "9ba7b810-9dad-41d1-80b4-00c04fd430c8",
                status: "confirmed",
            },
        ];

        findBookingsMock.mockResolvedValue({
            bookings,
            total: 25,
        });

        const input = {
            owner: {
                type: "customer" as const,
                id: "550e8400-e29b-41d4-a716-446655440000",
            },
            page: 2,
            limit: 10,
        };

        const result = await getBookings(input);

        expect(result).toEqual({
            bookings,
            pagination: {
                page: 2,
                limit: 10,
                total: 25,
                totalPages: 3,
            },
        });

        expect(findBookingsMock).toHaveBeenCalledWith(input);
    });

    it("returns zero total pages when no bookings exist", async () => {
        findBookingsMock.mockResolvedValue({
            bookings: [],
            total: 0,
        });

        const result = await getBookings({
            owner: {
                type: "professional",
                id: "7ba7b810-9dad-41d1-80b4-00c04fd430c8",
            },
            page: 1,
            limit: 20,
        });

        expect(result.pagination).toEqual({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
        });

        expect(result.bookings).toEqual([]);
    });
});

const bookingId = "9ba7b810-9dad-41d1-80b4-00c04fd430c8";

const existingBooking = {
    booking_id: bookingId,
    customer_id: input.customerId,
    professional_id: service.professional_id,
    service_id: input.serviceId,
    service_name: service.name,
    service_duration_minutes: service.duration_minutes,
    service_price: service.price,
    start_time: new Date("2026-11-02T06:00:00.000Z"),
    end_time: new Date("2026-11-02T06:30:00.000Z"),
    status: "confirmed",
    created_at: new Date("2026-10-20T10:00:00.000Z"),
};

describe("cancelBookingById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the cancelled booking when cancellation succeeds", async () => {
        const cancelledBooking = {
            ...existingBooking,
            status: "cancelled",
        };

        cancelBookingMock.mockResolvedValue(cancelledBooking);

        const result = await cancelBookingById(bookingId);

        expect(result).toEqual({
            ok: true,
            booking: cancelledBooking,
        });

        expect(cancelBookingMock).toHaveBeenCalledWith(bookingId);
        expect(findBookingByIdMock).not.toHaveBeenCalled();
    });

    it("returns booking_not_found when the booking does not exist", async () => {
        cancelBookingMock.mockResolvedValue(null);
        findBookingByIdMock.mockResolvedValue(null);

        const result = await cancelBookingById(bookingId);

        expect(result).toEqual({
            ok: false,
            reason: "booking_not_found",
        });

        expect(cancelBookingMock).toHaveBeenCalledWith(bookingId);
        expect(findBookingByIdMock).toHaveBeenCalledWith(bookingId);
    });

    it("returns booking_not_cancellable when the booking cannot be cancelled", async () => {
        cancelBookingMock.mockResolvedValue(null);
        findBookingByIdMock.mockResolvedValue(existingBooking);

        const result = await cancelBookingById(bookingId);

        expect(result).toEqual({
            ok: false,
            reason: "booking_not_cancellable",
        });

        expect(cancelBookingMock).toHaveBeenCalledWith(bookingId);
        expect(findBookingByIdMock).toHaveBeenCalledWith(bookingId);
    });
});

describe("rescheduleBookingById", () => {
    const newStartTime = "2026-11-02T10:00:00+03:00";

    beforeEach(() => {
        vi.clearAllMocks();

        clientQueryMock.mockImplementation(async (sql: string) => {
            if (sql.includes("SELECT time_zone")) {
                return {
                    rows: [{ time_zone: "Africa/Nairobi" }],
                };
            }

            return { rows: [] };
        });

        poolConnectMock.mockResolvedValue({
            query: clientQueryMock,
            release: vi.fn(),
        });

        findBookingByIdMock.mockResolvedValue(existingBooking);
        isWithinAvailabilityMock.mockResolvedValue(true);
        rescheduleBookingMock.mockResolvedValue({
            ...existingBooking,
            start_time: new Date("2026-11-02T07:00:00.000Z"),
            end_time: new Date("2026-11-02T07:30:00.000Z"),
        });
    });

    it("reschedules a confirmed booking successfully", async () => {
        const result = await rescheduleBookingById(
            bookingId,
            newStartTime,
        );

        expect(result).toEqual({
            ok: true,
            booking: {
                ...existingBooking,
                start_time: new Date("2026-11-02T07:00:00.000Z"),
                end_time: new Date("2026-11-02T07:30:00.000Z"),
            },
        });

        expect(findBookingByIdMock).toHaveBeenCalledWith(
            bookingId,
            expect.anything(),
        );

        expect(isWithinAvailabilityMock).toHaveBeenCalledWith(
            existingBooking.professional_id,
            "Africa/Nairobi",
            new Date("2026-11-02T07:00:00.000Z"),
            new Date("2026-11-02T07:30:00.000Z"),
            expect.anything(),
        );

        expect(rescheduleBookingMock).toHaveBeenCalledWith(
            bookingId,
            new Date("2026-11-02T07:00:00.000Z"),
            expect.anything(),
        );

        expect(clientQueryMock).toHaveBeenCalledWith("BEGIN");
        expect(clientQueryMock).toHaveBeenCalledWith("COMMIT");
    });

    it("returns booking_not_found when the booking does not exist", async () => {
        findBookingByIdMock.mockResolvedValue(null);

        const result = await rescheduleBookingById(
            bookingId,
            newStartTime,
        );

        expect(result).toEqual({
            ok: false,
            reason: "booking_not_found",
        });

        expect(clientQueryMock).toHaveBeenCalledWith("BEGIN");
        expect(clientQueryMock).toHaveBeenCalledWith("ROLLBACK");

        expect(isWithinAvailabilityMock).not.toHaveBeenCalled();
        expect(rescheduleBookingMock).not.toHaveBeenCalled();
    });

    it("rejects a booking that is no longer confirmed", async () => {
        findBookingByIdMock.mockResolvedValue({
            ...existingBooking,
            status: "cancelled",
        });

        const result = await rescheduleBookingById(
            bookingId,
            newStartTime,
        );

        expect(result).toEqual({
            ok: false,
            reason: "booking_not_reschedulable",
        });

        expect(clientQueryMock).toHaveBeenCalledWith("BEGIN");
        expect(clientQueryMock).toHaveBeenCalledWith("ROLLBACK");

        expect(isWithinAvailabilityMock).not.toHaveBeenCalled();
        expect(rescheduleBookingMock).not.toHaveBeenCalled();
    });

    it("rejects a new time outside the professional's availability", async () => {
        isWithinAvailabilityMock.mockResolvedValue(false);

        const result = await rescheduleBookingById(
            bookingId,
            newStartTime,
        );

        expect(result).toEqual({
            ok: false,
            reason: "outside_availability",
        });

        expect(clientQueryMock).toHaveBeenCalledWith("BEGIN");
        expect(clientQueryMock).toHaveBeenCalledWith("ROLLBACK");

        expect(rescheduleBookingMock).not.toHaveBeenCalled();
    });

    it("returns slot_unavailable when the requested slot is occupied", async () => {
        rescheduleBookingMock.mockRejectedValue({
            code: "23P01",
        });

        const result = await rescheduleBookingById(
            bookingId,
            newStartTime,
        );

        expect(result).toEqual({
            ok: false,
            reason: "slot_unavailable",
        });

        expect(clientQueryMock).toHaveBeenCalledWith("BEGIN");
        expect(clientQueryMock).toHaveBeenCalledWith("ROLLBACK");

        expect(rescheduleBookingMock).toHaveBeenCalled();
    });

    it("returns booking_not_reschedulable when the update affects no booking", async () => {
        rescheduleBookingMock.mockResolvedValue(null);

        const result = await rescheduleBookingById(
            bookingId,
            newStartTime,
        );

        expect(result).toEqual({
            ok: false,
            reason: "booking_not_reschedulable",
        });

        expect(clientQueryMock).toHaveBeenCalledWith("BEGIN");
        expect(clientQueryMock).toHaveBeenCalledWith("ROLLBACK");

        expect(rescheduleBookingMock).toHaveBeenCalled();
    });
});
