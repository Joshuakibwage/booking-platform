"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Plus } from "lucide-react";

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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const createService = useCreateProfessionalService();
    const servicesQuery = useProfessionalServices();

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

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Your services
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Create and manage the services you offer to customers.
                    </p>
                </div>

                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus size={16} aria-hidden="true" />
                    Add service
                </Button>
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