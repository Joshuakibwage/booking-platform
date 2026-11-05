"use client";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AccountMenu } from "@/components/navigation/account/account-menu";
import { buttonVariants } from "@/components/ui/button";
import type { AuthMode } from "@/components/auth/auth-dialog";
import type { AuthUser } from "@/types/auth";
import type { NavbarContext } from "@/constants/navigation";

type NavbarActionsProps = {
    currentUser: AuthUser | null | undefined;
    isUserLoading: boolean;
    isLoggingOut: boolean;
    logoutError: string | null;
    onAuthOpen: (mode: AuthMode) => void;
    onLogout: () => void;
    context: NavbarContext;
};

export function NavbarActions({
    currentUser,
    isUserLoading,
    isLoggingOut,
    logoutError,
    onAuthOpen,
    onLogout,
    context
}: NavbarActionsProps) {
    return (
        <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden items-center gap-2 md:flex">
                {isUserLoading || currentUser === undefined ? (
                    <div
                        aria-label="Loading account"
                        className="h-9 w-28 animate-pulse rounded-md bg-muted"
                    />
                ) : currentUser ? (
                    <div className="flex items-center gap-2">
                        <AccountMenu
                            user={currentUser}
                            context={context}
                            onLogout={onLogout}
                            isLoggingOut={isLoggingOut}
                        />

                        {logoutError && (
                            <p
                                role="alert"
                                className="max-w-48 text-xs text-destructive"
                            >
                                {logoutError}
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => onAuthOpen("login")}
                            className={buttonVariants({ variant: "ghost" })}
                        >
                            Sign in
                        </button>

                        <button
                            type="button"
                            onClick={() => onAuthOpen("register")}
                            className={buttonVariants()}
                        >
                            Get started
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}