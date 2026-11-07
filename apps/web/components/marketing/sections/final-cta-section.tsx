"use client";

import type { PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";

import { finalCtaContent } from "@/constants/marketing";
import { CtaLink } from "@/components/marketing/shared/cta-link";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 120, damping: 20, mass: 0.8 };

export function FinalCtaSection() {
  const {
    eyebrow,
    title,
    description,
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
  } = finalCtaContent;

  const reduce = useReducedMotion();

  // Pointer position over the panel, smoothed. The shapes drift at different depths.
  const nx = useSpring(useMotionValue(0), SPRING);
  const ny = useSpring(useMotionValue(0), SPRING);
  const archX = useTransform(nx, [-0.5, 0.5], [-14, 14]);
  const archY = useTransform(ny, [-0.5, 0.5], [-10, 10]);
  const circleX = useTransform(nx, [-0.5, 0.5], [22, -22]);
  const circleY = useTransform(ny, [-0.5, 0.5], [16, -16]);
  const quarterX = useTransform(nx, [-0.5, 0.5], [-8, 8]);
  const quarterY = useTransform(ny, [-0.5, 0.5], [-6, 6]);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    nx.set((e.clientX - r.left) / r.width - 0.5);
    ny.set((e.clientY - r.top) / r.height - 0.5);
  }

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  const rise: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.8, ease: EASE },
    },
  };

  const shapeIn: Variants = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.85 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduce ? 0 : 1, ease: EASE },
    },
  };

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          onPointerMove={onPointerMove}
          onPointerLeave={() => {
            nx.set(0);
            ny.set(0);
          }}
          className="relative isolate overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-14 lg:p-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Decorative shapes: entrance on the wrapper, pointer drift on the inner layer */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <motion.div
              variants={shapeIn}
              className="absolute bottom-0 right-0 size-32 origin-bottom-right sm:size-44 lg:size-60"
            >
              <motion.div
                style={{ x: quarterX, y: quarterY }}
                className="size-full rounded-tl-full bg-primary-foreground/15"
              />
            </motion.div>

            <motion.div
              variants={shapeIn}
              className="absolute bottom-0 right-24 hidden h-56 w-36 origin-bottom sm:block lg:right-48 lg:h-80 lg:w-52"
            >
              <motion.div
                style={{ x: archX, y: archY }}
                className="size-full rounded-t-full bg-primary-foreground/10"
              />
            </motion.div>

            <motion.div
              variants={shapeIn}
              className="absolute right-10 top-10 hidden size-28 sm:block lg:right-16 lg:top-14 lg:size-40"
            >
              <motion.div
                style={{ x: circleX, y: circleY }}
                className="size-full rounded-full bg-primary-foreground/20"
              />
            </motion.div>
          </div>

          <div className="max-w-3xl">
            <motion.p
              variants={rise}
              className="inline-flex items-center gap-2.5 text-sm font-medium text-primary-foreground/80"
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-tr-full bg-primary-foreground"
              />
              {eyebrow}
            </motion.p>

            <motion.h2
              variants={rise}
              id="final-cta-heading"
              className="mt-6 text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-7xl"
            >
              {title}
            </motion.h2>

            <motion.p
              variants={rise}
              className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg sm:leading-8"
            >
              {description}
            </motion.p>

            <motion.div variants={rise} className="mt-10 flex flex-wrap gap-3">
              <CtaLink href={primaryHref} variant="solid" tone="inverted" arrow>
                {primaryLabel}
              </CtaLink>
              <CtaLink href={secondaryHref} variant="outline" tone="inverted">
                {secondaryLabel}
              </CtaLink>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}