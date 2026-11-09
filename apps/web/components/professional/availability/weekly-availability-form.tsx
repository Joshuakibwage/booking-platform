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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
    weeklyAvailabilitySchema,
    type WeeklyAvailabilityFormValues,
} from "@/schemas/professional/weekly-availability.schema";

const EASE = [0.22, 1, 0.36, 1] as const;

const weekdays = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "7", label: "Sunday" },
];

function toMinutes(value?: string): number | null {
    if (!value) return null;
    const [h, m] = value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
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
                    role="alert"
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

type WeeklyAvailabilityFormProps = {
    initialValues?: WeeklyAvailabilityFormValues;
    onSubmit: (values: WeeklyAvailabilityFormValues) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
};

export function WeeklyAvailabilityForm({
    initialValues,
    onSubmit,
    onCancel,
    submitLabel,
}: WeeklyAvailabilityFormProps) {
    const reduce = useReducedMotion();
    const formId = useId();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<WeeklyAvailabilityFormValues>({
        resolver: zodResolver(weeklyAvailabilitySchema),
        defaultValues: initialValues ?? {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "17:00",
        },
    });

    // Live values drive the preview. The form itself is unchanged.
    const [dayOfWeek, startTime, endTime] = useWatch({
        control,
        name: ["dayOfWeek", "startTime", "endTime"],
    });

    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);
    const isValidRange =
        startMin !== null && endMin !== null && endMin > startMin;
    const leftPct = isValidRange ? (startMin / 1440) * 100 : 0;
    const widthPct = isValidRange ? ((endMin - startMin) / 1440) * 100 : 0;
    const selectedDay = weekdays.find((d) => d.value === String(dayOfWeek));

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
            {/* Preview: arch day markers + a timeline of the chosen hours */}
            <motion.div
                variants={item}
                className="relative overflow-hidden rounded-2xl bg-secondary p-4"
            >
                {/* Quarter-circle accent, same shape language as the rest of the site */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-0 size-16 rounded-bl-full bg-primary/10"
                />

                <div
                    role="group"
                    aria-label="Pick a day"
                    className="relative grid grid-cols-7 gap-1.5"
                >
                    {weekdays.map((day) => {
                        const selected = String(dayOfWeek) === day.value;

                        return (
                            <motion.button
                                key={day.value}
                                type="button"
                                aria-label={day.label}
                                aria-pressed={selected}
                                whileTap={reduce ? undefined : { scale: 0.94 }}
                                onClick={() =>
                                    setValue("dayOfWeek", Number(day.value), {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    })
                                }
                                className="relative grid h-14 place-items-center rounded-t-full rounded-b-lg border border-border bg-background text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                            >
                                {/* One highlight that slides between days */}
                                {selected && (
                                    <motion.span
                                        layoutId={`${formId}-day`}
                                        aria-hidden="true"
                                        className="absolute -inset-px rounded-t-full rounded-b-lg bg-primary"
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
                                    {day.label.slice(0, 3)}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="relative mt-5">
                    <div
                        aria-hidden="true"
                        className="relative h-2 rounded-full bg-muted"
                    >
                        <motion.div
                            className="absolute inset-y-0 rounded-full bg-primary"
                            initial={false}
                            animate={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                opacity: isValidRange ? 1 : 0,
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

                    <div
                        aria-hidden="true"
                        className="mt-2 flex justify-between text-[10px] tabular-nums text-muted-foreground"
                    >
                        <span>00</span>
                        <span>06</span>
                        <span>12</span>
                        <span>18</span>
                        <span>24</span>
                    </div>

                    <p
                        aria-live="polite"
                        className="mt-3 text-sm text-muted-foreground"
                    >
                        {isValidRange ? (
                            <>
                                <span className="font-medium text-foreground">
                                    {selectedDay?.label}
                                </span>
                                , {startTime} to {endTime}
                            </>
                        ) : (
                            "Choose a start and end time"
                        )}
                    </p>
                </div>
            </motion.div>

            <motion.div variants={item} className="space-y-2">
                <Label htmlFor="dayOfWeek">Day</Label>

                <Controller
                    name="dayOfWeek"
                    control={control}
                    render={({ field }) => (
                        <Select
                            value={String(field.value)}
                            onValueChange={(value) =>
                                field.onChange(Number(value))
                            }
                        >
                            <SelectTrigger
                                id="dayOfWeek"
                                className="w-full"
                                aria-describedby={
                                    errors.dayOfWeek
                                        ? `${formId}-dayOfWeek-error`
                                        : undefined
                                }
                            >
                                <SelectValue placeholder="Select a day" />
                            </SelectTrigger>

                            <SelectContent>
                                {weekdays.map((day) => (
                                    <SelectItem
                                        key={day.value}
                                        value={day.value}
                                    >
                                        {day.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />

                <FieldError
                    id={`${formId}-dayOfWeek-error`}
                    message={errors.dayOfWeek?.message}
                />
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-2 gap-4">
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