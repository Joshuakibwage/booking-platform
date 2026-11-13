
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import type { ProfessionalProfile } from "@/lib/api/professional-profile.api";
import {
    professionalProfileSchema,
    type ProfessionalProfileFormValues,
} from "@/schemas/professional/professional-profile.schema";

type ProfessionalProfileSettingsProps = {
    profile: ProfessionalProfile;
    onSubmit: (values: ProfessionalProfileFormValues) => Promise<void>;
    isSaving: boolean;
    errorMessage?: string | null;
};

export function ProfessionalProfileSettings({
    profile,
    onSubmit,
    isSaving,
    errorMessage,
}: ProfessionalProfileSettingsProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfessionalProfileFormValues>({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            publicName: profile.public_name,
            bio: profile.bio ?? "",
            timeZone: profile.time_zone,
        },
    });

    const isBusy = isSaving || isSubmitting;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
                <AuthFormField
                    id="publicName"
                    label="Professional or business name"
                    placeholder="e.g. Joe's Barbershop"
                    registration={register("publicName")}
                    error={errors.publicName?.message}
                />

                <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                        About your business or services
                    </label>

                    <textarea
                        id="bio"
                        rows={5}
                        placeholder="Tell potential customers about your business and services."
                        {...register("bio")}
                        aria-invalid={Boolean(errors.bio)}
                        aria-describedby={
                            errors.bio ? "bio-error" : undefined
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    {errors.bio?.message && (
                        <p id="bio-error" className="text-sm text-destructive">
                            {errors.bio.message}
                        </p>
                    )}
                </div>

                <AuthFormField
                    id="timeZone"
                    label="Time zone"
                    placeholder="e.g. Africa/Nairobi"
                    registration={register("timeZone")}
                    error={errors.timeZone?.message}
                />
            </div>

            {errorMessage && (
                <p role="alert" className="text-sm text-destructive">
                    {errorMessage}
                </p>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={isBusy}>
                    {isSaving ? "Saving changes..." : "Save changes"}
                </Button>
            </div>
        </form>
    );
}
