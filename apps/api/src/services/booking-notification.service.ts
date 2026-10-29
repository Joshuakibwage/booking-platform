
import { findBookingNotificationDetails } from "../repositories/booking-notification.repository.js";
import { sendEmail } from "./email.service.js";

export type BookingNotificationEvent = "confirmed" | "cancelled" | "rescheduled";

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export async function notifyBookingParticipants(
    bookingId: string,
    event: BookingNotificationEvent,
): Promise<void> {
    const booking = await findBookingNotificationDetails(bookingId);

    if (!booking) {
        throw new Error("Booking notification details not found");
    }

    const subjectByEvent: Record<BookingNotificationEvent, string> = {
        confirmed: "Booking confirmation",
        cancelled: "Booking cancelled",
        rescheduled: "Booking rescheduled",
    };

    const messageByEvent: Record<BookingNotificationEvent, string> = {
        confirmed: "Your booking has been confirmed.",
        cancelled: "Your booking has been cancelled.",
        rescheduled: "Your booking has been rescheduled.",
    };

    const subject = subjectByEvent[event];
    const message = messageByEvent[event];

    const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
        timeZone: booking.time_zone,
        dateStyle: "medium",
        timeStyle: "short",
    });

    const startTime = dateTimeFormatter.format(booking.start_time);
    const endTime = dateTimeFormatter.format(booking.end_time);

    const createHtml = (recipientName: string) => `
        <h1>${escapeHtml(message)}</h1>
        <p>Hello ${escapeHtml(recipientName)},</p>
        <p><strong>Service:</strong> ${escapeHtml(booking.service_name)}</p>
        <p><strong>Start:</strong> ${escapeHtml(startTime)}</p>
        <p><strong>End:</strong> ${escapeHtml(endTime)}</p>
        <p><strong>Status:</strong> ${escapeHtml(booking.status)}</p>
        <p>Booking reference: ${escapeHtml(booking.booking_id)}</p>
    `;

    const notifications = [
        sendEmail({
            to: booking.customer_email,
            subject,
            html: createHtml(booking.customer_name),
        }),
        sendEmail({
            to: booking.professional_email,
            subject,
            html: createHtml(booking.professional_name),
        }),
    ];

    const results = await Promise.allSettled(notifications);

    if (results.some((result) => result.status === "rejected")) {
        throw new Error("One or more booking notification emails failed");
    }
}
