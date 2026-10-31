"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const transition = "transition-all duration-500 ease-in-out motion-reduce:transition-none";

const iconBase = cn("absolute size-3.5", transition);

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    function handleToggle() {
        const root = document.documentElement;
        root.classList.add("theme-transition");
        setTheme(isDark ? "light" : "dark");
        window.setTimeout(() => root.classList.remove("theme-transition"), 600);
    }

    return (
        <Button
            type="button"
            variant="ghost"
            role="switch"
            aria-checked={isDark}
            aria-label="Dark mode"
            data-theme-toggle
            suppressHydrationWarning
            onClick={handleToggle}
            className={cn(
                "relative h-8 w-14 shrink-0 justify-start p-0",
                "cursor-pointer rounded-full border border-border",
                transition,
            )}
        >
        {/* Thumb */}
            <span
                className={cn(
                    "pointer-events-none absolute left-1 top-1 flex size-6 items-center justify-center",
                    "rounded-full bg-foreground text-background shadow-sm",
                    transition,
                    "dark:translate-x-6",
                )}
            >
                <Sun
                    aria-hidden
                    className={cn(
                        iconBase,
                        "rotate-0 scale-100 opacity-100",
                        "dark:-rotate-45 dark:scale-50 dark:opacity-0",
                    )}
                />
                <Moon
                    aria-hidden
                    className={cn(
                        iconBase,
                        "rotate-45 scale-50 opacity-0",
                        "dark:rotate-0 dark:scale-100 dark:opacity-100",
                    )}
                />
            </span>
        </Button>
    );
}