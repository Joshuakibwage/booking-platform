import { z } from "zod";

export const professionalServiceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Service name is required.")
        .max(120, "Service name must not exceed 120 characters."),

    description: z
        .string()
        .max(5000, "Description must not exceed 5000 characters."),

    durationMinutes: z
        .number({
            error: "Duration must be a number.",
        })
        .int("Duration must be a whole number.")
        .positive("Duration must be greater than zero."),

    price: z
        .number({
            error: "Price must be a number.",
        })
        .finite("Enter a valid price.")
        .min(0, "Price cannot be negative.")
        .max(99_999_999.99, "Price is too high.")
        .refine(
            (value) => Number.isInteger(value * 100),
            "Price cannot have more than two decimal places.",
        ),
});

export type ProfessionalServiceFormValues = z.infer<
    typeof professionalServiceSchema
>;