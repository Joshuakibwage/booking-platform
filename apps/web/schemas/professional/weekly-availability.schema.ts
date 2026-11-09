import { z } from "zod";

export const weeklyAvailabilitySchema = z
    .object({
        dayOfWeek: z
            .number({
                error: "Please select a weekday.",
            })
            .int()
            .min(1, "Invalid weekday.")
            .max(7, "Invalid weekday."),

        startTime: z
            .string()
            .regex(
                /^([01]\d|2[0-3]):[0-5]\d$/,
                "Enter a valid start time.",
            ),

        endTime: z
            .string()
            .regex(
                /^([01]\d|2[0-3]):[0-5]\d$/,
                "Enter a valid end time.",
            ),
    })
    .refine(
        (values) => values.startTime < values.endTime,
        {
            message: "End time must be later than start time.",
            path: ["endTime"],
        },
    );

export type WeeklyAvailabilityFormValues = z.infer<
    typeof weeklyAvailabilitySchema
>;