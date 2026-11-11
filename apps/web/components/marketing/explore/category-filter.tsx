"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import type { PublicServiceCategory } from "@/lib/api/public-discovery.api";

type CategoryFilterProps = {
    categories: PublicServiceCategory[];
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
};

type FilterPillProps = {
    selected: boolean;
    highlightId: string;
    onClick: () => void;
    children: ReactNode;
};

function FilterPill({
    selected,
    highlightId,
    onClick,
    children,
}: FilterPillProps) {
    const reduce = useReducedMotion();

    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className={cn(
                "relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
                selected
                    ? "border-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
        >
            {/* One highlight that slides to whichever pill is selected */}
            {selected && (
                <motion.span
                    layoutId={highlightId}
                    aria-hidden="true"
                    className="absolute -inset-px rounded-full bg-foreground"
                    transition={
                        reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 380, damping: 30 }
                    }
                />
            )}

            <span className="relative">{children}</span>
        </motion.button>
    );
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    const highlightId = useId();

    return (
        <div
            role="group"
            aria-label="Filter services by category"
            className="flex gap-2 overflow-x-auto p-1 pb-2"
        >
            <FilterPill
                selected={selectedCategory === null}
                highlightId={highlightId}
                onClick={() => onCategoryChange(null)}
            >
                All services
            </FilterPill>

            {categories.map((category) => (
                <FilterPill
                    key={category.category_id}
                    selected={selectedCategory === category.slug}
                    highlightId={highlightId}
                    onClick={() => onCategoryChange(category.slug)}
                >
                    {category.name}
                </FilterPill>
            ))}
        </div>
    );
}