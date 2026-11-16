import { ABOUT_CONTENT } from "@/constants/about";
import { Reveal } from "@/components/shared/reveal";

export function AboutStory() {
    const { heading, paragraphs } = ABOUT_CONTENT.story;

    return (
        <section
            aria-labelledby="story-heading"
            className="border-t border-border"
        >
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:px-8">
                <Reveal className="lg:col-span-5">
                    <h2
                        id="story-heading"
                        className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                    >
                        {heading}
                    </h2>
                </Reveal>

                <div className="space-y-6 lg:col-span-7">
                    {paragraphs.map((paragraph, index) => (
                        <Reveal key={paragraph} delay={0.08 * (index + 1)}>
                            <p
                                className={
                                    index === 0
                                        ? "text-xl leading-8 sm:text-2xl sm:leading-9"
                                        : "text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
                                }
                            >
                                {paragraph}
                            </p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}