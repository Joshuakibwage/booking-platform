
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import {
    professionalServiceSchema,
    type ProfessionalServiceFormValues,
} from "@/schemas/professional/professional-service.schema";

type ProfessionalServiceFormProps = {
    initialValues?: ProfessionalServiceFormValues;
    onSubmit: (values: ProfessionalServiceFormValues) => Promise<void>;
    submitLabel?: string;
    errorMessage?: string | null;
};

const defaultValues: ProfessionalServiceFormValues = {
    name: "",
    description: "",
    durationMinutes: 30,
    price: 0,
};

export function ProfessionalServiceForm({
    initialValues = defaultValues,
    onSubmit,
    submitLabel = "Create service",
    errorMessage,
}: ProfessionalServiceFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfessionalServiceFormValues>({
        resolver: zodResolver(professionalServiceSchema),
        defaultValues: initialValues,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AuthFormField
                id="name"
                label="Service name"
                placeholder="e.g. Haircut and styling"
                registration={register("name")}
                error={errors.name?.message}
            />

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                    Description
                </label>

                <textarea
                    id="description"
                    rows={4}
                    placeholder="Describe what customers can expect from this service."
                    {...register("description")}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                        errors.description ? "description-error" : undefined
                    }
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />

                {errors.description && (
                    <p id="description-error" className="text-sm text-destructive">
                        {errors.description.message}
                    </p>
                )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="durationMinutes" className="text-sm font-medium">
                        Duration (minutes)
                    </label>

                    <input
                        id="durationMinutes"
                        type="number"
                        min="1"
                        step="1"
                        {...register("durationMinutes", {
                            valueAsNumber: true,
                        })}
                        aria-invalid={Boolean(errors.durationMinutes)}
                        aria-describedby={
                            errors.durationMinutes ? "duration-error" : undefined
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    {errors.durationMinutes && (
                        <p id="duration-error" className="text-sm text-destructive">
                            {errors.durationMinutes.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                        Price
                    </label>

                    <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("price", {
                            valueAsNumber: true,
                        })}
                        aria-invalid={Boolean(errors.price)}
                        aria-describedby={
                            errors.price ? "price-error" : undefined
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    {errors.price && (
                        <p id="price-error" className="text-sm text-destructive">
                            {errors.price.message}
                        </p>
                    )}
                </div>
            </div>

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
                {isSubmitting ? "Saving..." : submitLabel}
            </Button>
        </form>
    );
}
