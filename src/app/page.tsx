import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { MarqueeStrip } from "@/components/sections/marquee-strip";
import { ServicesGrid } from "@/components/sections/services-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WhyUs } from "@/components/sections/why-us";
import { AiPromo } from "@/components/sections/ai-promo";
import { Testimonials } from "@/components/sections/testimonials";
import { ServiceAreas } from "@/components/sections/service-areas";
import { MoreThanRepairs } from "@/components/sections/more-than-repairs";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBanner } from "@/components/sections/cta-banner";
import { generalFaqs } from "@/content/faqs";

export const metadata: Metadata = {
  title: "HomePro Appliances | Appliance Repair in Surrey & the Lower Mainland",
  description:
    "Fast, honest appliance repair in Surrey, Langley, Delta, and 20+ BC cities. Fridges, washers, dryers, dishwashers, stoves & freezers — flat-rate quotes and a 90-day warranty. Book online today.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <ServicesGrid />
      <HowItWorks />
      <WhyUs />
      <AiPromo />
      <Testimonials />
      <ServiceAreas />
      <MoreThanRepairs />
      <FaqSection faqs={generalFaqs} />
      <CtaBanner />
    </>
  );
}
