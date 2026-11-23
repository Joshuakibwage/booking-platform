
import Link from "next/link";

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PublicService } from "@/lib/api/public-discovery.api";

type PublicServiceCardProps = {
    service: PublicService;
};

export function PublicServiceCard({ service }: PublicServiceCardProps) {
    const formattedPrice = Number(service.price).toLocaleString();

    return (
        <Card className="flex h-full flex-col transition-colors duration-300 hover:border-foreground/25 motion-reduce:transition-none">
            <CardHeader>
                {service.category_name && (
                    <p className="text-xs font-medium text-muted-foreground">
                        {service.category_name}
                    </p>
                )}

                <CardTitle className="text-lg">{service.name}</CardTitle>

                {service.description && (
                    <CardDescription className="line-clamp-3">
                        {service.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardFooter className="mt-auto flex-col items-stretch gap-4 border-t">
                <p className="text-sm text-muted-foreground">
                    By {service.professional_name}
                </p>

                <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold tabular-nums">
                        {formattedPrice}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {service.duration_minutes} min
                    </p>
                </div>

                <Button
                    nativeButton={false}
                    className="w-full"
                    render={<Link href={`/book/${service.service_id}`} />}
                >
                    Book now
                </Button>
            </CardFooter>
        </Card>
    );
}
