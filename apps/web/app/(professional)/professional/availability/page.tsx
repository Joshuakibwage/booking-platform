
import { WeeklyAvailabilityManager } from "@/components/professional/availability/weekly-availability-manager";
import { AvailabilityExceptionsManager } from "@/components/professional/availability/availability-exceptions-manager";

export default function ProfessionalAvailabilityPage() {
    return (
        <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Your availability
                </h1>

                <p className="max-w-2xl text-muted-foreground">
                    Manage your regular working hours and make changes for
                    specific dates when your schedule differs.
                </p>
            </div>

            <section className="space-y-5">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                        Weekly hours
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Set the days and hours when customers can normally
                        book your services.
                    </p>
                </div>

                <WeeklyAvailabilityManager />
            </section>

            <AvailabilityExceptionsManager />
        </div>
    );
}
