
import Link from "next/link";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { PublicProfessional } from "@/lib/api/public-discovery.api";

type ProfessionalCardProps = {
    professional: PublicProfessional;
};

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export function ProfessionalCard({
    professional,
}: ProfessionalCardProps) {
    return (
        <Link
            href={`/professionals/${professional.profile_id}`}
            className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
            <Card className="h-full transition-colors duration-300 group-hover:border-foreground/25 motion-reduce:transition-none">
                <CardHeader className="gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar size="lg">
                            {professional.image_url && (
                                <AvatarImage
                                    src={professional.image_url}
                                    alt={professional.public_name}
                                />
                            )}
                            <AvatarFallback>
                                {getInitials(professional.public_name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <CardTitle className="text-lg">
                                {professional.public_name}
                            </CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {professional.service_count}{" "}
                                {professional.service_count === 1
                                    ? "service"
                                    : "services"}
                            </p>
                        </div>
                    </div>

                    {professional.bio && (
                        <CardDescription className="line-clamp-3">
                            {professional.bio}
                        </CardDescription>
                    )}

                    <p className="text-sm font-medium text-foreground">
                        View profile
                        <span aria-hidden="true"> →</span>
                    </p>
                </CardHeader>
            </Card>
        </Link>
    );
}
