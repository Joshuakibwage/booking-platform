
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PoolClient } from "pg";
import {
    cancelBooking,
    findBookings,
    insertBooking,
} from "./booking.repository.js";

const { poolQueryMock } = vi.hoisted(() => ({
    poolQueryMock: vi.fn(),
}));

vi.mock("../db.js", () => ({
    default: {
        query: poolQueryMock,
    },
}));


const clientQueryMock = vi.fn();

const client = {
    query: clientQueryMock,
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
        clientQueryMock.mockResolvedValue({
            rows: [createdBooking],
        });

        const result = await insertBooking(client, booking);

        expect(result).toEqual(createdBooking);
        expect(clientQueryMock).toHaveBeenCalledOnce();

        const [sql, values] = clientQueryMock.mock.calls[0] as [
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
        clientQueryMock.mockResolvedValue({
            rows: [],
        });

        await expect(insertBooking(client, booking)).rejects.toThrow(
            "Booking insert returned no record",
        );
    });
});

const customerId = "550e8400-e29b-41d4-a716-446655440000";
const professionalId = "7ba7b810-9dad-41d1-80b4-00c04fd430c8";

describe("findBookings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns a customer's bookings and total count", async () => {
        poolQueryMock
            .mockResolvedValueOnce({
                rows: [{ total: "1" }],
            })
            .mockResolvedValueOnce({
                rows: [createdBooking],
            });

        const result = await findBookings({
            owner: {
                type: "customer",
                id: customerId,
            },
            page: 1,
            limit: 20,
        });

        expect(result).toEqual({
            bookings: [createdBooking],
            total: 1,
        });

        expect(poolQueryMock).toHaveBeenCalledTimes(2);
        expect(poolQueryMock.mock.calls[0]?.[0]).toContain(
            "customer_id = $1",
        );
        expect(poolQueryMock.mock.calls[0]?.[1]).toEqual([
            customerId,
        ]);
    });

    it("filters professional bookings by professional ID", async () => {
        poolQueryMock
            .mockResolvedValueOnce({
                rows: [{ total: "0" }],
            })
            .mockResolvedValueOnce({
                rows: [],
            });

        const result = await findBookings({
            owner: {
                type: "professional",
                id: professionalId,
            },
            page: 1,
            limit: 20,
        });

        expect(result).toEqual({
            bookings: [],
            total: 0,
        });

        expect(poolQueryMock.mock.calls[0]?.[0]).toContain(
            "professional_id = $1",
        );
        expect(poolQueryMock.mock.calls[0]?.[1]).toEqual([
            professionalId,
        ]);
    });

    it("applies status and date filters with pagination", async () => {
        poolQueryMock
            .mockResolvedValueOnce({
                rows: [{ total: "25" }],
            })
            .mockResolvedValueOnce({
                rows: [createdBooking],
            });

        await findBookings({
            owner: {
                type: "customer",
                id: customerId,
            },
            status: "confirmed",
            from: "2026-11-01",
            to: "2026-11-30",
            page: 2,
            limit: 10,
        });

        const countCall = poolQueryMock.mock.calls[0] as [
            string,
            unknown[],
        ];

        const bookingsCall = poolQueryMock.mock.calls[1] as [
            string,
            unknown[],
        ];

        expect(countCall[0]).toContain("status = $2");
        expect(countCall[0]).toContain("start_time >= $3::date");
        expect(countCall[0]).toContain("start_time < $4::date");

        expect(countCall[1]).toEqual([
            customerId,
            "confirmed",
            "2026-11-01",
            "2026-12-01",
        ]);

        expect(bookingsCall[0]).toContain("ORDER BY start_time DESC");
        expect(bookingsCall[0]).toContain("LIMIT $5");
        expect(bookingsCall[0]).toContain("OFFSET $6");

        expect(bookingsCall[1]).toEqual([
            customerId,
            "confirmed",
            "2026-11-01",
            "2026-12-01",
            10,
            10,
        ]);
    });
});



describe("cancelBooking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("cancels a confirmed booking and returns the updated record", async () => {
        const cancelledBooking = {
            ...createdBooking,
            status: "cancelled",
        };

        poolQueryMock.mockResolvedValue({
            rows: [cancelledBooking],
        });

        const result = await cancelBooking(createdBooking.booking_id);

        expect(result).toEqual(cancelledBooking);
        expect(poolQueryMock).toHaveBeenCalledOnce();

        const [sql, values] = poolQueryMock.mock.calls[0] as [
            string,
            unknown[],
        ];

        expect(sql).toContain("UPDATE bookings");
        expect(sql).toContain("SET status = 'cancelled'");
        expect(sql).toContain("status = 'confirmed'");
        expect(sql).toContain("RETURNING");
        expect(values).toEqual([createdBooking.booking_id]);
    });

    it("returns null when no confirmed booking can be cancelled", async () => {
        poolQueryMock.mockResolvedValue({
            rows: [],
        });

        const result = await cancelBooking(createdBooking.booking_id);

        expect(result).toBeNull();
        expect(poolQueryMock).toHaveBeenCalledOnce();
    });
});
