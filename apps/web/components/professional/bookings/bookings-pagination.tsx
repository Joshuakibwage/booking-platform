
import { Button } from "@/components/ui/button";

type BookingsPaginationProps = {
    page: number;
    totalPages: number;
    isFetching: boolean;
    onPageChange: (page: number) => void;
};

export function BookingsPagination({
    page,
    totalPages,
    isFetching,
    onPageChange,
}: BookingsPaginationProps) {
    return (
        <div className="flex items-center justify-between border-t pt-6">
            <p className="text-sm tabular-nums text-muted-foreground">
                Page {page} of {Math.max(totalPages, 1)}
            </p>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
