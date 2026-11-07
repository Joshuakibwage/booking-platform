import type { ComponentProps } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CtaLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  /** Plain text only: the label is rendered twice for the roll effect. */
  children: string;
  variant?: "solid" | "outline";
  /** `default` sits on the page background. `inverted` sits on a `bg-primary` surface. */
  tone?: "default" | "inverted";
  /** Adds an arrow that nudges diagonally on hover. */
  arrow?: boolean;
};

const styles = {
  default: {
    base: "focus-visible:ring-ring focus-visible:ring-offset-background",
    solid: "bg-primary text-primary-foreground",
    outline:
      "border border-foreground/20 text-foreground transition-colors hover:border-foreground",
  },
  inverted: {
    base: "focus-visible:ring-primary-foreground focus-visible:ring-offset-primary",
    solid: "bg-primary-foreground text-primary",
    outline:
      "border border-primary-foreground/30 text-primary-foreground transition-colors hover:border-primary-foreground",
  },
} as const;

/**
 * A link styled as a button whose label rolls up on hover and keyboard focus.
 * Renders a real anchor, so navigation, prefetching and "open in new tab" all work.
 * Transform-only animation (no layout cost); disabled for reduced motion.
 */
export function CtaLink({
  children,
  variant = "solid",
  tone = "default",
  arrow = false,
  className,
  ...props
}: CtaLinkProps) {
  const roll =
    "transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none";

  return (
    <Link
      {...props}
      className={cn(
        "group inline-flex h-12 items-center justify-center rounded-full px-7 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        styles[tone].base,
        styles[tone][variant],
        className
      )}
    >
      <span className="relative block overflow-hidden">
        <span className={cn("block", roll)}>{children}</span>
        <span
          aria-hidden="true"
          className={cn("absolute left-0 top-full block", roll)}
        >
          {children}
        </span>
      </span>

      {arrow && (
        <ArrowUpRight
          aria-hidden="true"
          className="ml-2 size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      )}
    </Link>
  );
}