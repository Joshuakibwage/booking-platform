
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { BookingListItem } from "@/lib/api/booking.api";

type CancelBookingDialogProps = {
    booking: BookingListItem | null;
    open: boolean;
    isPending: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function CancelBookingDialog({
    booking,
    open,
    isPending,
    onOpenChange,
    onConfirm,
}: CancelBookingDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen && isPending) return;
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel this booking?</DialogTitle>

                    <DialogDescription>
                        Are you sure you want to cancel the booking for{" "}
                        <strong>{booking?.service_name}</strong> with{" "}
                        <strong>
                            {booking?.customer_display_name}
                        </strong>
                        ? This action will change its status to cancelled.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Keep booking
                    </Button>

                    <Button
                        variant="destructive"
                        disabled={isPending || !booking}
                        onClick={onConfirm}
                    >
                        {isPending
                            ? "Cancelling..."
                            : "Yes, cancel booking"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
