import { cn } from "@/lib/utils";

type StepCardProps = {
  number: string;
  title: string;
  description: string;
  className?: string;
};

export function StepCard({
  number,
  title,
  description,
  className,
}: StepCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-colors duration-300 hover:border-foreground/25 motion-reduce:transition-none sm:p-8",
        className
      )}
    >
      {/* Quarter-circle accent: same shape language as the hero. Grows on hover. */}
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 size-20 origin-top-right rounded-bl-full bg-primary/10 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.6] motion-reduce:transition-none"
      />

      <span className="relative text-6xl font-semibold leading-none tracking-tighter tabular-nums text-foreground/15 transition-colors duration-300 group-hover:text-primary motion-reduce:transition-none sm:text-7xl">
        {number}
      </span>

      <h3 className="relative mt-12 text-xl font-medium tracking-tight sm:text-2xl">
        {title}
      </h3>

      <p className="relative mt-3 max-w-sm text-sm leading-7 text-muted-foreground sm:text-base">
        {description}
      </p>

      {/* Underline that draws in from the left on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 motion-reduce:transition-none"
      />
    </article>
  );
}