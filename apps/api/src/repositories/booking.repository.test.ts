
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PoolClient } from "pg";
import { insertBooking } from "./booking.repository.js";

const queryMock = vi.fn();

const client = {
    query: queryMock,
} as unknown as PoolClient;

const booking = {
    customerId: "550e8400-e29b-41d4-a716-446655440000",
    service: {
        service_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
        professional_id: "7ba7b810-9dad-41d1-80b4-00c04fd430c8",
        name: "Consultation",
        duration_minutes: 30,
        price: "1500.00",
        time_zone: "Africa/Nairobi",
    },
    startTime: new Date("2026-11-02T07:00:00Z"),
    endTime: new Date("2026-11-02T07:30:00Z"),
};

const createdBooking = {
    booking_id: "9ba7b810-9dad-41d1-80b4-00c04fd430c8",
    customer_id: booking.customerId,
    professional_id: booking.service.professional_id,
    service_id: booking.service.service_id,
    service_name: booking.service.name,
    service_duration_minutes: booking.service.duration_minutes,
    service_price: booking.service.price,
    start_time: booking.startTime,
    end_time: booking.endTime,
    status: "confirmed",
    created_at: new Date("2026-10-20T10:00:00Z"),
};

describe("insertBooking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("inserts the booking and returns the created record", async () => {
        queryMock.mockResolvedValue({
            rows: [createdBooking],
        });

        const result = await insertBooking(client, booking);

        expect(result).toEqual(createdBooking);
        expect(queryMock).toHaveBeenCalledOnce();

        const [sql, values] = queryMock.mock.calls[0] as [
            string,
            unknown[],
        ];

        expect(sql).toContain("INSERT INTO bookings");
        expect(sql).toContain("RETURNING");
        expect(values).toEqual([
            booking.customerId,
            booking.service.professional_id,
            booking.service.service_id,
            booking.service.name,
            booking.service.duration_minutes,
            booking.service.price,
            booking.startTime,
            booking.endTime,
        ]);
    });

    it("throws if the insert returns no record", async () => {
        queryMock.mockResolvedValue({
            rows: [],
        });

        await expect(insertBooking(client, booking)).rejects.toThrow(
            "Booking insert returned no record",
        );
    });
});
