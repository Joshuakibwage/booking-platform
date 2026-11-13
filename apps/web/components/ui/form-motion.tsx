"use client";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Variants that make a form's fields rise in one after another on mount. */
export function useFormMotion() {
    const reduce = useReducedMotion();

    const container: Variants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: reduce ? 0 : 0.06,
                delayChildren: reduce ? 0 : 0.05,
            },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 10 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.45, ease: EASE },
        },
    };

    return { container, item, reduce };
}

/** Field error text that eases in and out instead of popping. */
export function FieldError({ id, message }: { id: string; message?: string }) {
    const reduce = useReducedMotion();

    return (
        <AnimatePresence initial={false}>
            {message && (
                <motion.p
                    key="error"
                    id={id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                    className="overflow-hidden text-sm text-destructive"
                >
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

/** Form-level error banner that eases in and out. */
export function FormError({ message }: { message?: string | null }) {
    const reduce = useReducedMotion();

    return (
        <AnimatePresence initial={false}>
            {message && (
                <motion.p
                    key="form-error"
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                    className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

/** Button label that slides between its idle and pending text. */
export function SubmitLabel({
    isPending,
    label,
    pendingLabel,
}: {
    isPending: boolean;
    label: string;
    pendingLabel: string;
}) {
    const reduce = useReducedMotion();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.span
                key={isPending ? "pending" : "idle"}
                initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                transition={{ duration: reduce ? 0 : 0.18 }}
                className="block"
            >
                {isPending ? pendingLabel : label}
            </motion.span>
        </AnimatePresence>
    );
}