
"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Pencil, Trash2 } from "lucide-react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "motion/react";

import type { ProfessionalService } from "@/lib/api/professional-services.api";
import { useDeactivateProfessionalService } from "@/hooks/professional/use-deactivate-professional-service";
import { useUpdateProfessionalService } from "@/hooks/professional/use-update-professional-service";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ProfessionalServiceForm } from "@/components/professional/services/professional-service-form";
import type { ProfessionalServiceFormValues } from "@/schemas/professional/professional-service.schema";

const EASE = [0.22, 1, 0.36, 1] as const;
const RING_MAX_MINUTES = 120;

type ProfessionalServiceListProps = {
    services: ProfessionalService[];
    isLoading: boolean;
    isError: boolean;
};

type DialogMode = "edit" | "deactivate" | null;

function getErrorMessage(error: unknown, action: "update" | "deactivate"): string {
    if (isAxiosError<{ message?: unknown }>(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    return action === "update"
        ? "We couldn't update this service. Please try again."
        : "We couldn't deactivate this service. Please try again.";
}

/** Small ring that fills in proportion to the duration (full ring = 2 hours). */
function DurationRing({ minutes }: { minutes: number }) {
    const reduce = useReducedMotion();
    const progress =
        Math.min(Math.max(minutes, 0), RING_MAX_MINUTES) / RING_MAX_MINUTES;

    return (
        <svg
            viewBox="0 0 36 36"
            aria-hidden="true"
            className="size-9 shrink-0 -rotate-90"
        >
            <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                strokeWidth="3.5"
                className="stroke-muted"
            />
            <motion.circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="stroke-primary"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress }}
                transition={{
                    duration: reduce ? 0 : 1,
                    ease: EASE,
                    delay: reduce ? 0 : 0.2,
                }}
            />
        </svg>
    );
}

