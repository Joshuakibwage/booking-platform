
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import {
    loginSchema,
    type LoginFormValues,
} from "@/schemas/auth/login.schema";

type LoginFormProps = {
    onSubmit: (values: LoginFormValues) => Promise<void>;
    errorMessage?: string | null;
};

export function LoginForm({
    onSubmit,
    errorMessage,
}: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                autoComplete="current-password"
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
                {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
}
