
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { BookingStatusIndicator } from "./booking-status";

import {
    formatBookingDate,
    formatBookingPrice,
    formatBookingTime,
} from "@/lib/utils/booking-formatters";

import type { BookingListItem } from "@/lib/api/booking.api";

type BookingDetailsDialogProps = {
    booking: BookingListItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel: (booking: BookingListItem) => void;
};

export function BookingDetailsDialog({
    booking,
    open,
    onOpenChange,
    onCancel,
}: BookingDetailsDialogProps) {
    const timeZone = booking?.professional_time_zone;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Booking details</DialogTitle>

                    <DialogDescription>
                        Review the appointment information below.
                    </DialogDescription>
                </DialogHeader>

                {booking && timeZone && (
                    <div className="space-y-4 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Service
                            </p>
                            <p className="font-medium">
                                {booking.service_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Customer
                            </p>
                            <p className="font-medium">
                                {booking.customer_display_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Appointment
                            </p>
                            <p className="font-medium">
                                {formatBookingDate(
                                    booking.start_time,
                                    timeZone,
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground">
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
                            <p className="mt-1 text-xs text-muted-foreground">
                                Timezone: {timeZone}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Price
                            </p>
                            <p className="font-medium tabular-nums">
                                {formatBookingPrice(
                                    booking.service_price,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Status
                            </p>
                            <BookingStatusIndicator
                                status={booking.status}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>

                    {booking?.status === "confirmed" && (
                        <Button
                            variant="destructive"
                            onClick={() => onCancel(booking)}
                        >
                            Cancel booking
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
