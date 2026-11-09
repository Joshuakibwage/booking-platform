"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ProfessionalServiceForm } from "@/components/professional/services/professional-service-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateProfessionalService } from "@/hooks/professional/use-create-professional-service";
import type { ProfessionalServiceFormValues } from "@/schemas/professional/professional-service.schema";

import { ProfessionalServiceList } from "@/components/professional/services/professional-service-list";
import { useProfessionalServices } from "@/hooks/professional/use-professional-services";

const EASE = [0.22, 1, 0.36, 1] as const;

function getErrorMessage(error: unknown): string {
    if (isAxiosError<{ message?: unknown }>(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    return "We couldn't create your service. Please try again.";
}

export function ProfessionalServicesManager() {
    const reduce = useReducedMotion();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const createService = useCreateProfessionalService();
    const servicesQuery = useProfessionalServices();

    const serviceCount = servicesQuery.data?.length ?? 0;

    function handleDialogChange(open: boolean) {
        setIsCreateDialogOpen(open);

        if (!open) {
            setErrorMessage(null);
        }
    }

    async function handleCreateService(values: ProfessionalServiceFormValues) {
        setErrorMessage(null);

        try {
            await createService.mutateAsync({
                ...values,
                description: values.description.trim() || null,
            });

            setIsCreateDialogOpen(false);
        } catch (error: unknown) {
            setErrorMessage(getErrorMessage(error));
        }
    }

    // Header copy and button rise in together, a beat apart.
    const rise = (delay: number) => ({
        initial: { opacity: 0, y: reduce ? 0 : 14 },
        animate: { opacity: 1, y: 0 },
        transition: {
            duration: reduce ? 0 : 0.6,
            ease: EASE,
            delay: reduce ? 0 : delay,
        },
    });

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <motion.div {...rise(0)}>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Your services
                        </h1>

                        {/* Count fades in once services have loaded */}
                        <AnimatePresence initial={false}>
                            {serviceCount > 0 && (
                                <motion.span
                                    key="count"
                                    initial={{
                                        opacity: 0,
                                        scale: reduce ? 1 : 0.8,
                                    }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{
                                        opacity: 0,
                                        scale: reduce ? 1 : 0.8,
                                    }}
                                    transition={{
                                        duration: reduce ? 0 : 0.3,
                                        ease: EASE,
                                    }}
                                    className="rounded-full bg-muted px-2.5 py-1 text-sm font-medium tabular-nums"
                                    aria-label={`${serviceCount} ${
                                        serviceCount === 1
                                            ? "service"
                                            : "services"
                                    }`}
                                >
                                    {serviceCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="mt-2 text-muted-foreground">
                        Create and manage the services you offer to customers.
                    </p>
                </motion.div>

                <motion.div {...rise(0.1)}>
                    <Button
                        className="group"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus
                            size={16}
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none"
                        />
                        Add service
                    </Button>
                </motion.div>
            </div>

            <ProfessionalServiceList
                services={servicesQuery.data ?? []}
                isLoading={servicesQuery.isLoading}
                isError={servicesQuery.isError}
            />

            <Dialog
                open={isCreateDialogOpen}
                onOpenChange={handleDialogChange}
            >
                <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Create a service
                        </DialogTitle>

                        <DialogDescription>
                            Add the details of a service you want customers to
                            be able to book.
                        </DialogDescription>
                    </DialogHeader>

                    <ProfessionalServiceForm
                        onSubmit={handleCreateService}
                        submitLabel="Create service"
                        errorMessage={errorMessage}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}