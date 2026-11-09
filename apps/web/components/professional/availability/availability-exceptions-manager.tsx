"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
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

import { useAvailabilityExceptions } from "@/hooks/professional/use-availability-exceptions";
import { useCreateAvailabilityException } from "@/hooks/professional/use-create-availability-exception";
import { useUpdateAvailabilityException } from "@/hooks/professional/use-update-availability-exception";
import { useDeleteAvailabilityException } from "@/hooks/professional/use-delete-availability-exception";

import type { AvailabilityException } from "@/lib/api/professional-availability.api";
import type { AvailabilityExceptionFormValues } from "@/schemas/professional/availability-exception.schema";

import { AvailabilityExceptionForm } from "./availability-exception-form";

const EASE = [0.22, 1, 0.36, 1] as const;

function parseDate(date: string) {
    return new Date(`${date.slice(0, 10)}T00:00:00`);
}

function formatDate(date: string) {
    return parseDate(date).toLocaleDateString("en-KE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

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

function getErrorMessage(error: unknown) {
    if (isAxiosError<{ message?: unknown }>(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    return "Something went wrong. Please try again.";
}

export function AvailabilityExceptionsManager() {
    const reduce = useReducedMotion();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingException, setEditingException] =
        useState<AvailabilityException | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const exceptionsQuery = useAvailabilityExceptions();
    const createMutation = useCreateAvailabilityException();
    const updateMutation = useUpdateAvailabilityException();
    const deleteMutation = useDeleteAvailabilityException();

    const exceptions = exceptionsQuery.data ?? [];

    function openCreateDialog() {
        setEditingException(null);
        setActionError(null);
        setDialogOpen(true);
    }

    function openEditDialog(exception: AvailabilityException) {
        setEditingException(exception);
        setActionError(null);
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setEditingException(null);
        setActionError(null);
    }

    async function handleSubmit(values: AvailabilityExceptionFormValues) {
        setActionError(null);

        const input = {
            ...values,
            reason: values.reason?.trim() || null,
        };

        try {
            if (editingException) {
                await updateMutation.mutateAsync({
                    exceptionId: editingException.exception_id,
                    input,
                });
            } else {
                await createMutation.mutateAsync(input);
            }

            closeDialog();
        } catch (error) {
            setActionError(getErrorMessage(error));
        }
    }

    async function handleDelete(exception: AvailabilityException) {
        const confirmed = window.confirm(
            `Are you sure you want to delete the exception for ${formatDate(exception.exception_date)}?`,
        );

        if (!confirmed) return;

        setActionError(null);

        try {
            await deleteMutation.mutateAsync(exception.exception_id);
        } catch (error) {
            setActionError(getErrorMessage(error));
        }
    }

    const initialValues: AvailabilityExceptionFormValues = editingException
        ? {
              exceptionDate: editingException.exception_date.slice(0, 10),
              isAvailable: editingException.is_available,
              startTime: editingException.start_time?.slice(0, 5) ?? null,
              endTime: editingException.end_time?.slice(0, 5) ?? null,
              reason: editingException.reason,
          }
        : {
              exceptionDate: "",
              isAvailable: false,
              startTime: null,
              endTime: null,
              reason: "",
          };

    if (exceptionsQuery.isPending) {
        return (
            <div role="status" aria-live="polite">
                <span className="sr-only">
                    Loading your date exceptions...
                </span>

                <div
                    aria-hidden="true"
                    className="h-64 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                />
            </div>
        );
    }

    if (exceptionsQuery.isError) {
        return (
            <div className="space-y-3 py-8">
                <p className="text-sm text-destructive">
                    Couldn&apos;t load your date exceptions.
                </p>
                <Button
                    variant="outline"
                    onClick={() => exceptionsQuery.refetch()}
                >
                    Try again
                </Button>
            </div>
        );
    }

    // Rows rise in one after another; later additions animate in on their own.
    const list: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
    };

    const row: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 12 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.5, ease: EASE },
        },
        exit: {
            opacity: 0,
            scale: reduce ? 1 : 0.97,
            transition: { duration: reduce ? 0 : 0.25, ease: EASE },
        },
    };

    return (
        <section className="space-y-4">
            <AnimatePresence initial={false}>
                {actionError && (
                    <motion.p
                        key="action-error"
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                        className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                        {actionError}
                    </motion.p>
                )}
            </AnimatePresence>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>Date exceptions</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage days off and changes to your regular hours.
                        </p>
                    </div>

                    <Button className="group" onClick={openCreateDialog}>
                        <Plus className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none" />
                        Add exception
                    </Button>
                </CardHeader>

                <CardContent>
                    {exceptions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: reduce ? 0 : 0.6,
                                ease: EASE,
                            }}
                            className="flex flex-col items-center gap-3 py-10 text-center"
                        >
                            {/* Arch tile with a quarter-circle accent, same shape language as the rest of the site */}
                            <div className="relative grid h-20 w-16 place-items-center overflow-hidden rounded-t-full rounded-b-lg bg-secondary">
                                <span
                                    aria-hidden="true"
                                    className="absolute bottom-0 right-0 size-6 rounded-tl-full bg-primary/20"
                                />
                                <CalendarDays
                                    size={28}
                                    aria-hidden="true"
                                    className="relative text-muted-foreground"
                                />
                            </div>

                            <div className="space-y-1">
                                <p className="font-medium">
                                    No date exceptions yet
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Add a day off or set different working
                                    hours for a specific date.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={openCreateDialog}
                            >
                                Add your first exception
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="divide-y"
                            variants={list}
                            initial="hidden"
                            animate="show"
                        >
                            <AnimatePresence mode="popLayout">
                                {exceptions.map((exception) => {
                                    const date = parseDate(
                                        exception.exception_date,
                                    );
                                    const hasHours =
                                        exception.is_available &&
                                        exception.start_time &&
                                        exception.end_time;

                                    const left = hasHours
                                        ? (toMinutes(exception.start_time!) /
                                              1440) *
                                          100
                                        : 0;
                                    const width = hasHours
                                        ? (Math.max(
                                              0,
                                              toMinutes(exception.end_time!) -
                                                  toMinutes(
                                                      exception.start_time!,
                                                  ),
                                          ) /
                                              1440) *
                                          100
                                        : 0;

                                    return (
                                        <motion.div
                                            key={exception.exception_id}
                                            layout
                                            variants={row}
                                            exit="exit"
                                            transition={{
                                                layout: {
                                                    duration: reduce ? 0 : 0.4,
                                                    ease: EASE,
                                                },
                                            }}
                                            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Date tile: arch shape, tinted by type of exception */}
                                                <div
                                                    aria-hidden="true"
                                                    className={`grid h-14 w-12 shrink-0 place-items-center rounded-t-full rounded-b-lg text-center leading-none ${
                                                        exception.is_available
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    <span className="mt-2 block">
                                                        <span className="block text-[10px] font-medium uppercase">
                                                            {date.toLocaleDateString(
                                                                "en-KE",
                                                                {
                                                                    month: "short",
                                                                },
                                                            )}
                                                        </span>
                                                        <span className="mt-0.5 block text-lg font-semibold tabular-nums">
                                                            {date.getDate()}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="font-medium">
                                                        {formatDate(
                                                            exception.exception_date,
                                                        )}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={
                                                                exception.is_available
                                                                    ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                                                                    : "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                                                            }
                                                        >
                                                            {exception.is_available
                                                                ? "Custom hours"
                                                                : "Day off"}
                                                        </span>

                                                        {hasHours && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatTime(
                                                                    exception.start_time!,
                                                                )}
                                                                {" - "}
                                                                {formatTime(
                                                                    exception.end_time!,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* 24-hour track for custom hours, same as the weekly view */}
                                                    {hasHours && (
                                                        <div
                                                            aria-hidden="true"
                                                            className="relative h-1.5 w-48 max-w-full rounded-full bg-muted"
                                                        >
                                                            <motion.span
                                                                className="absolute inset-y-0 rounded-full bg-primary"
                                                                initial={{
                                                                    left: `${left}%`,
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    left: `${left}%`,
                                                                    width: `${width}%`,
                                                                }}
                                                                transition={
                                                                    reduce
                                                                        ? {
                                                                              duration: 0,
                                                                          }
                                                                        : {
                                                                              type: "spring",
                                                                              stiffness: 220,
                                                                              damping: 28,
                                                                          }
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                    {exception.reason && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {exception.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        openEditDialog(exception)
                                                    }
                                                    aria-label="Edit date exception"
                                                >
                                                    <Pencil />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        handleDelete(exception)
                                                    }
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                    aria-label="Delete date exception"
                                                >
                                                    <Trash2 className="text-destructive" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

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
                            {editingException
                                ? "Edit date exception"
                                : "Add date exception"}
                        </DialogTitle>

                        <DialogDescription>
                            Override your regular weekly availability for
                            this specific date.
                        </DialogDescription>
                    </DialogHeader>

                    {dialogOpen && (
                        <AvailabilityExceptionForm
                            key={
                                editingException?.exception_id ?? "new-exception"
                            }
                            initialValues={initialValues}
                            onSubmit={handleSubmit}
                            onCancel={closeDialog}
                            submitLabel={
                                editingException
                                    ? "Save changes"
                                    : "Add exception"
                            }
                        />
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}