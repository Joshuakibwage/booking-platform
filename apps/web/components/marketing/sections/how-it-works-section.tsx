import { howItWorksSteps } from "@/constants/marketing";
import { StepCard } from "@/components/marketing/cards/step-card";

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
            Simple by design
          </p>

          <h2
            id="how-it-works-heading"
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            A simpler way to find the right people.
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Finding a professional shouldn&apos;t feel complicated. Start with what
            you need and take it from there.
          </p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {howItWorksSteps.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}