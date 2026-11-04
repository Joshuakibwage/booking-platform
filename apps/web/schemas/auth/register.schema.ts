import { z } from "zod";

export const registerSchema = z.object({
    displayName: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters.")
        .max(100, "Name must not exceed 100 characters."),

    email: z
        .email("Please enter a valid email address.")
        .trim()
        .toLowerCase()
        .max(254, "Email must not exceed 254 characters."),

    password: z
        .string()
        .min(12, "Password must be at least 12 characters.")
        .max(128, "Password must not exceed 128 characters."),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;