
import { Suspense } from "react";

import { ExploreProfessionals } from "@/components/marketing/professionals/explore-professionals";

export default function ProfessionalsPage() {
    return (
        <Suspense
            fallback={
                <section className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="h-10 w-64 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="mt-10 h-10 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-48 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
                            />
                        ))}
                    </div>
                </section>
            }
        >
            <ExploreProfessionals />
        </Suspense>
    );
}
