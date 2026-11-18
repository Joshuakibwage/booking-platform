"use client";

import Link from "next/link";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PublicServiceCard } from "@/components/marketing/cards/public-service-card";

import { usePublicProfessionalProfile } from "@/hooks/public/use-public-professional-profile";
import { usePublicServices } from "@/hooks/public/use-public-services";

type ProfessionalProfileProps = {
    professionalId: string;
};

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export function ProfessionalProfile({
    professionalId,
}: ProfessionalProfileProps) {
    const {
        data: professional,
        isLoading,
        isError,
        refetch,
    } = usePublicProfessionalProfile(professionalId);

    const {
        data: services,
        isLoading: isServicesLoading,
        isError: isServicesError,
        refetch: refetchServices,
    } = usePublicServices({ professionalId });

    if (isLoading) {
        return (
            <section
                role="status"
                aria-label="Loading professional profile"
                className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
            >
                <div className="h-5 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="mt-12 h-10 w-64 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="mt-5 h-20 max-w-2xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </section>
        );
    }

    if (isError || !professional) {
        return (
            <section className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <p className="text-muted-foreground">
                    We couldn&apos;t load this professional&apos;s profile.
                </p>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => void refetch()}
                    className="mt-4"
                >
                    Try again
                </Button>

                <div className="mt-6">
                    <Link
                        href="/professionals"
                        className="mt-6 inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Browse professionals
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="/" />}>
                            Home
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="/professionals" />}>
                            Professionals
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            {professional.public_name}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <section className="mt-16 max-w-3xl">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <Avatar size="lg" className="size-20">
                        {professional.image_url && (
                            <AvatarImage
                                src={professional.image_url}
                                alt={professional.public_name}
                            />
                        )}

                        <AvatarFallback>
                            {getInitials(professional.public_name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {professional.public_name}
                        </h1>

                        {professional.bio && (
                            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
                                {professional.bio}
                            </p>
                        )}

                        <p className="mt-5 text-sm text-muted-foreground">
                            Time zone: {professional.time_zone}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-20 border-t border-border pt-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Services offered
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                        Explore the services offered by {professional.public_name}.
                    </p>
                </div>

                {isServicesLoading && (
                    <div
                        role="status"
                        aria-label="Loading services"
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-56 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                            />
                        ))}
                    </div>
                )}

                {isServicesError && (
                    <div>
                        <p className="text-sm text-muted-foreground">
                            We couldn&apos;t load the services.
                        </p>

                        <Button
                            variant="outline"
                            onClick={() => void refetchServices()}
                            className="mt-4"
                        >
                            Try again
                        </Button>
                    </div>
                )}

                {!isServicesLoading &&
                    !isServicesError &&
                    services?.length === 0 && (
                        <p className="text-muted-foreground">
                            No services are currently listed.
                        </p>
                    )}

                {!isServicesLoading &&
                    !isServicesError &&
                    services &&
                    services.length > 0 && (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <PublicServiceCard
                                    key={service.service_id}
                                    service={service}
                                />
                            ))}
                        </div>
                    )}
            </section>
        </main>
    );
}