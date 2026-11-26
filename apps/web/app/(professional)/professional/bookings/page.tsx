import { ProfessionalBookings } from "@/components/professional/bookings/professional-bookings";

export default function ProfessionalBookingsPage() {
    return (
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Bookings
                </h1>

                <p className="text-muted-foreground">
                    View and manage appointments customers have made with you.
                </p>
            </div>

            <ProfessionalBookings />
        </main>
    );
}