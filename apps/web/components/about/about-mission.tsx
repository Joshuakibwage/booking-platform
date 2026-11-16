import { ABOUT_CONTENT } from "@/constants/about";
import { Reveal } from "@/components/shared/reveal";

export function AboutMission() {
    const { heading, description } = ABOUT_CONTENT.mission;

    return (
        <section
            aria-labelledby="mission-heading"
            className="border-t border-border"
        >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <Reveal>
                    <div className="relative isolate overflow-hidden rounded-3xl rounded-tr-[6rem] bg-secondary p-8 sm:p-14 lg:p-20">
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-0 right-0 -z-10 size-32 rounded-tl-full bg-primary/15 sm:size-48"
                        />

                        <h2
                            id="mission-heading"
                            className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
                        >
                            {heading}
                        </h2>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                            {description}
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}