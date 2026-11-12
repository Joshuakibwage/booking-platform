"use client";

import { useEffect, useState } from "react";
import {
    usePathname,
    useSearchParams,
} from "next/navigation";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import { usePublicServices } from "@/hooks/public/use-public-services";
import { usePublicServiceCategories } from "@/hooks/public/use-public-service-categories";

import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/marketing/explore/category-filter";
import { PublicServiceCard } from "@/components/marketing/cards/public-service-card";

const EASE = [0.22, 1, 0.36, 1] as const;


export function ExploreServices() {
    // 1. Router and environment
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const reduce = useReducedMotion();

    // 2. Local state: only the search box. The category lives in the URL.
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    // 3. Derived from the URL, so the data below always matches what's in the address bar
    const selectedCategory = searchParams.get("category");

    // 4. Data
    const {
        data: categories = [],
        isLoading: isLoadingCategories,
        isError: isCategoriesError,
    } = usePublicServiceCategories();

    const {
        data: services = [],
        isLoading: isLoadingServices,
        isError: isServicesError,
        refetch,
    } = usePublicServices({
        search: search || undefined,
        category: selectedCategory || undefined,
    });

    // 5. Effects
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput.trim());
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchInput]);

    // 6. Handlers
    function handleCategoryChange(category: string | null) {
        const params = new URLSearchParams(searchParams.toString());

        if (category) {
            params.set("category", category);
        } else {
            params.delete("category");
        }

        const queryString = params.toString();
        const nextUrl = queryString
            ? `${pathname}?${queryString}`
            : pathname;

        window.history.pushState(null, "", nextUrl);
    }

    // 7. Derived display values
    const heading = selectedCategory
        ? categories.find((category) => category.slug === selectedCategory)
              ?.name ?? "Services"
        : "All services";

    // 8. Animation
    // Cards rise in one after another. Cards added by a new search or
    // category animate in on their own; removed cards fade out.
    const grid: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
    };

    const card: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 12 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.5, ease: EASE },
        },
        exit: {
            opacity: 0,
            transition: { duration: reduce ? 0 : 0.2 },
        },
    };

    const fadeIn = {
        initial: { opacity: 0, y: reduce ? 0 : 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: reduce ? 0 : 0.4, ease: EASE },
    };

    // 9. Render
    return (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    Explore services
                </h1>

                <p className="mt-4 text-base leading-7 text-muted-foreground">
                    Discover services from independent professionals and find
                    the right expertise for what you need.
                </p>
            </div>

            <div className="mt-10 space-y-8 min-h-screen">
                <div className="max-w-xl">
                    <Input
                        type="search"
                        placeholder="Search services..."
                        aria-label="Search services"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />
                </div>

                {isLoadingCategories ? (
                    <div
                        role="status"
                        aria-label="Loading categories"
                        className="flex gap-2 overflow-hidden"
                    >
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                aria-hidden="true"
                                className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none"
                            />
                        ))}
                    </div>
                ) : isCategoriesError ? (
                    <p className="text-sm text-destructive">
                        We couldn&apos;t load service categories. Please refresh the page.
                    </p>
                ) : (
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                )}

                <div>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {heading}
                        </h2>

                        {!isLoadingServices && !isServicesError && (
                            <p
                                aria-live="polite"
                                className="text-sm tabular-nums text-muted-foreground"
                            >
                                {services.length}{" "}
                                {services.length === 1 ? "service" : "services"}
                            </p>
                        )}
                    </div>

                    {isLoadingServices ? (
                        <div
                            role="status"
                            aria-live="polite"
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            <span className="sr-only">Loading services...</span>

                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    aria-hidden="true"
                                    className="h-56 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                                />
                            ))}
                        </div>
                    ) : isServicesError ? (
                        <motion.div {...fadeIn} className="py-12 text-center">
                            <p className="text-muted-foreground">
                                We couldn&apos;t load services right now.
                            </p>
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="mt-3 text-sm font-medium underline underline-offset-4"
                            >
                                Try again
                            </button>
                        </motion.div>
                    ) : services.length === 0 ? (
                        <motion.div
                            {...fadeIn}
                            className="rounded-xl border border-dashed border-border px-6 py-16 text-center"
                        >
                            <h3 className="font-semibold">No services found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try another search or choose a different category.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                            variants={grid}
                            initial="hidden"
                            animate="show"
                        >
                            <AnimatePresence mode="popLayout">
                                {services.map((service) => (
                                    <motion.div
                                        key={service.service_id}
                                        layout
                                        variants={card}
                                        exit="exit"
                                        transition={{
                                            layout: {
                                                duration: reduce ? 0 : 0.4,
                                                ease: EASE,
                                            },
                                        }}
                                    >
                                        <PublicServiceCard service={service} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}