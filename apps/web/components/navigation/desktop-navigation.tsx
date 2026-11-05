"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationConfig, type NavbarContext } from "@/constants/navigation";

type DesktopNavigationProps = {
    context: NavbarContext;
};

export function DesktopNavigation({ context }: DesktopNavigationProps) {
    const pathname = usePathname();
    const links = navigationConfig[context];

    function isActive(href: string) {
        return pathname === href || pathname.startsWith(`${href}/`);
    }

  return (
    <nav
      aria-label="Main navigation"
      className="hidden h-full items-center gap-7 md:flex"
    >
      {links.map((link) => {
        const active = isActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex h-full items-center text-sm font-medium transition-colors ${
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}

            {active && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}