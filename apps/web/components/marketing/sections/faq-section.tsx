"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { faqItems } from "@/constants/marketing";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FaqSection() {
  const reduce = useReducedMotion();
  const baseId = useId();
  // One item open at a time; first is open so the section never looks empty.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section aria-labelledby="faq-heading" className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
        {/* Left: stays in view while the list scrolls on large screens */}
        <div className="max-w-md lg:sticky lg:top-28 lg:self-start">
          <h2
            id="faq-heading"
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
          >
            A few things worth knowing.
          </h2>

          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Learn more about Schedulyn, the people it serves, and what
            we&apos;re building.
          </p>

          <p className="mt-8 text-sm text-muted-foreground">
            Can&apos;t find your answer?{" "}
            <Link
              href="/contact"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get in touch
            </Link>
          </p>
        </div>

        {/* Right: accordion */}
        <ul className="border-t border-border">
          {faqItems.map((item, i) => {
            const open = openIndex === i;
            const buttonId = `${baseId}-q-${i}`;
            const panelId = `${baseId}-a-${i}`;

            return (
              <motion.li
                key={item.question}
                className="relative border-b border-border"
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: reduce ? 0 : 0.6,
                  ease: EASE,
                  delay: reduce ? 0 : Math.min(i * 0.06, 0.3),
                }}
              >
                {/* Accent line draws across the top of the open item */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -top-px h-px origin-left bg-primary transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                    open ? "scale-x-100" : "scale-x-0"
                  )}
                />

                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="group flex w-full items-center gap-5 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-6"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "w-6 shrink-0 text-sm font-medium tabular-nums transition-colors duration-300",
                        open ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={cn(
                        "flex-1 text-lg font-medium tracking-tight transition-colors duration-300 sm:text-xl",
                        !open && "text-foreground/80 group-hover:text-foreground"
                      )}
                    >
                      {item.question}
                    </span>

                    {/* Plus rotates into a cross; circle fills when open */}
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                      className={cn(
                        "relative grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                        open
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-foreground/70 group-hover:border-foreground/40"
                      )}
                    >
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span className="absolute h-3.5 w-px bg-current" />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="panel"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: { duration: reduce ? 0 : 0.45, ease: EASE },
                          opacity: {
                            duration: reduce ? 0 : 0.35,
                            delay: reduce ? 0 : 0.08,
                          },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: reduce ? 0 : 0.35, ease: EASE },
                          opacity: { duration: reduce ? 0 : 0.2 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      {/* Padding lives inside, so it never animates */}
                      <p className="max-w-2xl pb-7 pl-11 pr-14 text-base leading-7 text-muted-foreground sm:pl-[3.25rem]">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}