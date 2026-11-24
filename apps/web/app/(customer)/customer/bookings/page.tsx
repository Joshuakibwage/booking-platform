import { CustomerBookings } from "@/components/customer/customer-bookings";

export default function BookingsPage() {
    return (
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    My bookings
                </h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                    Keep track of your service bookings and their status.
                </p>
            </div>

            <CustomerBookings />
        </main>
    );
}