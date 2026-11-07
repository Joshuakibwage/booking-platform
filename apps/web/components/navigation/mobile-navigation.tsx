"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { NavbarBrand } from "@/components/navigation/navbar-brand";
import { AccountMenuContent } from "@/components/navigation/account/account-menu-content";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { navigationConfig, type NavbarContext } from "@/constants/navigation";
import type { AuthMode } from "@/components/auth/auth-dialog";
import type { AuthUser } from "@/types/auth";

type MobileNavigationProps = {
  context: NavbarContext;
  currentUser: AuthUser | null | undefined;
  isUserLoading: boolean;
  isLoggingOut: boolean;
  logoutError: string | null;
  onAuthOpen: (mode: AuthMode) => void;
  onLogout: () => Promise<boolean>;
};

export function MobileNavigation({
  context,
  currentUser,
  isUserLoading,
  isLoggingOut,
  logoutError,
  onAuthOpen,
  onLogout,
}: MobileNavigationProps) {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const links = navigationConfig[context];

  async function handleLogout() {
    const didLogout = await onLogout();

    if (didLogout) {
      setIsOpen(false);
    }
  }

  return (
    <div className="md:hidden">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          aria-label="Open navigation menu"
          className="inline-flex size-10 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Menu size={20} aria-hidden="true" />
        </DialogTrigger>

        <DialogContent
          showCloseButton
          overlayClassName="md:hidden"
          className="fixed inset-0 top-0 left-0 z-50 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-0 p-5 shadow-none sm:max-w-none md:hidden"
        >
          <DialogTitle className="sr-only">
            Mobile navigation
          </DialogTitle>

          <div className="flex min-h-12 items-center border-b border-border pb-4">
            <NavbarBrand />
          </div>

          <nav aria-label="Mobile navigation" className="py-5">
            <ul className="flex flex-col gap-1">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto border-t border-border pt-5">
            {isUserLoading || currentUser === undefined ? (
              <div className="flex flex-col gap-3">
                <div className="h-12 animate-pulse rounded-md bg-muted" />
                <div className="h-10 animate-pulse rounded-md bg-muted" />
              </div>
            ) : currentUser ? (
              <>
                <AccountMenuContent
                  user={currentUser}
                  context={context}
                  onLogout={() => void handleLogout()}
                  isLoggingOut={isLoggingOut}
                  onNavigate={() => setIsOpen(false)}
                />

                {logoutError && (
                  <p
                    role="alert"
                    className="mt-3 text-xs text-destructive"
                  >
                    {logoutError}
                  </p>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onAuthOpen("login");
                  }}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sign in
                </button>

                <Button
                  onClick={() => {
                    setIsOpen(false);
                    onAuthOpen("register");
                  }}
                >
                  Get started
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
