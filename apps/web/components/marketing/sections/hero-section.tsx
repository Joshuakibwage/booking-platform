"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { CtaLink } from "@/components/marketing/shared/cta-link";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 260, damping: 28, mass: 0.6 };
const BADGE = 88; // px, keep in sync with size-[5.5rem]

/**
 * Load-in runs from CSS keyframes, not JS, so the headline animates on first
 * paint without waiting for hydration and never blocks the main thread.
 */
const css = `
@keyframes hero-rise { from { transform: translateY(105%); } to { transform: none; } }
@keyframes hero-fade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.hero-rise { animation: hero-rise 1s cubic-bezier(.22,1,.36,1) both; }
.hero-fade { animation: hero-fade .8s cubic-bezier(.22,1,.36,1) .45s both; }
@media (prefers-reduced-motion: reduce) { .hero-rise, .hero-fade { animation: none; } }
`;

function Line({ index, children }: { index: number; children: ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
      <span
        className="hero-rise block"
        style={{ animationDelay: `${index * 90}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

export function HeroSection() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // Same pointer behaviour as the service cards, so the page feels consistent.
  const bx = useSpring(useMotionValue(0), SPRING);
  const by = useSpring(useMotionValue(0), SPRING);
  const nx = useSpring(useMotionValue(0), SPRING);
  const ny = useSpring(useMotionValue(0), SPRING);
  const imgX = useTransform(nx, [-0.5, 0.5], [14, -14]);
  const imgY = useTransform(ny, [-0.5, 0.5], [14, -14]);

  function track(e: PointerEvent<HTMLElement>, jump = false) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    if (jump) {
      bx.jump(px - BADGE / 2);
      by.jump(py - BADGE / 2);
    } else {
      bx.set(px - BADGE / 2);
      by.set(py - BADGE / 2);
    }
    nx.set(px / r.width - 0.5);
    ny.set(py / r.height - 0.5);
  }

  const showBadge = hovered && !reduce;

  return (
    <section aria-labelledby="hero-heading">
      <style>{css}</style>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-20">
        {/* Left: copy */}
        <div className="lg:col-span-7">
          <h1
            id="hero-heading"
            className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem] xl:text-7xl"
          >
            <Line index={0}>Independent</Line>
            <Line index={1}>professionals,</Line>
            <Line index={2}>booked in minutes.</Line>
          </h1>

          <div className="hero-fade">
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Discover independent professionals, see who&rsquo;s free, and
              book directly.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaLink href="/explore">Explore services</CtaLink>

              <CtaLink href="/become-a-professional" variant="outline">
                Become a professional
              </CtaLink>
            </div>
          </div>
        </div>

        {/* Right: one image, one accent shape */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:ml-auto lg:mr-0">
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -left-4 aspect-square w-[34%] rounded-tr-full bg-primary"
            />

            <Link
              href="/explore"
              aria-label="Explore services"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                track(e, true);
                setHovered(true);
              }}
              onPointerMove={(e) => track(e)}
              onPointerLeave={() => {
                setHovered(false);
                nx.set(0);
                ny.set(0);
              }}
              className="relative isolate block aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl bg-muted ring-ring ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2"
            >
              <motion.div
                className="absolute inset-0"
                style={{ x: imgX, y: imgY }}
                animate={{ scale: hovered && !reduce ? 1.14 : 1.08 }}
                transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
              >
                <Image
                  src="/assets/photographer.jpg"
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  className="object-cover"
                />
              </motion.div>

              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-4 flex justify-center px-3"
              >
                <span className="whitespace-nowrap rounded-full bg-background px-3.5 py-1.5 text-sm">
                  <span className="font-medium">Jason</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · Photographer · Free today
                  </span>
                </span>
              </span>

              {/* Cursor-following badge. Mouse devices only. */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 hidden size-[5.5rem] place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground [@media(hover:hover)]:grid"
                style={{ x: bx, y: by }}
                initial={false}
                animate={{ scale: showBadge ? 1 : 0, opacity: showBadge ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
              >
                Explore
              </motion.span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}