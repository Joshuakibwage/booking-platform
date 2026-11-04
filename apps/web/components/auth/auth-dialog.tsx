
"use client";

import { ArrowRight } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { LoginFormValues } from "@/schemas/auth/login.schema";
import type { RegisterFormValues } from "@/schemas/auth/register.schema";

export type AuthMode = "login" | "register";

type AuthDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
    onLoginSubmit: (values: LoginFormValues) => Promise<void>;
    onRegisterSubmit: (values: RegisterFormValues) => Promise<void>;
    loginErrorMessage?: string | null;
    registerErrorMessage?: string | null;
};

export function AuthDialog({
    open,
    onOpenChange,
    mode,
    onModeChange,
    onLoginSubmit,
    onRegisterSubmit,
    loginErrorMessage,
    registerErrorMessage,
}: AuthDialogProps) {
    const isLogin = mode === "login";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                className="max-w-4xl overflow-hidden p-0 sm:max-w-4xl"
            >
                <div className="grid md:grid-cols-2">
                    {/* Form panel */}
                    <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                        <DialogHeader className="mb-8 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                Schedulyn
                            </p>

                            <DialogTitle className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                                {isLogin
                                    ? "Welcome back"
                                    : "Create your account"}
                            </DialogTitle>

                            <DialogDescription className="text-sm leading-relaxed">
                                {isLogin
                                    ? "Sign in to manage your bookings and keep everything organised."
                                    : "Create an account to discover professionals and manage your bookings."}
                            </DialogDescription>
                        </DialogHeader>

                        {isLogin ? (
                            <LoginForm 
                                onSubmit={onLoginSubmit} 
                                errorMessage={loginErrorMessage}
                            />
                        ) : (
                            <RegisterForm 
                                onSubmit={onRegisterSubmit} 
                                errorMessage={registerErrorMessage}
                            />
                        )}

                        <p className="mt-7 text-center text-sm text-muted-foreground">
                            {isLogin
                                ? "Don't have an account?"
                                : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() =>
                                    onModeChange(isLogin ? "register" : "login")
                                }
                                className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring cursor-pointer"
                            >
                                {isLogin ? "Create one" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    {/* Visual panel */}
                    <div className="relative hidden min-h-[560px] overflow-hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                                backgroundSize: "24px 24px",
                            }}
                        />

                        <div className="relative">
                            <p className="text-sm font-medium tracking-wide">
                                Make time for what matters.
                            </p>
                        </div>

                        <div className="relative space-y-6">
                            <div className="space-y-3">
                                <h2 className="max-w-sm font-heading text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                                    Your schedule, in better hands.
                                </h2>

                                <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/75">
                                    Find the right professionals, book with
                                    confidence, and keep your appointments
                                    organised in one place.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-medium">
                                A simpler way to book
                                <ArrowRight size={16} aria-hidden="true" />
                            </div>
                        </div>

                        <p className="relative text-xs text-primary-foreground/60">
                            Schedulyn · Appointments made simpler
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
