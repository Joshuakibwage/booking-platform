"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

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

const EASE = [0.22, 1, 0.36, 1] as const;

const steps = ["Account", "Profile"];

/** Quarter-circle accent in the corner of a card, same shape language as the rest of the site. */
function CornerShape() {
    return (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 size-16 rounded-bl-full bg-primary/10"
        />
    );
}

/** Status line with a slowly turning quarter-circle instead of a bare text message. */
function StatusLine({ children }: { children: ReactNode }) {
    const reduce = useReducedMotion();

    return (
        <div
            role="status"
            className="flex items-center gap-3 text-sm text-muted-foreground"
        >
            <motion.span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-tr-full bg-primary"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
            />
            {children}
        </div>
    );
}

export function BecomeAProfessional() {
    const router = useRouter();
    const reduce = useReducedMotion();

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

    // Which panel is showing. Drives the cross-fade between states.
    const panel = isUserLoading
        ? "loading"
        : currentUser?.hasProfessionalProfile
          ? "redirecting"
          : !currentUser
            ? "signed-out"
            : "profile";

    const showSteps = panel === "signed-out" || panel === "profile";
    const currentStep = panel === "profile" ? 1 : 0;

    // Header copy rises in one line after another.
    const headerContainer: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
    };

    const headerItem: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 14 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.6, ease: EASE },
        },
    };

    const panelMotion = {
        initial: { opacity: 0, y: reduce ? 0 : 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: reduce ? 0 : -8 },
        transition: { duration: reduce ? 0 : 0.35, ease: EASE },
    };

    return (
        <>
            <main className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <motion.div
                        className="mb-10 space-y-3"
                        variants={headerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.p
                            variants={headerItem}
                            className="inline-flex items-center gap-2.5 text-sm font-medium text-muted-foreground"
                        >
                            <span
                                aria-hidden="true"
                                className="size-2.5 rounded-tr-full bg-primary"
                            />
                            Schedulyn for professionals
                        </motion.p>

                        <motion.h1
                            variants={headerItem}
                            className="text-3xl font-semibold tracking-tight sm:text-4xl"
                        >
                            Bring your services to Schedulyn
                        </motion.h1>

                        <motion.p
                            variants={headerItem}
                            className="leading-relaxed text-muted-foreground"
                        >
                            Create your professional profile, add your
                            services, and start managing your bookings
                            in one place.
                        </motion.p>
                    </motion.div>

                    {/* Progress: the bar for each step fills as you move through */}
                    {showSteps && (
                        <motion.ol
                            aria-label="Progress"
                            className="mb-8 flex gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: reduce ? 0 : 0.4 }}
                        >
                            {steps.map((label, i) => (
                                <li
                                    key={label}
                                    aria-current={
                                        i === currentStep ? "step" : undefined
                                    }
                                    className="flex-1"
                                >
                                    <span
                                        className={`text-xs font-medium transition-colors duration-300 ${
                                            i <= currentStep
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {String(i + 1).padStart(2, "0")}{" "}
                                        {label}
                                    </span>

                                    <span
                                        aria-hidden="true"
                                        className="mt-2 block h-0.5 overflow-hidden rounded-full bg-muted"
                                    >
                                        <motion.span
                                            className="block h-full origin-left bg-primary"
                                            initial={false}
                                            animate={{
                                                scaleX: i <= currentStep ? 1 : 0,
                                            }}
                                            transition={{
                                                duration: reduce ? 0 : 0.6,
                                                ease: EASE,
                                            }}
                                        />
                                    </span>
                                </li>
                            ))}
                        </motion.ol>
                    )}

                    <AnimatePresence mode="wait" initial={false}>
                        {panel === "loading" && (
                            <motion.div key="loading" {...panelMotion}>
                                <StatusLine>Checking your account...</StatusLine>
                            </motion.div>
                        )}

                        {panel === "redirecting" && (
                            <motion.div key="redirecting" {...panelMotion}>
                                <StatusLine>
                                    Taking you to your professional
                                    workspace...
                                </StatusLine>
                            </motion.div>
                        )}

                        {panel === "signed-out" && (
                            <motion.div
                                key="signed-out"
                                {...panelMotion}
                                className="relative overflow-hidden rounded-xl border border-border p-6 sm:p-8"
                            >
                                <CornerShape />

                                <h2 className="relative text-xl font-semibold">
                                    First, let&apos;s get you signed in
                                </h2>

                                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                                    You&apos;ll need a Schedulyn account before
                                    creating your professional profile.
                                </p>

                                <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
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
                            </motion.div>
                        )}

                        {panel === "profile" && (
                            <motion.div
                                key="profile"
                                {...panelMotion}
                                className="relative overflow-hidden rounded-xl border border-border p-6 sm:p-8"
                            >
                                <CornerShape />

                                <div className="relative mb-7">
                                    <h2 className="text-xl font-semibold">
                                        Set up your professional profile
                                    </h2>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Start with how customers will see
                                        and identify you on Schedulyn.
                                    </p>
                                </div>

                                <div className="relative">
                                    <ProfessionalProfileForm
                                        onSubmit={handleProfileSubmit}
                                        errorMessage={profileError}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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