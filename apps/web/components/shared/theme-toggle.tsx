"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    
    const { setTheme, resolvedTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="relative inline-flex size-10 items-center justify-center rounded-md border border-border"
        >
            <Sun
                size={18}
                aria-hidden
                className="absolute rotate-0 scale-100 opacity-100 delay-150 transition-all duration-150 ease-out motion-reduce:transition-none dark:-rotate-45 dark:scale-75 dark:opacity-0 dark:delay-0"
            />

            <Moon
                size={18}
                aria-hidden
                className="absolute rotate-45 scale-75 opacity-0 delay-0 transition-all duration-150 ease-out motion-reduce:transition-none dark:rotate-0 dark:scale-100 dark:opacity-100 dark:delay-150"
            />
        </button>
    );
}