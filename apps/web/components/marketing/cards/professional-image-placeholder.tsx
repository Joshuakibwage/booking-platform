import { cn } from "@/lib/utils";

type ProfessionalImagePlaceholderProps = {
    className?: string;
};

/**
 * Stand-in for a professional's photo: a simple head-and-shoulders figure.
 * Inline SVG using `currentColor`, so it follows the theme (light and dark)
 * and needs no image file.
 *
 * The viewBox is wider and taller than the figure, so the figure sits small
 * with room around it. `meet` keeps the whole figure visible in any frame
 * shape, and `YMax` anchors the shoulders to the bottom edge.
 * To change the figure's size, change the viewBox: a larger width and height
 * makes it smaller, a smaller one makes it larger.
 */
export function ProfessionalImagePlaceholder({
    className,
}: ProfessionalImagePlaceholderProps) {
    return (
        <svg
            viewBox="-30 -20 160 145"
            preserveAspectRatio="xMidYMax meet"
            aria-hidden="true"
            className={cn("size-full text-muted-foreground/25", className)}
        >
            <circle cx="50" cy="50" r="17" fill="currentColor" />
            <path
                d="M16 125 C16 94 32 80 50 80 C68 80 84 94 84 125 Z"
                fill="currentColor"
            />
        </svg>
    );
}