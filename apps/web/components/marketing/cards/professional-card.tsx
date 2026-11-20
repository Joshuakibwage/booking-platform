"use client";

import { useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "motion/react";

import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { ProfessionalImagePlaceholder } from "@/components/marketing/cards/professional-image-placeholder";
import type { PublicProfessional } from "@/lib/api/public-discovery.api";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 200, damping: 26, mass: 0.6 };

type ProfessionalCardProps = {
    professional: PublicProfessional;
};

export function ProfessionalCard({
    professional,
}: ProfessionalCardProps) {
    const reduce = useReducedMotion();

    const [imageError, setImageError] = useState(false);
    const [hovered, setHovered] = useState(false);

    // The photo drifts gently against the pointer. Mouse only, transform only.
    const nx = useSpring(useMotionValue(0), SPRING);
    const ny = useSpring(useMotionValue(0), SPRING);
    const imgX = useTransform(nx, [-0.5, 0.5], [8, -8]);
    const imgY = useTransform(ny, [-0.5, 0.5], [8, -8]);

    function onPointerMove(event: PointerEvent<HTMLDivElement>) {
        if (reduce || event.pointerType !== "mouse") return;

        const rect = event.currentTarget.getBoundingClientRect();
        nx.set((event.clientX - rect.left) / rect.width - 0.5);
        ny.set((event.clientY - rect.top) / rect.height - 0.5);
    }

    const showImage = professional.image_url && !imageError;

    return (
        <Link
            href={`/professionals/${professional.profile_id}`}
            className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
            <Card className="h-full flex-row gap-0 py-2.5 transition-colors duration-300 group-hover:border-foreground/25 motion-reduce:transition-none sm:flex-col">
                {/* Arch frame, same shape language as the rest of the site.
                    Mobile: small photo beside the text. sm and up: photo on top. */}
                <div
                    onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") setHovered(true);
                    }}
                    onPointerMove={onPointerMove}
                    onPointerLeave={() => {
                        setHovered(false);
                        nx.set(0);
                        ny.set(0);
                    }}
                    className="relative mx-2.5 aspect-[4/5] w-24 shrink-0 self-start overflow-hidden rounded-b-lg rounded-t-full bg-muted sm:aspect-[16/9] sm:w-auto sm:self-auto"
                >
                    {showImage ? (
                        <motion.div
                            className="absolute inset-0"
                            style={{ x: imgX, y: imgY }}
                            animate={{
                                scale: hovered && !reduce ? 1.14 : 1.08,
                            }}
                            transition={{
                                duration: reduce ? 0 : 0.8,
                                ease: EASE,
                            }}
                        >
                            <Image
                                src={professional.image_url!}
                                alt={`${professional.public_name} profile`}
                                fill
                                sizes="(max-width: 639px) 96px, (max-width: 1023px) 50vw, 25vw"
                                className="object-cover"
                                onError={() => setImageError(true)}
                            />
                        </motion.div>
                    ) : (
                        <ProfessionalImagePlaceholder />
                    )}
                </div>

                <CardContent className="flex min-w-0 flex-1 flex-col px-2 py-1 sm:px-4 sm:pb-1 sm:pt-4">
                    <CardTitle className="text-sm font-semibold tracking-tight">
                        {professional.public_name}
                    </CardTitle>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {professional.service_count}{" "}
                        {professional.service_count === 1
                            ? "service"
                            : "services"}
                    </p>

                    {professional.bio && (
                        <CardDescription className="mt-2 line-clamp-2 text-xs leading-5">
                            {professional.bio}
                        </CardDescription>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4">
                        <span className="text-xs font-medium">
                            View profile
                        </span>

                        <span
                            aria-hidden="true"
                            className="grid size-7 place-items-center rounded-full border transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none"
                        >
                            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}