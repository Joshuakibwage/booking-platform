"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { LogOut, Menu, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { navigationLinks } from "@/constants/navigation";

import type { AuthUser } from "@/types/auth";

type MobileNavigationProps = {
  onAuthOpen: (mode: "login" | "register") => void;
  currentUser: AuthUser | null | undefined;
  isUserLoading: boolean;
  isLoggingOut: boolean;
  logoutError: string | null;
  onLogout: () => Promise<boolean>;
};

const ease = [0.22, 1, 0.36, 1] as const;

const panel: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.12, ease },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease,
      staggerChildren: 0.035,
      delayChildren: 0.04,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease },
  },
};

export function MobileNavigation({
  onAuthOpen,
  currentUser,
  isUserLoading,
  isLoggingOut,
  logoutError,
  onLogout,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isOpen) firstLinkRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  async function handleLogoutClick() {
    const didLogout = await onLogout();

    if (didLogout) {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setIsOpen((previous) => !previous)}
        className="inline-flex size-10 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "open"}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.12 }}
            className="flex"
          >
            {isOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="mobile-navigation-menu"
            aria-label="Mobile navigation"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-x-0 top-full z-50 border-b border-border bg-background p-4 shadow-lg"
          >
            <ul className="flex flex-col">
              {navigationLinks.map((link, index) => (
                <motion.li key={link.href} variants={item}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              variants={item}
              className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4"
            >
              {isUserLoading || currentUser === undefined ? (
                <>
                  <div className="h-10 animate-pulse rounded-md bg-muted" />
                  <div className="h-10 animate-pulse rounded-md bg-muted" />
                </>
              ) : currentUser ? (
                <>
                  <div className="col-span-2 rounded-md bg-muted/50 px-3 py-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {currentUser.displayName}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>

                  {logoutError && (
                    <p
                      role="alert"
                      className="col-span-2 px-1 text-xs text-destructive"
                    >
                      {logoutError}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => void handleLogoutClick()}
                    className={`${buttonVariants({
                      variant: "destructive",
                    })} col-span-2`}
                  >
                    <LogOut size={16} className="mr-2" aria-hidden="true" />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onAuthOpen("login");
                    }}
                    className={buttonVariants({
                      variant: "outline",
                    })}
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onAuthOpen("register");
                    }}
                    className={buttonVariants()}
                  >
                    Get started
                  </button>
                </>
              )}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
