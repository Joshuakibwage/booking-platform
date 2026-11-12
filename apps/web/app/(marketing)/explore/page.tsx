import { Suspense } from "react";

import { ExploreServices } from "@/components/marketing/explore/explore-services";

export default function ExplorePage() {
    return (
        <Suspense
            fallback={
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="h-10 w-64 animate-pulse rounded bg-muted" />
                    <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
                    <div className="mt-10 h-10 w-full animate-pulse rounded bg-muted" />
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-56 animate-pulse rounded-xl bg-muted"
                            />
                        ))}
                    </div>
                </section>
            }
        >
            <ExploreServices />
        </Suspense>
    );
}