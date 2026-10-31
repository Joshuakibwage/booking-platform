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

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { buttonVariants } from "@/components/ui/button";
import { navigationLinks } from "@/constants/navigation";

export function SiteHeader() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

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
                <div 
                    className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
                >
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
                                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
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
                        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                            Sign in
                        </Link>
                        <Link href="/register" className={buttonVariants()}>
                            Get started
                        </Link>
                    </div>
                    <MobileNavigation />
                </div>
                </div>
            </header>
        </MotionConfig>
    );
}