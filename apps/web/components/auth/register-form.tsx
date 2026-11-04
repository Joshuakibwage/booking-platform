
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import {
    registerSchema,
    type RegisterFormValues,
} from "@/schemas/auth/register.schema";

type RegisterFormProps = {
    onSubmit: (values: RegisterFormValues) => Promise<void>;
    errorMessage?: string | null;
};

export function RegisterForm({
    onSubmit,
    errorMessage,
}: RegisterFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            displayName: "",
            email: "",
            password: "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AuthFormField
                id="displayName"
                label="Full name"
                type="text"
                autoComplete="name"
                registration={register("displayName")}
                error={errors.displayName?.message}
            />

            <AuthFormField
                id="email"
                label="Email address"
                type="email"
                autoComplete="email"
                registration={register("email")}
                error={errors.email?.message}
            />

            <AuthFormField
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                registration={register("password")}
                error={errors.password?.message}
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
                {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
        </form>
    );
}
