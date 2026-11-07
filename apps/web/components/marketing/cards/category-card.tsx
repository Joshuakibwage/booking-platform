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

import { cn } from "@/lib/utils";

type CategoryCardProps = {
  title: string;
  description: string;
  image: string;
  href: string;
  /** Position in the grid. Drives the number label and the frame shape. */
  index?: number;
  className?: string;
};

// The frame shape cycles through the same shape language as the hero: arch, soft rectangle, cut corner.
const shapes = [
  "rounded-t-full rounded-b-3xl",
  "rounded-3xl",
  "rounded-3xl rounded-tr-[6rem]",
];

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 260, damping: 28, mass: 0.6 };
const BADGE = 88; // px, keep in sync with size-[5.5rem]

export function CategoryCard({
  title,
  description,
  image,
  href,
  index = 0,
  className,
}: CategoryCardProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // Pointer position, smoothed by springs. All output is transform-only.
  const bx = useSpring(useMotionValue(0), SPRING);
  const by = useSpring(useMotionValue(0), SPRING);
  const nx = useSpring(useMotionValue(0), SPRING);
  const ny = useSpring(useMotionValue(0), SPRING);

  // The photo drifts gently against the pointer.
  const imgX = useTransform(nx, [-0.5, 0.5], [12, -12]);
  const imgY = useTransform(ny, [-0.5, 0.5], [12, -12]);

  function track(e: PointerEvent<HTMLDivElement>, jump = false) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    if (jump) {
      // On entry, snap the badge to the cursor so it doesn't fly in from the corner.
      bx.jump(px - BADGE / 2);
      by.jump(py - BADGE / 2);
    } else {
      bx.set(px - BADGE / 2);
      by.set(py - BADGE / 2);
    }
    nx.set(px / r.width - 0.5);
    ny.set(py / r.height - 0.5);
  }

  const showBadge = hovered && !reduce;

  return (
    <Link href={href} className={cn("group block focus-visible:outline-none", className)}>
      <div
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          track(e, true);
          setHovered(true);
        }}
        onPointerMove={(e) => track(e)}
        onPointerLeave={() => {
          setHovered(false);
          nx.set(0);
          ny.set(0);
        }}
        className={cn(
          "relative isolate aspect-[4/5] overflow-hidden bg-muted ring-ring ring-offset-2 ring-offset-background group-focus-visible:ring-2",
          shapes[index % shapes.length]
        )}
      >
        <motion.div
          className="absolute inset-0"
          style={{ x: imgX, y: imgY }}
          animate={{ scale: hovered && !reduce ? 1.16 : 1.1 }}
          transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </motion.div>

        <span
          aria-hidden="true"
          className="absolute bottom-4 left-4 rounded-full bg-background px-3 py-1 text-xs font-medium tabular-nums"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Cursor-following badge. Mouse devices only. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 hidden size-[5.5rem] place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground [@media(hover:hover)]:grid"
          style={{ x: bx, y: by }}
          initial={false}
          animate={{ scale: showBadge ? 1 : 0, opacity: showBadge ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          Explore
        </motion.span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium tracking-tight">{title}</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none"
        >
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}