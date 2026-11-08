import { z } from "zod";

function isValidTimeZone(value: string): boolean {
    try {
        new Intl.DateTimeFormat("en-US", {
            timeZone: value,
        });

        return true;
    } catch {
        return false;
    }
}

export const professionalProfileSchema = z.object({
    publicName: z
        .string()
        .trim()
        .min(1, "Public name is required.")
        .max(100, "Public name must not exceed 100 characters."),

    bio: z
        .string()
        .trim()
        .max(5000, "Bio must not exceed 5000 characters."),

    timeZone: z
        .string()
        .trim()
        .min(1, "Time zone is required.")
        .refine(isValidTimeZone, "Please enter a valid time zone."),
});

export type ProfessionalProfileFormValues = z.infer<
    typeof professionalProfileSchema
>;