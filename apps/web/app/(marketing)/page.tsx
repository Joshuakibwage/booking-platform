import { HeroSection } from "@/components/marketing/sections/hero-section";
import { CategoriesSection } from "@/components/marketing/sections/categories-section";
import { HowItWorksSection } from "@/components/marketing/sections/how-it-works-section";
import { ForProfessionalsSection } from "@/components/marketing/sections/for-professionals-section";
import { FaqSection } from "@/components/marketing/sections/faq-section";
import { FinalCtaSection } from "@/components/marketing/sections/final-cta-section";


export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <ForProfessionalsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}