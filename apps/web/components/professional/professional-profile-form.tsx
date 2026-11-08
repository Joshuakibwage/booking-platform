"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import {
    professionalProfileSchema,
    type ProfessionalProfileFormValues,
} from "@/schemas/professional/professional-profile.schema";

type ProfessionalProfileFormProps = {
    onSubmit: (values: ProfessionalProfileFormValues) => Promise<void>;
    errorMessage?: string | null;
};

export function ProfessionalProfileForm({
    onSubmit,
    errorMessage,
}: ProfessionalProfileFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfessionalProfileFormValues>({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            publicName: "",
            bio: "",
            timeZone: "",
        },
    });

    useEffect(() => {
        const browserTimeZone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (browserTimeZone) {
            setValue("timeZone", browserTimeZone);
        }
    }, [setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AuthFormField
                id="publicName"
                label="Professional or business name"
                type="text"
                placeholder="e.g. Joe's Barbershop"
                registration={register("publicName")}
                error={errors.publicName?.message}
            />

            <div className="space-y-2">
                <label
                    htmlFor="bio"
                    className="text-sm font-medium"
                >
                    About your business or services
                </label>

                <textarea
                    id="bio"
                    rows={5}
                    placeholder="Tell potential customers what you do and what makes your services valuable."
                    {...register("bio")}
                    aria-invalid={Boolean(errors.bio)}
                    aria-describedby={
                        errors.bio ? "bio-error" : undefined
                    }
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />

                {errors.bio && (
                    <p
                        id="bio-error"
                        className="text-sm text-destructive"
                    >
                        {errors.bio.message}
                    </p>
                )}
            </div>

            <AuthFormField
                id="timeZone"
                label="Time zone"
                type="text"
                placeholder="e.g. Africa/Nairobi"
                registration={register("timeZone")}
                error={errors.timeZone?.message}
            />

            {errorMessage && (
                <p
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                    {errorMessage}
                </p>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? "Creating your profile..."
                    : "Continue"}
            </Button>
        </form>
    );
}