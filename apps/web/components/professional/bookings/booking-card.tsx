
import { MoreHorizontal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BookingStatusIndicator } from "./booking-status";

import {
    formatBookingDate,
    formatBookingDay,
    formatBookingMonth,
    formatBookingPrice,
    formatBookingTime,
} from "@/lib/utils/booking-formatters";

import type { BookingListItem } from "@/lib/api/booking.api";

type BookingCardProps = {
    booking: BookingListItem;
    onViewDetails: (booking: BookingListItem) => void;
    onCancel: (booking: BookingListItem) => void;
};

export function BookingCard({
    booking,
    onViewDetails,
    onCancel,
}: BookingCardProps) {
    const timeZone = booking.professional_time_zone;

    return (
        <Card className="h-full gap-0 py-0 transition-colors duration-300 hover:border-foreground/25">
            <CardContent className="flex h-full flex-col p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                        {/* Appointment date */}
                        <div
                            aria-hidden="true"
                            className={`grid h-16 w-14 shrink-0 place-items-center rounded-t-full rounded-b-lg text-center leading-none ${
                                booking.status === "confirmed"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            <span className="mt-2 block">
                                <span className="block text-[10px] font-medium uppercase">
                                    {formatBookingMonth(
                                        booking.start_time,
                                        timeZone,
                                    )}
                                </span>

                                <span className="mt-0.5 block text-xl font-semibold tabular-nums">
                                    {formatBookingDay(
                                        booking.start_time,
                                        timeZone,
                                    )}
                                </span>
                            </span>
                        </div>

                        {/* Booking information */}
                        <div className="min-w-0 pt-1">
                            <h3 className="font-semibold tracking-tight">
                                {booking.service_name}
                            </h3>

                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                Customer: {booking.customer_display_name}
                            </p>

                            <div className="mt-2">
                                <BookingStatusIndicator
                                    status={booking.status}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            aria-label={`Actions for ${booking.service_name}`}
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                            <MoreHorizontal className="size-5" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onViewDetails(booking)}
                            >
                                View details
                            </DropdownMenuItem>

                            {booking.status === "confirmed" && (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onCancel(booking)}
                                >
                                    Cancel booking
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Appointment date, time and price */}
                <div className="mt-auto flex items-end justify-between gap-4 pt-10">
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                            {formatBookingDate(
                                booking.start_time,
                                timeZone,
                            )}
                        </p>

                        <p>
                            {formatBookingTime(
                                booking.start_time,
                                timeZone,
                            )}
                            {" – "}
                            {formatBookingTime(
                                booking.end_time,
                                timeZone,
                            )}
                            {" · "}
                            {booking.service_duration_minutes} min
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">
                            Price
                        </p>

                        <p className="mt-0.5 text-lg font-semibold tabular-nums">
                            {formatBookingPrice(booking.service_price)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
