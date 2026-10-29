
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    findBookingNotificationDetailsMock,
    sendEmailMock,
} = vi.hoisted(() => ({
    findBookingNotificationDetailsMock: vi.fn(),
    sendEmailMock: vi.fn(),
}));

vi.mock("../repositories/booking-notification.repository.js", () => ({
    findBookingNotificationDetails: findBookingNotificationDetailsMock,
}));

vi.mock("./email.service.js", () => ({
    sendEmail: sendEmailMock,
}));

import { notifyBookingParticipants } from "./booking-notification.service.js";

describe("notifyBookingParticipants", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findBookingNotificationDetailsMock.mockResolvedValue({
            booking_id: "booking-123",
            customer_email: "customer@example.com",
            customer_name: "Alex Customer",
            professional_email: "professional@example.com",
            professional_name: "Sam Professional",
            service_name: "Consultation",
            start_time: new Date("2026-11-02T10:00:00.000Z"),
            end_time: new Date("2026-11-02T11:00:00.000Z"),
            status: "confirmed",
            time_zone: "Africa/Nairobi",
        });

        sendEmailMock.mockResolvedValue(undefined);
    });

    it("notifies both the customer and professional", async () => {
        await notifyBookingParticipants("booking-123", "confirmed");

        expect(sendEmailMock).toHaveBeenCalledTimes(2);

        expect(sendEmailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "customer@example.com",
                subject: "Booking confirmation",
            }),
        );

        expect(sendEmailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "professional@example.com",
                subject: "Booking confirmation",
            }),
        );
    });

    it("includes the service, booking time, and status in the email", async () => {
        await notifyBookingParticipants("booking-123", "confirmed");

        const customerEmail = sendEmailMock.mock.calls.find(
            ([email]) => email.to === "customer@example.com",
        )?.[0];

        expect(customerEmail.html).toContain("Consultation");
        expect(customerEmail.html).toContain("2 Nov 2026, 13:00");
        expect(customerEmail.html).toContain("2 Nov 2026, 14:00");
        expect(customerEmail.html).toContain("confirmed");
    });

    it("uses the cancellation subject for cancelled bookings", async () => {
        findBookingNotificationDetailsMock.mockResolvedValue({
            booking_id: "booking-123",
            customer_email: "customer@example.com",
            customer_name: "Alex Customer",
            professional_email: "professional@example.com",
            professional_name: "Sam Professional",
            service_name: "Consultation",
            start_time: new Date("2026-11-02T10:00:00.000Z"),
            end_time: new Date("2026-11-02T11:00:00.000Z"),
            status: "cancelled",
            time_zone: "Africa/Nairobi",
        });

        await notifyBookingParticipants("booking-123", "cancelled");

        expect(sendEmailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "customer@example.com",
                subject: "Booking cancelled",
            }),
        );

        expect(sendEmailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "professional@example.com",
                subject: "Booking cancelled",
            }),
        );
    });

    it("throws when booking notification details are missing", async () => {
        findBookingNotificationDetailsMock.mockResolvedValue(null);

        await expect(
            notifyBookingParticipants("booking-missing", "confirmed"),
        ).rejects.toThrow("Booking notification details not found");

        expect(sendEmailMock).not.toHaveBeenCalled();
    });

    it("throws if one or more email deliveries fail", async () => {
        sendEmailMock
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error("Email delivery failed"));

        await expect(
            notifyBookingParticipants("booking-123", "confirmed"),
        ).rejects.toThrow("One or more booking notification emails failed");
    });
});
