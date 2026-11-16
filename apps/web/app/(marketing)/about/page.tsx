import type { Metadata } from "next";

import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutMission } from "@/components/about/about-mission";
import { AboutValues } from "@/components/about/about-values";
import { FinalCtaSection } from "@/components/marketing/sections/final-cta-section";

export const metadata: Metadata = {
    title: "About",
    description:
        "Schedulyn brings independent professionals and the people who need their expertise closer together.",
};

export default function AboutPage() {
    return (
        <>
            <AboutHero />
            <AboutStory />
            <AboutMission />
            <AboutValues />
            <FinalCtaSection />
        </>
    );
}