import { Suspense } from "react";

import { ProfessionalProfile } from "@/components/marketing/professionals/professional-profile";

type ProfessionalPageProps = {
    params: Promise<{
        professionalId: string;
    }>;
};

async function ProfessionalPageContent({
    params,
}: ProfessionalPageProps) {
    const { professionalId } = await params;

    return <ProfessionalProfile professionalId={professionalId} />;
}

export default function ProfessionalPage({
    params,
}: ProfessionalPageProps) {
    return (
        <Suspense
            fallback={
                <div className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="h-8 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="mt-12 h-10 w-64 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
            }
        >
            <ProfessionalPageContent params={params} />
        </Suspense>
    );
}