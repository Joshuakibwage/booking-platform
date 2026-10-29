
import { Resend } from "resend";

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;

    if (!apiKey || !fromEmail) {
        throw new Error("Email provider is not configured");
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
    });

    if (error) {
        throw new Error("Email delivery failed");
    }
};