export function ProfessionalServiceList({
    services,
    isLoading,
    isError,
}: ProfessionalServiceListProps) {
    const reduce = useReducedMotion();

    const [selectedService, setSelectedService] =
        useState<ProfessionalService | null>(null);
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const deactivateService = useDeactivateProfessionalService();
    const updateService = useUpdateProfessionalService();

    function openDialog(service: ProfessionalService, mode: DialogMode) {
        setSelectedService(service);
        setDialogMode(mode);
        setErrorMessage(null);
    }

    function closeDialog() {
        if (deactivateService.isPending || updateService.isPending) return;

        setSelectedService(null);
        setDialogMode(null);
        setErrorMessage(null);
    }

    async function handleDeactivate() {
        if (!selectedService) return;

        setErrorMessage(null);

        try {
            await deactivateService.mutateAsync(selectedService.service_id);
            setSelectedService(null);
            setDialogMode(null);
        } catch (error: unknown) {
            setErrorMessage(getErrorMessage(error, "deactivate"));
        }
    }

    async function handleUpdateService(values: ProfessionalServiceFormValues) {
        if (!selectedService) return;

        setErrorMessage(null);

        try {
            const { categoryId, ...serviceValues } = values;

            await updateService.mutateAsync({
                serviceId: selectedService.service_id,
                input: {
                    ...serviceValues,
                    description: values.description.trim() || null,
                    ...(categoryId !== (selectedService.category_id ?? "")
                        ? { categoryId }
                        : {}),
                },
            });

            setSelectedService(null);
            setDialogMode(null);
        } catch (error: unknown) {
            setErrorMessage(getErrorMessage(error, "update"));
        }
    }

    if (isLoading) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
                <span className="sr-only">Loading your services...</span>

                {Array.from({ length: 3 }, (_, index) => (
                    <div
                        key={index}
                        aria-hidden="true"
                        className="h-48 animate-pulse rounded-xl border border-border bg-muted/40 motion-reduce:animate-none"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <motion.div
                role="alert"
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 p-6"
            >
                <p className="font-medium">Couldn&apos;t load your services.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Please refresh the page and try again.
                </p>
            </motion.div>
        );
    }

    if (services.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                className="relative isolate mt-10 overflow-hidden rounded-3xl bg-secondary px-6 py-14 sm:px-12 sm:py-16"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10"
                >
                    <span className="absolute bottom-0 right-0 size-28 rounded-tl-full bg-primary/15 sm:size-40" />
                    <span className="absolute bottom-0 right-24 hidden h-40 w-24 rounded-t-full bg-primary/10 sm:block lg:right-40 lg:h-52 lg:w-32" />
                    <span className="absolute right-8 top-8 hidden size-16 rounded-full bg-primary/20 sm:block" />
                </div>

                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    No services yet
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                    Add your first service to let customers discover what you
                    offer and book an appointment.
                </p>
            </motion.div>
        );
    }

    const grid: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
    };

    const card: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 16 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.6, ease: EASE },
        },
        exit: {
            opacity: 0,
            scale: reduce ? 1 : 0.95,
            transition: { duration: reduce ? 0 : 0.25, ease: EASE },
        },
    };

    const initialValues: ProfessionalServiceFormValues | undefined =
        selectedService
            ? {
                  categoryId: selectedService.category_id ?? "",
                  name: selectedService.name,
                  description: selectedService.description ?? "",
                  durationMinutes: selectedService.duration_minutes,
                  price: Number(selectedService.price),
              }
            : undefined;

    return (
        <>
            <motion.div
                className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={grid}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence mode="popLayout">
                    {services.map((service) => (
                        <motion.article
                            key={service.service_id}
                            layout
                            variants={card}
                            exit="exit"
                            whileHover={reduce ? undefined : { y: -3 }}
                            transition={{
                                layout: {
                                    duration: reduce ? 0 : 0.4,
                                    ease: EASE,
                                },
                            }}
                            className="group relative isolate overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors duration-300 hover:border-foreground/25 motion-reduce:transition-none"
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute bottom-0 right-0 -z-10 size-14 origin-bottom-right rounded-tl-full bg-primary/10 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.7] motion-reduce:transition-none"
                            />

                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    {service.category_name && (
                                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                            {service.category_name}
                                        </p>
                                    )}

                                    <h2 className="font-semibold">{service.name}</h2>
                                </div>

                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                    <span
                                        aria-hidden="true"
                                        className="size-1.5 rounded-full bg-primary"
                                    />
                                    Active
                                </span>
                            </div>

                            <p className="mt-3 min-h-10 text-sm leading-relaxed text-muted-foreground">
                                {service.description ||
                                    "No description provided."}
                            </p>

                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                                <span className="flex items-center gap-2.5 text-muted-foreground">
                                    <DurationRing
                                        minutes={service.duration_minutes}
                                    />
                                    {service.duration_minutes} minutes
                                </span>

                                <span className="font-semibold tabular-nums">
                                    {Number(service.price).toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )}
                                </span>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        openDialog(service, "edit")
                                    }
                                >
                                    <Pencil size={15} aria-hidden="true" />
                                    Edit
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        openDialog(service, "deactivate")
                                    }
                                >
                                    <Trash2 size={15} aria-hidden="true" />
                                    Deactivate
                                </Button>
                            </div>
                        </motion.article>
                    ))}
                </AnimatePresence>
            </motion.div>

            <Dialog
                open={dialogMode !== null}
                onOpenChange={(open) => {
                    if (!open) closeDialog();
                }}
            >
                <DialogContent
                    className={
                        dialogMode === "edit"
                            ? "max-h-[90vh] max-w-xl overflow-y-auto"
                            : undefined
                    }
                >
                    {dialogMode === "edit" && selectedService && initialValues && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit service</DialogTitle>
                                <DialogDescription>
                                    Update the details customers see when they
                                    discover and book this service.
                                </DialogDescription>
                            </DialogHeader>

                            <ProfessionalServiceForm
                                key={selectedService.service_id}
                                initialValues={initialValues}
                                currentCategory={
                                    selectedService.category_id
                                        ? {
                                            id: selectedService.category_id,
                                            name:
                                                selectedService.category_name ??
                                                "Current category",
                                        }
                                        : undefined
                                }
                                onSubmit={handleUpdateService}
                                submitLabel="Save changes"
                                errorMessage={errorMessage}
                            />
                        </>
                    )}

                    {dialogMode === "deactivate" && selectedService && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Deactivate service?</DialogTitle>
                                <DialogDescription>
                                    Customers will no longer be able to book{" "}
                                    <strong>{selectedService.name}</strong>. The
                                    service record will be retained.
                                </DialogDescription>
                            </DialogHeader>

                            <AnimatePresence initial={false}>
                                {errorMessage && (
                                    <motion.p
                                        key="deactivate-error"
                                        role="alert"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{
                                            duration: reduce ? 0 : 0.25,
                                            ease: EASE,
                                        }}
                                        className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                                    >
                                        {errorMessage}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={deactivateService.isPending}
                                    onClick={closeDialog}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={deactivateService.isPending}
                                    onClick={handleDeactivate}
                                >
                                    <AnimatePresence
                                        mode="wait"
                                        initial={false}
                                    >
                                        <motion.span
                                            key={
                                                deactivateService.isPending
                                                    ? "pending"
                                                    : "idle"
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: reduce ? 0 : 6,
                                            }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                y: reduce ? 0 : -6,
                                            }}
                                            transition={{
                                                duration: reduce ? 0 : 0.18,
                                            }}
                                            className="block"
                                        >
                                            {deactivateService.isPending
                                                ? "Deactivating..."
                                                : "Confirm deactivation"}
                                        </motion.span>
                                    </AnimatePresence>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
