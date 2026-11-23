
import { Suspense } from "react";

import { BookingPageContent } from "@/components/booking/booking-page-content";

type BookingPageProps = {
    params: Promise<{
        serviceId: string;
    }>;
};

export default function BookingPage({ params }: BookingPageProps) {
    return (
        <Suspense
            fallback={
                <section
                    role="status"
                    aria-label="Loading booking page"
                    className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
                >
                    <div className="h-5 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="mt-12 h-10 w-72 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="mt-5 h-24 max-w-2xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </section>
            }
        >
            <ResolvedBookingPage params={params} />
        </Suspense>
    );
}

async function ResolvedBookingPage({
    params,
}: BookingPageProps) {
    const { serviceId } = await params;

    return <BookingPageContent serviceId={serviceId} />;
}
