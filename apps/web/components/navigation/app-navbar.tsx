
"use client";

import { useState } from "react";
import {
  MotionConfig,
  useMotionValueEvent,
  useScroll,
} from "motion/react";

import { AuthDialog, type AuthMode } from "@/components/auth/auth-dialog";
import { DesktopNavigation } from "@/components/navigation/desktop-navigation";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { NavbarActions } from "@/components/navigation/navbar-actions";
import { NavbarBrand } from "@/components/navigation/navbar-brand";

import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useLogin } from "@/hooks/auth/use-login";
import { useLogout } from "@/hooks/auth/use-logout";
import { useRegister } from "@/hooks/auth/use-register";

import { getApiErrorMessage } from "@/lib/api-error";

import type { LoginFormValues } from "@/schemas/auth/login.schema";
import type { RegisterFormValues } from "@/schemas/auth/register.schema";
import type { NavbarContext } from "@/constants/navigation";

type AppNavbarProps = {
  context: NavbarContext;
};

export function AppNavbar({ context }: AppNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const { data: currentUser, isPending: isUserLoading } = useCurrentUser();

  // Signed-in users browsing the marketplace use customer navigation.
  // Professional routes retain their own navigation context.
  const navigationContext: NavbarContext =
    context === "marketing" && currentUser ? "customer" : context;

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 8);
  });

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

  async function handleLogout(): Promise<boolean> {
    setLogoutError(null);

    try {
      await logoutMutation.mutateAsync();
      return true;
    } catch (error: unknown) {
      setLogoutError(
        getApiErrorMessage(error, "Unable to sign out. Please try again."),
      );

      return false;
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <>
        <header
          className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200 ${
            scrolled
              ? "border-border bg-background/80 backdrop-blur-md"
              : "border-transparent bg-background"
          }`}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <NavbarBrand />

            <DesktopNavigation context={navigationContext} />

            <div className="flex items-center gap-2">
              <NavbarActions
                context={navigationContext}
                currentUser={currentUser}
                isUserLoading={isUserLoading}
                isLoggingOut={logoutMutation.isPending}
                logoutError={logoutError}
                onAuthOpen={handleAuthOpen}
                onLogout={() => void handleLogout()}
               />

              <MobileNavigation
                context={navigationContext}
                currentUser={currentUser}
                isUserLoading={isUserLoading}
                isLoggingOut={logoutMutation.isPending}
                logoutError={logoutError}
                onAuthOpen={handleAuthOpen}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

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
    </MotionConfig>
  );
}
