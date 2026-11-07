"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { CategoryCard } from "@/components/marketing/cards/category-card";
import { serviceCategories } from "@/constants/marketing";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CategoriesSection() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="categories-heading"
      className="border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="categories-heading"
              className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
            >
              Services for the things that matter.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Whatever you need help with, find independent professionals
              bringing their skills and experience to the table.
            </p>
          </div>

          <Link
            href="/explore"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="relative">
              Browse all services
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-px origin-left bg-foreground transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-0 motion-reduce:transition-none"
              />
            </span>
          </Link>
        </div>

        {/* Columns are offset on large screens for an editorial rhythm */}
        <ul className="mt-14 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((category, i) => (
            <motion.li
              key={category.title}
              className={cn(
                i % 2 === 1 && "sm:max-lg:mt-10",
                i % 3 === 1 && "lg:mt-14"
              )}
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: reduce ? 0 : 0.7,
                ease: EASE,
                delay: reduce ? 0 : (i % 3) * 0.08,
              }}
            >
              <CategoryCard
                title={category.title}
                description={category.description}
                image={category.image}
                href="/explore"
                index={i}
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}