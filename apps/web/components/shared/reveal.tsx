"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
    children: ReactNode;
    /** Seconds. Use small steps (0.06) to stagger siblings. */
    delay?: number;
    className?: string;
};

/**
 * Fades and lifts its content once, as it scrolls into view.
 * A client wrapper, so the sections that use it can stay server components.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
                duration: reduce ? 0 : 0.6,
                ease: EASE,
                delay: reduce ? 0 : delay,
            }}
        >
            {children}
        </motion.div>
    );
}