"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { forProfessionalsContent } from "@/constants/marketing";
import { CtaLink } from "@/components/marketing/shared/cta-link";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "-80px" } as const;

// Sample profile content for the preview. Swap for whatever fits your platform.
const services = [
  { name: "Portrait session", meta: "1 hr", price: "$40" },
  { name: "Family shoot", meta: "2 hrs", price: "$90" },
  { name: "Event coverage", meta: "Half day", price: "$220" },
];

const week = [
  { day: "M", open: true },
  { day: "T", open: false },
  { day: "W", open: true },
  { day: "T", open: true },
  { day: "F", open: false },
];

export function ForProfessionalsSection() {
  const { eyebrow, title, description, benefits, ctaLabel, ctaHref } =
    forProfessionalsContent;
  const reduce = useReducedMotion();

  // One orchestrated reveal per column: children rise in sequence.
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  const pop: Variants = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.5, ease: EASE },
    },
  };

  const toast: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduce
        ? { duration: 0 }
        : { type: "spring", stiffness: 260, damping: 22, delay: 1.1 },
    },
  };

  return (
    <section
      aria-labelledby="professionals-heading"
      className="border-t border-border"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8">
        {/* Left: copy */}
        <motion.div
          className="max-w-xl"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          <motion.p
            variants={item}
            className="inline-flex items-center gap-2.5 text-sm font-medium text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-tr-full bg-primary"
            />
            {eyebrow}
          </motion.p>

          <motion.h2
            variants={item}
            id="professionals-heading"
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={item}
            className="mt-5 text-base leading-7 text-muted-foreground"
          >
            {description}
          </motion.p>

          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <motion.li
                key={benefit}
                variants={item}
                className="flex items-start gap-3"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span className="text-sm leading-6 sm:text-base">{benefit}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div variants={item} className="mt-9">
            <CtaLink href={ctaHref} arrow>
              {ctaLabel}
            </CtaLink>
          </motion.div>
        </motion.div>

        {/* Right: a profile that assembles itself as it scrolls into view */}
        <motion.div
          aria-hidden="true"
          className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          {/* Quarter-circle accent, same shape language as the rest of the page */}
          <div className="absolute -bottom-4 -left-4 aspect-square w-28 rounded-tr-full bg-primary" />

          <div className="relative rounded-3xl rounded-tr-[6rem] bg-secondary p-5 sm:p-8">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 28 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: reduce ? 0 : 0.8,
                    ease: EASE,
                    staggerChildren: reduce ? 0 : 0.09,
                    delayChildren: reduce ? 0 : 0.2,
                  },
                },
              }}
              className="rounded-2xl border border-border bg-background p-5 sm:p-6"
            >
              <motion.div variants={item} className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  j
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">Jason</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Portrait photographer
                  </p>
                </div>
                <span className="ml-auto hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs sm:flex">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Accepting bookings
                </span>
              </motion.div>

              <ul className="mt-6 divide-y divide-border border-y border-border">
                {services.map((s) => (
                  <motion.li
                    key={s.name}
                    variants={item}
                    className="flex items-center justify-between gap-4 py-3.5 text-sm"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">
                      {s.meta}
                      <span className="mx-2 text-border">/</span>
                      <span className="font-medium text-foreground">
                        {s.price}
                      </span>
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.div variants={item} className="mt-5">
                <p className="text-xs text-muted-foreground">This week</p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {week.map((d, i) => (
                    <motion.span
                      key={i}
                      variants={pop}
                      className={
                        d.open
                          ? "grid h-10 place-items-center rounded-lg bg-primary/10 text-sm font-medium text-primary"
                          : "grid h-10 place-items-center rounded-lg bg-muted text-sm text-muted-foreground/60 line-through"
                      }
                    >
                      {d.day}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* A booking lands once the profile is built */}
          <motion.div
            variants={toast}
            className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-full border border-border bg-background py-2 pl-2 pr-5 sm:-right-5"
          >
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <span className="text-sm">
              <span className="block font-medium leading-tight">
                New booking
              </span>
              <span className="block leading-tight text-muted-foreground">
                Sat, 10:00 · Portrait session
              </span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}