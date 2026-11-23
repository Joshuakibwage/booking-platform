
"use client";

import { useState } from "react";
import Link from "next/link";

import {
    AuthDialog,
    type AuthMode,
} from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useLogin } from "@/hooks/auth/use-login";
import { useRegister } from "@/hooks/auth/use-register";
import { usePublicService } from "@/hooks/public/use-public-service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { LoginFormValues } from "@/schemas/auth/login.schema";
import type { RegisterFormValues } from "@/schemas/auth/register.schema";

type BookingPageContentProps = {
    serviceId: string;
};

export function BookingPageContent({
    serviceId,
}: BookingPageContentProps) {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>("login");

    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);

    const {
        data: currentUser,
        isPending: isUserLoading,
        isError: isUserError,
        refetch: refetchCurrentUser,
    } = useCurrentUser();

    const loginMutation = useLogin();
    const registerMutation = useRegister();

    const {
        data: service,
        isLoading,
        isError,
        refetch,
    } = usePublicService(serviceId);

    async function handleLoginSubmit(values: LoginFormValues) {
        setLoginError(null);

        try {
            await loginMutation.mutateAsync(values);
            setIsAuthOpen(false);
        } catch (error: unknown) {
            setLoginError(
                getApiErrorMessage(
                    error,
                    "Unable to sign in. Please try again.",
                ),
            );
        }
    }

    async function handleRegisterSubmit(values: RegisterFormValues) {
        setRegisterError(null);

        try {
            await registerMutation.mutateAsync(values);
            setIsAuthOpen(false);
        } catch (error: unknown) {
            setRegisterError(
                getApiErrorMessage(
                    error,
                    "Unable to create your account. Please try again.",
                ),
            );
        }
    }

    function handleAuthOpenChange(open: boolean) {
        setIsAuthOpen(open);

        if (!open) {
            setLoginError(null);
            setRegisterError(null);
        }
    }

    function handleAuthModeChange(mode: AuthMode) {
        setAuthMode(mode);
        setLoginError(null);
        setRegisterError(null);
    }

    if (isLoading) {
        return (
            <section
                role="status"
                aria-label="Loading service"
                className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
            >
                <div className="h-5 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="mt-12 h-10 w-72 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="mt-5 h-24 max-w-2xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </section>
        );
    }

    if (isError || !service) {
        return (
            <section className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Service unavailable
                </h1>

                <p className="mt-3 text-muted-foreground">
                    We couldn&apos;t find this service. It may have been removed
                    or is no longer available.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void refetch()}
                    >
                        Try again
                    </Button>

                    <Link
                        href="/explore"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Explore services
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="mx-auto min-h-screen max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <p className="text-sm text-muted-foreground">
                    Booking
                </p>

                <section className="mt-10 max-w-2xl">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        {service.name}
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Provided by {service.professional_name}
                    </p>

                    {service.description && (
                        <p className="mt-6 leading-7 text-muted-foreground">
                            {service.description}
                        </p>
                    )}

                    <div className="mt-8 flex flex-wrap gap-8 border-y border-border py-6">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Price
                            </p>
                            <p className="mt-1 text-xl font-semibold tabular-nums">
                                {Number(service.price).toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Duration
                            </p>
                            <p className="mt-1 text-xl font-semibold tabular-nums">
                                {service.duration_minutes} min
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 rounded-xl border border-border p-6">
                        {isUserLoading ? (
                            <p
                                role="status"
                                className="text-sm text-muted-foreground"
                            >
                                Checking your account...
                            </p>
                        ) : isUserError ? (
                            <>
                                <h2 className="text-lg font-semibold">
                                    Unable to verify your account
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    We couldn&apos;t check your sign-in status.
                                    Please try again.
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => void refetchCurrentUser()}
                                >
                                    Try again
                                </Button>
                            </>
                        ) : currentUser ? (
                            <>
                                <h2 className="text-lg font-semibold">
                                    You&apos;re signed in
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    You can continue with this service. Booking
                                    details will be available in the next step.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold">
                                    Ready to book this service?
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Sign in to your account or create one to
                                    continue with your booking.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setAuthMode("login");
                                            setIsAuthOpen(true);
                                        }}
                                    >
                                        Sign in
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setAuthMode("register");
                                            setIsAuthOpen(true);
                                        }}
                                    >
                                        Create account
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </section>

            <AuthDialog
                open={isAuthOpen}
                onOpenChange={handleAuthOpenChange}
                mode={authMode}
                onModeChange={handleAuthModeChange}
                onLoginSubmit={handleLoginSubmit}
                onRegisterSubmit={handleRegisterSubmit}
                loginErrorMessage={loginError}
                registerErrorMessage={registerError}
            />
        </>
    );
}
