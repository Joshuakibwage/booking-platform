import { ABOUT_CONTENT, ABOUT_VALUES } from "@/constants/about";
import { Reveal } from "@/components/shared/reveal";

export function AboutValues() {
    const { heading, description } = ABOUT_CONTENT.values;

    return (
        <section
            aria-labelledby="values-heading"
            className="border-t border-border"
        >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <Reveal className="max-w-2xl">
                    <h2
                        id="values-heading"
                        className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                    >
                        {heading}
                    </h2>

                    <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                        {description}
                    </p>
                </Reveal>

                <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {ABOUT_VALUES.map((value, index) => {
                        const Icon = value.icon;

                        return (
                            <li key={value.title}>
                                <Reveal delay={0.06 * index}>
                                    <div className="border-t border-border pt-6">
                                        {/* Clover mask tints the tile; the icon sits on top, unmasked */}
                                        <span
                                            aria-hidden="true"
                                            className="relative grid size-14 place-items-center"
                                        >
                                            <span className="shape-clover absolute inset-0 bg-primary/10" />
                                            <Icon className="relative size-5 text-primary" />
                                        </span>

                                        <h3 className="mt-6 text-lg font-medium tracking-tight">
                                            {value.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {value.description}
                                        </p>
                                    </div>
                                </Reveal>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}