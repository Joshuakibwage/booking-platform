
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthDialog, type AuthMode } from "@/components/auth/auth-dialog";
import { ProfessionalProfileForm } from "@/components/professional/professional-profile-form";
import { Button } from "@/components/ui/button";

import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useLogin } from "@/hooks/auth/use-login";
import { useRegister } from "@/hooks/auth/use-register";
import { useCreateProfessionalProfile } from "@/hooks/professional/use-create-professional-profile";

import { getApiErrorMessage } from "@/lib/api-error";

import type { LoginFormValues } from "@/schemas/auth/login.schema";
import type { RegisterFormValues } from "@/schemas/auth/register.schema";
import type { ProfessionalProfileFormValues } from "@/schemas/professional/professional-profile.schema";

export function BecomeAProfessional() {
    const router = useRouter();

    const { data: currentUser, isPending: isUserLoading } =
        useCurrentUser();

    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const profileMutation = useCreateProfessionalProfile();

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>("register");

    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser?.hasProfessionalProfile) {
            router.replace("/professional/services");
        }
    }, [currentUser, router]);

    function handleAuthOpen(mode: AuthMode) {
        setLoginError(null);
        setRegisterError(null);
        setAuthMode(mode);
        setIsAuthOpen(true);
    }

    function handleAuthModeChange(mode: AuthMode) {
        setLoginError(null);
        setRegisterError(null);
        setAuthMode(mode);
    }

    function handleAuthDialogChange(open: boolean) {
        setIsAuthOpen(open);

        if (!open) {
            setLoginError(null);
            setRegisterError(null);
        }
    }

    async function handleLoginSubmit(values: LoginFormValues) {
        setLoginError(null);

        try {
            await loginMutation.mutateAsync(values);
            setIsAuthOpen(false);
        } catch (error: unknown) {
            setLoginError(
                getApiErrorMessage(error, "Unable to sign in. Please try again."),
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

    async function handleProfileSubmit(
        values: ProfessionalProfileFormValues,
    ) {
        setProfileError(null);

        try {
            await profileMutation.mutateAsync(values);
            router.push("/professional/services");
        } catch (error: unknown) {
            setProfileError(
                getApiErrorMessage(
                    error,
                    "Unable to create your professional profile. Please try again.",
                ),
            );
        }
    }

    return (
        <>
            <main className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-10 space-y-3">
                        <p className="text-sm font-medium text-primary">
                            Schedulyn for professionals
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Bring your services to Schedulyn
                        </h1>

                        <p className="leading-relaxed text-muted-foreground">
                            Create your professional profile, add your
                            services, and start managing your bookings
                            in one place.
                        </p>
                    </div>

                    {isUserLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Checking your account...
                        </p>
                    ) : currentUser?.hasProfessionalProfile ? (
                        <p className="text-sm text-muted-foreground">
                            Taking you to your professional workspace...
                        </p>
                    ) : !currentUser ? (
                        <div className="rounded-xl border border-border p-6 sm:p-8">
                            <h2 className="text-xl font-semibold">
                                First, let&apos;s get you signed in
                            </h2>

                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                You&apos;ll need a Schedulyn account before
                                creating your professional profile.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    onClick={() => handleAuthOpen("register")}
                                >
                                    Create an account
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => handleAuthOpen("login")}
                                >
                                    Sign in
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border p-6 sm:p-8">
                            <div className="mb-7">
                                <h2 className="text-xl font-semibold">
                                    Set up your professional profile
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Start with how customers will see
                                    and identify you on Schedulyn.
                                </p>
                            </div>

                            <ProfessionalProfileForm
                                onSubmit={handleProfileSubmit}
                                errorMessage={profileError}
                            />
                        </div>
                    )}
                </div>
            </main>

            <AuthDialog
                open={isAuthOpen}
                onOpenChange={handleAuthDialogChange}
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
