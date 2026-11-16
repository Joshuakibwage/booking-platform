import Image from "next/image";

import { ABOUT_CONTENT } from "@/constants/about";

/**
 * Hero load-in runs from CSS keyframes, not JS, so the headline animates on
 * first paint without waiting for hydration. Reduced motion turns it off.
 */
const heroCss = `
@keyframes about-rise { from { transform: translateY(105%); } to { transform: none; } }
@keyframes about-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes about-settle { from { transform: scale(1.06); } to { transform: none; } }
.about-rise { animation: about-rise .9s cubic-bezier(.22,1,.36,1) both; }
.about-fade { animation: about-fade .7s cubic-bezier(.22,1,.36,1) both; }
.about-settle { animation: about-settle 1.4s cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) {
  .about-rise, .about-fade, .about-settle { animation: none; }
}
`;

export function AboutHero() {
    const { heading, description } = ABOUT_CONTENT.hero;

    return (
        <section aria-labelledby="about-heading">
            <style>{heroCss}</style>

            <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-20">
                <div className="lg:col-span-7">
                    <h1
                        id="about-heading"
                        className="text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
                    >
                        <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                            <span className="about-rise block">{heading}</span>
                        </span>
                    </h1>

                    <p
                        className="about-fade mt-8 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
                        style={{ animationDelay: "350ms" }}
                    >
                        {description}
                    </p>
                </div>

                {/* Image composition: arch + clover mask + quarter-circle, as on the home page */}
                <div className="lg:col-span-5">
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm sm:max-w-md lg:ml-auto lg:mr-0">
                        <div
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 aspect-square w-[40%] rounded-tr-full bg-primary"
                        />

                        <div className="absolute inset-x-[14%] bottom-[8%] top-0 overflow-hidden rounded-t-full bg-muted">
                            <Image
                                src="/assets/about-hero.jpg"
                                alt="An independent professional at work"
                                fill
                                priority
                                sizes="(min-width: 1024px) 28rem, 90vw"
                                className="about-settle object-cover"
                            />
                        </div>

                        <div
                            aria-hidden="true"
                            className="shape-clover absolute bottom-[22%] right-0 aspect-square w-[32%] bg-muted"
                        >
                            <Image
                                src="/assets/booking.jpg"
                                alt="laptop image"
                                fill
                                sizes="(min-width: 1024px) 10rem, 30vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}