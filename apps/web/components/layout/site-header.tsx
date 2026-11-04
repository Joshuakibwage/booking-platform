"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { ChevronDown, LogOut } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { AuthDialog, type AuthMode } from "@/components/auth/auth-dialog";
import { buttonVariants } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import { navigationLinks } from "@/constants/navigation";

import { useLogin } from "@/hooks/auth/use-login";
import { useRegister } from "@/hooks/auth/use-register";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useLogout } from "@/hooks/auth/use-logout";

import { getApiErrorMessage } from "@/lib/api-error";

import type { LoginFormValues } from "@/schemas/auth/login.schema";
import type { RegisterFormValues } from "@/schemas/auth/register.schema";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const { data: currentUser, isPending: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <MotionConfig reducedMotion="user">
      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200 ${
          scrolled
            ? "border-border bg-background/80 backdrop-blur-md"
            : "border-transparent bg-background"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="font-heading text-lg font-semibold tracking-tight">
              Schedulyn
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden h-full items-center gap-7 md:flex"
          >
            {navigationLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-full items-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}

                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden items-center gap-2 md:flex">
              {isUserLoading || currentUser === undefined ? (
                <div
                  aria-label="Loading account"
                  className="h-9 w-28 animate-pulse rounded-md bg-muted"
                />
              ) : currentUser ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={buttonVariants({
                        variant: "ghost",
                      })}
                    >
                      <span className="max-w-36 truncate">
                        {currentUser.displayName}
                      </span>
                      <ChevronDown className="ml-1 size-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex flex-col gap-1">
                          <span className="truncate font-medium">
                            {currentUser.displayName}
                          </span>
                          <span className="truncate text-xs font-normal text-muted-foreground">
                            {currentUser.email}
                          </span>
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        disabled={logoutMutation.isPending}
                        onClick={() => void handleLogout()}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="size-4" />
                        {logoutMutation.isPending
                          ? "Signing out..."
                          : "Sign out"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {logoutError && (
                    <p
                      role="alert"
                      className="max-w-48 text-xs text-destructive"
                    >
                      {logoutError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleAuthOpen("login")}
                    className={buttonVariants({
                      variant: "ghost",
                    })}
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuthOpen("register")}
                    className={buttonVariants()}
                  >
                    Get started
                  </button>
                </>
              )}
            </div>

            <MobileNavigation
              onAuthOpen={handleAuthOpen}
              currentUser={currentUser}
              isUserLoading={isUserLoading}
              isLoggingOut={logoutMutation.isPending}
              logoutError={logoutError}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Authentication dialog */}
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
    </MotionConfig>
  );
}
