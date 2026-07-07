import type { Metadata } from "next";
import { ServicesGrid } from "@/components/sections/services-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import { PageHero } from "@/components/sections/page-hero";
import { business } from "@/content/business";

export const metadata: Metadata = {
  title: "Appliance Repair Services",
  description: `Professional repair for refrigerators, washers, dryers, dishwashers, stoves & freezers across Surrey and the Lower Mainland. Flat-rate quotes, 90-day warranty. Call ${business.phone}.`,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Appliance repair services"
        subtitle="Six major appliances, all major brands, one trusted local team. Every repair starts with a flat-rate quote and ends with a 90-day warranty."
      />
      <ServicesGrid />
      <CtaBanner />
    </>
  );
}
