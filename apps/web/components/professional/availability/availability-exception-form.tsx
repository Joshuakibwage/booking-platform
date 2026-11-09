"use client";

import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
    availabilityExceptionSchema,
    type AvailabilityExceptionFormValues,
} from "@/schemas/professional/availability-exception.schema";

const EASE = [0.22, 1, 0.36, 1] as const;

type AvailabilityExceptionFormProps = {
    initialValues?: AvailabilityExceptionFormValues;
    onSubmit: (values: AvailabilityExceptionFormValues) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
};

function toMinutes(value?: string | null): number | null {
    if (!value) return null;
    const [h, m] = value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
}

function parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
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

export function AvailabilityExceptionForm({
    initialValues,
    onSubmit,
    onCancel,
    submitLabel,
}: AvailabilityExceptionFormProps) {
    const reduce = useReducedMotion();
    const formId = useId();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AvailabilityExceptionFormValues>({
        resolver: zodResolver(availabilityExceptionSchema),
        defaultValues: initialValues ?? {
            exceptionDate: "",
            isAvailable: false,
            startTime: null,
            endTime: null,
            reason: "",
        },
    });

    // Live values drive the preview and the hours fields. The form logic is unchanged.
    const [exceptionDate, isAvailable, startTime, endTime] = useWatch({
        control,
        name: ["exceptionDate", "isAvailable", "startTime", "endTime"],
    });

    function handleAvailabilityChange(available: boolean) {
        setValue("isAvailable", available, {
            shouldDirty: true,
            shouldValidate: true,
        });

        if (available) {
            setValue("startTime", "09:00");
            setValue("endTime", "17:00");
        } else {
            setValue("startTime", null);
            setValue("endTime", null);
        }
    }

    const date = parseDate(exceptionDate);
    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);
    const hasRange =
        isAvailable && startMin !== null && endMin !== null && endMin > startMin;
    const leftPct = hasRange ? (startMin / 1440) * 100 : 0;
    const widthPct = hasRange ? ((endMin - startMin) / 1440) * 100 : 0;

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
            {/* Preview: how this exception will read in the list */}
            <motion.div
                variants={item}
                aria-hidden="true"
                className="relative overflow-hidden rounded-2xl bg-secondary p-4"
            >
                {/* Quarter-circle accent, same shape language as the rest of the site */}
                <span className="pointer-events-none absolute right-0 top-0 size-16 rounded-bl-full bg-primary/10" />

                <div className="relative flex items-start gap-4">
                    <div
                        className={cn(
                            "grid h-14 w-12 shrink-0 place-items-center rounded-t-full rounded-b-lg text-center leading-none transition-colors duration-300",
                            isAvailable
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                        <span className="mt-2 block">
                            <span className="block text-[10px] font-medium uppercase">
                                {date
                                    ? date.toLocaleDateString("en-KE", {
                                          month: "short",
                                      })
                                    : "Date"}
                            </span>
                            <span className="mt-0.5 block text-lg font-semibold tabular-nums">
                                {date ? date.getDate() : "--"}
                            </span>
                        </span>
                    </div>

                    <div className="min-w-0 space-y-2">
                        <p
                            className={cn(
                                "font-medium",
                                !date && "text-muted-foreground"
                            )}
                        >
                            {date
                                ? date.toLocaleDateString("en-KE", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                  })
                                : "Pick a date"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={
                                    isAvailable
                                        ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                                        : "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                                }
                            >
                                {isAvailable ? "Custom hours" : "Day off"}
                            </span>

                            {hasRange && (
                                <span className="text-sm text-muted-foreground">
                                    {startTime} - {endTime}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 24-hour track: only for custom hours, same bar as the weekly view */}
                <AnimatePresence initial={false}>
                    {isAvailable && (
                        <motion.div
                            key="track"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                                duration: reduce ? 0 : 0.3,
                                ease: EASE,
                            }}
                            className="relative overflow-hidden"
                        >
                            <div className="relative mt-4 h-2 rounded-full bg-muted">
                                <motion.div
                                    className="absolute inset-y-0 rounded-full bg-primary"
                                    initial={false}
                                    animate={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        opacity: hasRange ? 1 : 0,
                                    }}
                                    transition={
                                        reduce
                                            ? { duration: 0 }
                                            : {
                                                  type: "spring",
                                                  stiffness: 220,
                                                  damping: 28,
                                              }
                                    }
                                />
                            </div>

                            <div className="mt-2 flex justify-between text-[10px] tabular-nums text-muted-foreground">
                                <span>00</span>
                                <span>06</span>
                                <span>12</span>
                                <span>18</span>
                                <span>24</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={item} className="space-y-2">
                <Label htmlFor="exceptionDate">Date</Label>
                <Input
                    id="exceptionDate"
                    type="date"
                    {...register("exceptionDate")}
                    aria-invalid={Boolean(errors.exceptionDate)}
                    aria-describedby={
                        errors.exceptionDate
                            ? `${formId}-exceptionDate-error`
                            : undefined
                    }
                />
                <FieldError
                    id={`${formId}-exceptionDate-error`}
                    message={errors.exceptionDate?.message}
                />
            </motion.div>

            <motion.div
                variants={item}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
                <div className="space-y-1">
                    <Label htmlFor="isAvailable">Available on this date</Label>
                    <p className="text-sm text-muted-foreground">
                        Turn this on to set custom working hours.
                    </p>
                </div>

                <Controller
                    name="isAvailable"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="isAvailable"
                            checked={field.value}
                            onCheckedChange={handleAvailabilityChange}
                        />
                    )}
                />
            </motion.div>

            {/* Hours open and close smoothly instead of popping in */}
            <AnimatePresence initial={false}>
                {isAvailable && (
                    <motion.div
                        key="hours"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                            duration: reduce ? 0 : 0.35,
                            ease: EASE,
                        }}
                        // Padding keeps focus rings from being clipped by the overflow
                        className="-mx-1 -my-1 overflow-hidden px-1 py-1"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    {...register("startTime")}
                                    aria-invalid={Boolean(errors.startTime)}
                                    aria-describedby={
                                        errors.startTime
                                            ? `${formId}-startTime-error`
                                            : undefined
                                    }
                                />
                                <FieldError
                                    id={`${formId}-startTime-error`}
                                    message={errors.startTime?.message}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">End time</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    {...register("endTime")}
                                    aria-invalid={Boolean(errors.endTime)}
                                    aria-describedby={
                                        errors.endTime
                                            ? `${formId}-endTime-error`
                                            : undefined
                                    }
                                />
                                <FieldError
                                    id={`${formId}-endTime-error`}
                                    message={errors.endTime?.message}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={item} className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                    id="reason"
                    placeholder="e.g. Personal commitments"
                    {...register("reason")}
                    aria-invalid={Boolean(errors.reason)}
                    aria-describedby={
                        errors.reason ? `${formId}-reason-error` : undefined
                    }
                />
                <FieldError
                    id={`${formId}-reason-error`}
                    message={errors.reason?.message}
                />
            </motion.div>

            <motion.div variants={item} className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting}>
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