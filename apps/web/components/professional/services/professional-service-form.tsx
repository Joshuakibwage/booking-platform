"use client";

import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    professionalServiceSchema,
    type ProfessionalServiceFormValues,
} from "@/schemas/professional/professional-service.schema";

const EASE = [0.22, 1, 0.36, 1] as const;

const quickDurations = [15, 30, 45, 60, 90];
const RING_MAX_MINUTES = 120;

type ProfessionalServiceFormProps = {
    initialValues?: ProfessionalServiceFormValues;
    onSubmit: (values: ProfessionalServiceFormValues) => Promise<void>;
    submitLabel?: string;
    errorMessage?: string | null;
};

const defaultValues: ProfessionalServiceFormValues = {
    name: "",
    description: "",
    durationMinutes: 30,
    price: 0,
};

function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

/** Error text that eases in and out instead of popping. */
function FieldError({ id, message }: { id: string; message?: string }) {
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

export function ProfessionalServiceForm({
    initialValues = defaultValues,
    onSubmit,
    submitLabel = "Create service",
    errorMessage,
}: ProfessionalServiceFormProps) {
    const reduce = useReducedMotion();
    const formId = useId();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfessionalServiceFormValues>({
        resolver: zodResolver(professionalServiceSchema),
        defaultValues: initialValues,
    });

    // Live values drive the preview. The form itself is unchanged.
    const [name, description, durationMinutes, price] = useWatch({
        control,
        name: ["name", "description", "durationMinutes", "price"],
    });

    const duration = Number.isFinite(durationMinutes) ? durationMinutes : 0;
    const priceValue = Number.isFinite(price) ? price : 0;
    const ringProgress = Math.min(Math.max(duration, 0), RING_MAX_MINUTES) / RING_MAX_MINUTES;

    // Fields rise in one after another when the form mounts.
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

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Preview: how this service will read to customers */}
            <motion.div
                variants={item}
                aria-hidden="true"
                className="relative overflow-hidden rounded-2xl bg-secondary p-4"
            >
                {/* Quarter-circle accent, same shape language as the rest of the site */}
                <span className="pointer-events-none absolute right-0 top-0 size-16 rounded-bl-full bg-primary/10" />

                <div className="relative flex items-center gap-4">
                    {/* Ring fills with the duration (full ring = 2 hours) */}
                    <div className="relative size-12 shrink-0">
                        <svg
                            viewBox="0 0 36 36"
                            className="size-full -rotate-90"
                        >
                            <circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                strokeWidth="3"
                                className="stroke-muted"
                            />
                            <motion.circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="stroke-primary"
                                initial={false}
                                animate={{ pathLength: ringProgress }}
                                transition={
                                    reduce
                                        ? { duration: 0 }
                                        : {
                                              type: "spring",
                                              stiffness: 120,
                                              damping: 20,
                                          }
                                }
                            />
                        </svg>

                        <span className="absolute inset-0 grid place-items-center text-[11px] font-medium tabular-nums">
                            {duration > 0 ? duration : "-"}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <p
                            className={cn(
                                "truncate font-medium",
                                !name && "text-muted-foreground"
                            )}
                        >
                            {name || "Your service name"}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                            {description ||
                                "A short description will appear here."}
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="font-medium tabular-nums">
                            {priceValue > 0 ? priceValue.toFixed(2) : "Free"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {duration > 0 ? formatDuration(duration) : ""}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={item}>
                <AuthFormField
                    id="name"
                    label="Service name"
                    placeholder="e.g. Haircut and styling"
                    registration={register("name")}
                    error={errors.name?.message}
                />
            </motion.div>

            <motion.div variants={item} className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                    Description
                </label>

                <textarea
                    id="description"
                    rows={4}
                    placeholder="Describe what customers can expect from this service."
                    {...register("description")}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                        errors.description ? "description-error" : undefined
                    }
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
                />

                <FieldError
                    id="description-error"
                    message={errors.description?.message}
                />
            </motion.div>

            <motion.div
                variants={item}
                className="grid items-start gap-5 sm:grid-cols-2"
            >
                <div className="space-y-2">
                    <label htmlFor="durationMinutes" className="text-sm font-medium">
                        Duration (minutes)
                    </label>

                    <input
                        id="durationMinutes"
                        type="number"
                        min="1"
                        step="1"
                        {...register("durationMinutes", {
                            valueAsNumber: true,
                        })}
                        aria-invalid={Boolean(errors.durationMinutes)}
                        aria-describedby={
                            errors.durationMinutes ? "duration-error" : undefined
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    {/* Quick picks: one highlight slides between them */}
                    <div
                        role="group"
                        aria-label="Common durations"
                        className="flex flex-wrap gap-1.5"
                    >
                        {quickDurations.map((minutes) => {
                            const selected = duration === minutes;

                            return (
                                <motion.button
                                    key={minutes}
                                    type="button"
                                    aria-pressed={selected}
                                    whileTap={reduce ? undefined : { scale: 0.94 }}
                                    onClick={() =>
                                        setValue("durationMinutes", minutes, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }
                                    className="relative rounded-full border border-border px-3 py-1 text-xs font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    {selected && (
                                        <motion.span
                                            layoutId={`${formId}-duration`}
                                            aria-hidden="true"
                                            className="absolute -inset-px rounded-full bg-primary"
                                            transition={
                                                reduce
                                                    ? { duration: 0 }
                                                    : {
                                                          type: "spring",
                                                          stiffness: 380,
                                                          damping: 30,
                                                      }
                                            }
                                        />
                                    )}
                                    <span
                                        className={cn(
                                            "relative transition-colors duration-200",
                                            selected
                                                ? "text-primary-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {minutes}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    <FieldError
                        id="duration-error"
                        message={errors.durationMinutes?.message}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                        Price
                    </label>

                    <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("price", {
                            valueAsNumber: true,
                        })}
                        aria-invalid={Boolean(errors.price)}
                        aria-describedby={
                            errors.price ? "price-error" : undefined
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    <FieldError
                        id="price-error"
                        message={errors.price?.message}
                    />
                </div>
            </motion.div>

            <AnimatePresence initial={false}>
                {errorMessage && (
                    <motion.p
                        key="form-error"
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                        className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                        {errorMessage}
                    </motion.p>
                )}
            </AnimatePresence>

            <motion.div variants={item}>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {/* Label swaps with a short slide instead of snapping */}
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={isSubmitting ? "saving" : "idle"}
                            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                            transition={{ duration: reduce ? 0 : 0.18 }}
                            className="block"
                        >
                            {isSubmitting ? "Saving..." : submitLabel}
                        </motion.span>
                    </AnimatePresence>
                </Button>
            </motion.div>
        </motion.form>
    );
}