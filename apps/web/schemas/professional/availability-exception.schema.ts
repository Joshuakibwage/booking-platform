
import { z } from "zod";

export const availabilityExceptionSchema = z
    .object({
        exceptionDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date.")
            .refine((value) => {
                const date = new Date(`${value}T00:00:00.000Z`);

                return (
                    !Number.isNaN(date.getTime()) &&
                    date.toISOString().slice(0, 10) === value
                );
            }, "Select a valid calendar date."),

        isAvailable: z.boolean(),

        startTime: z.string().nullable(),

        endTime: z.string().nullable(),

        reason: z
            .string()
            .max(1000, "Reason cannot exceed 1000 characters.")
            .nullable(),
    })
    .superRefine((values, context) => {
        if (!values.isAvailable) {
            if (values.startTime !== null || values.endTime !== null) {
                context.addIssue({
                    code: "custom",
                    message: "Unavailable dates cannot have working hours.",
                    path: ["startTime"],
                });
            }

            return;
        }

        const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

        if (!values.startTime || !timePattern.test(values.startTime)) {
            context.addIssue({
                code: "custom",
                message: "Enter a valid start time.",
                path: ["startTime"],
            });
        }

        if (!values.endTime || !timePattern.test(values.endTime)) {
            context.addIssue({
                code: "custom",
                message: "Enter a valid end time.",
                path: ["endTime"],
            });
        }

        if (
            values.startTime &&
            values.endTime &&
            timePattern.test(values.startTime) &&
            timePattern.test(values.endTime) &&
            values.startTime >= values.endTime
        ) {
            context.addIssue({
                code: "custom",
                message: "End time must be later than start time.",
                path: ["endTime"],
            });
        }
    });

export type AvailabilityExceptionFormValues = z.infer<
    typeof availabilityExceptionSchema
>;
