
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const { sendMock } = vi.hoisted(() => ({
    sendMock: vi.fn(),
}));

vi.mock("resend", () => ({
    Resend: class {
        emails = {
            send: sendMock,
        };
    },
}));

import { sendEmail } from "./email.service.js";

describe("sendEmail", () => {
    beforeEach(() => {
        vi.stubEnv("RESEND_API_KEY", "re_test_key");
        vi.stubEnv(
            "EMAIL_FROM",
            "Booking Platform <onboarding@resend.dev>",
        );

        vi.clearAllMocks();

        sendMock.mockResolvedValue({
            data: { id: "email_test_123" },
            error: null,
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("sends an email using the configured sender", async () => {
        await sendEmail({
            to: "customer@example.com",
            subject: "Booking confirmation",
            html: "<p>Your booking is confirmed.</p>",
        });

        expect(sendMock).toHaveBeenCalledWith({
            from: "Booking Platform <onboarding@resend.dev>",
            to: "customer@example.com",
            subject: "Booking confirmation",
            html: "<p>Your booking is confirmed.</p>",
        });
    });

    it("throws when the email provider returns an error", async () => {
        sendMock.mockResolvedValue({
            data: null,
            error: { message: "API error" },
        });

        await expect(
            sendEmail({
                to: "customer@example.com",
                subject: "Booking confirmation",
                html: "<p>Your booking is confirmed.</p>",
            }),
        ).rejects.toThrow("Email delivery failed");
    });

    it("throws when the email provider is not configured", async () => {
        vi.stubEnv("RESEND_API_KEY", "");
        vi.stubEnv("EMAIL_FROM", "");

        await expect(
            sendEmail({
                to: "customer@example.com",
                subject: "Booking confirmation",
                html: "<p>Your booking is confirmed.</p>",
            }),
        ).rejects.toThrow("Email provider is not configured");

        expect(sendMock).not.toHaveBeenCalled();
    });
});
