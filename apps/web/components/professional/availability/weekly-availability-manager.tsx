"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useWeeklyAvailability } from "@/hooks/professional/use-weekly-availability";
import { useCreateWeeklyAvailability } from "@/hooks/professional/use-create-weekly-availability";
import { useUpdateWeeklyAvailability } from "@/hooks/professional/use-update-weekly-availability";
import { useDeleteWeeklyAvailability } from "@/hooks/professional/use-delete-weekly-availability";

import type { WeeklyAvailabilityPeriod } from "@/lib/api/professional-availability.api";
import type { WeeklyAvailabilityFormValues } from "@/schemas/professional/weekly-availability.schema";

import { WeeklyAvailabilityForm } from "./weekly-availability-form";

const EASE = [0.22, 1, 0.36, 1] as const;

const weekdays = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
];

function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

function toMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
}

function formatDuration(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function getErrorMessage(error: unknown) {
    if (isAxiosError<{ message?: unknown }>(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    return "Something went wrong. Please try again.";
}

export function WeeklyAvailabilityManager() {
    const reduce = useReducedMotion();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] =
        useState<WeeklyAvailabilityPeriod | null>(null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [actionError, setActionError] = useState<string | null>(null);

    const availabilityQuery = useWeeklyAvailability();
    const createMutation = useCreateWeeklyAvailability();
    const updateMutation = useUpdateWeeklyAvailability();
    const deleteMutation = useDeleteWeeklyAvailability();

    const periods = availabilityQuery.data ?? [];

    function openCreateDialog(dayOfWeek: number) {
        setEditingPeriod(null);
        setSelectedDay(dayOfWeek);
        setActionError(null);
        setDialogOpen(true);
    }

    function openEditDialog(period: WeeklyAvailabilityPeriod) {
        setEditingPeriod(period);
        setSelectedDay(period.day_of_week);
        setActionError(null);
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setEditingPeriod(null);
        setActionError(null);
    }

    async function handleSubmit(values: WeeklyAvailabilityFormValues) {
        setActionError(null);

        try {
            if (editingPeriod) {
                await updateMutation.mutateAsync({
                    availabilityId: editingPeriod.availability_id,
                    input: values,
                });
            } else {
                await createMutation.mutateAsync(values);
            }

            closeDialog();
        } catch (error) {
            setActionError(getErrorMessage(error));
        }
    }

    async function handleDelete(period: WeeklyAvailabilityPeriod) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this availability period?",
        );

        if (!confirmed) return;

        setActionError(null);

        try {
            await deleteMutation.mutateAsync(period.availability_id);
        } catch (error) {
            setActionError(getErrorMessage(error));
        }
    }

    if (availabilityQuery.isPending) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="grid gap-4 py-2 md:grid-cols-2"
            >
                <span className="sr-only">Loading your availability...</span>

                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        aria-hidden="true"
                        className="h-40 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                    />
                ))}
            </div>
        );
    }

    if (availabilityQuery.isError) {
        return (
            <div className="space-y-3 py-8">
                <p className="text-sm text-destructive">
                    Couldn&apos;t load your weekly availability.
                </p>
                <Button
                    variant="outline"
                    onClick={() => availabilityQuery.refetch()}
                >
                    Try again
                </Button>
            </div>
        );
    }

    const initialValues: WeeklyAvailabilityFormValues = editingPeriod
        ? {
              dayOfWeek: editingPeriod.day_of_week,
              startTime: editingPeriod.start_time.slice(0, 5),
              endTime: editingPeriod.end_time.slice(0, 5),
          }
        : {
              dayOfWeek: selectedDay,
              startTime: "09:00",
              endTime: "17:00",
          };

    // Day cards rise in one after another when the list first appears.
    const grid: Variants = {
        hidden: {},
        show: {
            transition: { staggerChildren: reduce ? 0 : 0.06 },
        },
    };

    const cardIn: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 16 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.6, ease: EASE },
        },
    };

    const rowTransition = { duration: reduce ? 0 : 0.3, ease: EASE };

    return (
        <section className="space-y-6">
            <AnimatePresence initial={false}>
                {actionError && (
                    <motion.p
                        key="action-error"
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={rowTransition}
                        className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                        {actionError}
                    </motion.p>
                )}
            </AnimatePresence>

            <motion.div
                className="grid gap-4 md:grid-cols-2"
                variants={grid}
                initial="hidden"
                animate="show"
            >
                {weekdays.map((day) => {
                    const dayPeriods = periods.filter(
                        (period) => period.day_of_week === day.value,
                    );
                    const totalMinutes = dayPeriods.reduce(
                        (sum, period) =>
                            sum +
                            Math.max(
                                0,
                                toMinutes(period.end_time) -
                                    toMinutes(period.start_time),
                            ),
                        0,
                    );

                    return (
                        <motion.div key={day.value} variants={cardIn}>
                            <Card className="relative h-full overflow-hidden">
                                {/* Quarter-circle accent: tints up when the day has hours */}
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute bottom-0 right-0 size-12 rounded-tl-full transition-colors duration-500 ${
                                        dayPeriods.length > 0
                                            ? "bg-primary/15"
                                            : "bg-muted"
                                    }`}
                                />

                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <CardTitle>{day.label}</CardTitle>

                                        {totalMinutes > 0 && (
                                            <span className="text-xs tabular-nums text-muted-foreground">
                                                {formatDuration(totalMinutes)}
                                            </span>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="group"
                                        onClick={() =>
                                            openCreateDialog(day.value)
                                        }
                                        aria-label={`Add availability for ${day.label}`}
                                    >
                                        <Plus className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none" />
                                    </Button>
                                </CardHeader>

                                <CardContent className="relative space-y-3">
                                    {/* 24-hour track: bars grow in and glide when hours change */}
                                    <div
                                        aria-hidden="true"
                                        className="relative h-1.5 rounded-full bg-muted"
                                    >
                                        <AnimatePresence initial>
                                            {dayPeriods.map((period) => {
                                                const left =
                                                    (toMinutes(
                                                        period.start_time,
                                                    ) /
                                                        1440) *
                                                    100;
                                                const width =
                                                    (Math.max(
                                                        0,
                                                        toMinutes(
                                                            period.end_time,
                                                        ) -
                                                            toMinutes(
                                                                period.start_time,
                                                            ),
                                                    ) /
                                                        1440) *
                                                    100;

                                                return (
                                                    <motion.span
                                                        key={
                                                            period.availability_id
                                                        }
                                                        className="absolute inset-y-0 rounded-full bg-primary"
                                                        initial={{
                                                            left: `${left}%`,
                                                            width: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            left: `${left}%`,
                                                            width: `${width}%`,
                                                            opacity: 1,
                                                        }}
                                                        exit={{ opacity: 0 }}
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
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>

                                    <AnimatePresence
                                        initial={false}
                                        mode="popLayout"
                                    >
                                        {dayPeriods.length === 0 ? (
                                            <motion.p
                                                key="empty"
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={rowTransition}
                                                className="text-sm text-muted-foreground"
                                            >
                                                Not available
                                            </motion.p>
                                        ) : (
                                            dayPeriods.map((period) => (
                                                <motion.div
                                                    key={period.availability_id}
                                                    layout
                                                    initial={{
                                                        opacity: 0,
                                                        scale: reduce ? 1 : 0.96,
                                                        y: reduce ? 0 : -6,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: reduce ? 1 : 0.96,
                                                    }}
                                                    transition={rowTransition}
                                                    className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                                                >
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock3
                                                            size={16}
                                                            className="text-muted-foreground"
                                                        />
                                                        <span>
                                                            {formatTime(
                                                                period.start_time,
                                                            )}
                                                            {" - "}
                                                            {formatTime(
                                                                period.end_time,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    period,
                                                                )
                                                            }
                                                            aria-label="Edit availability period"
                                                        >
                                                            <Pencil />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    period,
                                                                )
                                                            }
                                                            disabled={
                                                                deleteMutation.isPending
                                                            }
                                                            aria-label="Delete availability period"
                                                        >
                                                            <Trash2 className="text-destructive" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    } else {
                        setDialogOpen(true);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPeriod
                                ? "Edit availability"
                                : "Add availability"}
                        </DialogTitle>

                        <DialogDescription>
                            Set the hours when customers can book your
                            services on this day.
                        </DialogDescription>
                    </DialogHeader>

                    {dialogOpen && (
                        <WeeklyAvailabilityForm
                            key={editingPeriod?.availability_id ?? selectedDay}
                            initialValues={initialValues}
                            onSubmit={handleSubmit}
                            onCancel={closeDialog}
                            submitLabel={
                                editingPeriod ? "Save changes" : "Add hours"
                            }
                        />
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}