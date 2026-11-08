import type { ProfessionalService } from "@/lib/api/professional-services.api";

type ProfessionalServiceListProps = {
    services: ProfessionalService[];
    isLoading: boolean;
    isError: boolean;
};

export function ProfessionalServiceList({
    services,
    isLoading,
    isError,
}: ProfessionalServiceListProps) {
    if (isLoading) {
        return (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                    <div
                        key={index}
                        className="h-48 animate-pulse rounded-xl border border-border bg-muted/40"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div
                role="alert"
                className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 p-6"
            >
                <p className="font-medium">Couldn&apos;t load your services.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Please refresh the page and try again.
                </p>
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="mt-10 rounded-xl border border-dashed border-border px-6 py-16 text-center">
                <h2 className="text-lg font-semibold">
                    No services yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Add your first service to let customers discover what you
                    offer and book an appointment.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
                <article
                    key={service.service_id}
                    className="rounded-xl border border-border bg-card p-5"
                >
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="font-semibold">{service.name}</h2>

                        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            Active
                        </span>
                    </div>

                    <p className="mt-3 min-h-10 text-sm leading-relaxed text-muted-foreground">
                        {service.description || "No description provided."}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">
                            {service.duration_minutes} minutes
                        </span>

                        <span className="font-semibold tabular-nums">
                            {Number(service.price).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </article>
            ))}
        </div>
    );
}