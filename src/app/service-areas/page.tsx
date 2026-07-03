import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { cities } from "@/content/cities";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBanner } from "@/components/sections/cta-banner";

export const metadata: Metadata = {
  title: "Service Areas | Appliance Repair Across the Lower Mainland",
  description: `HomePro Appliances repairs fridges, washers, dryers, dishwashers, stoves & freezers in ${cities.length}+ BC communities including Surrey, Langley, Delta, Richmond, Burnaby and Vancouver.`,
  alternates: { canonical: "/service-areas" },
};

export default function ServiceAreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Service Areas"
        title="Appliance repair across the Lower Mainland"
        subtitle={`Based at ${business.address.street} in Surrey, our technicians run regular routes through ${cities.length}+ BC communities. Pick your city for local details.`}
      />
      <section className="pb-20">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city, i) => (
              <Reveal key={city.slug} delay={(i % 3) * 0.05}>
                <Link
                  href={`/service-areas/${city.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold text-ink-900">
                    Appliance Repair in {city.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                    {city.intro.slice(0, 120).trimEnd()}…
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                    Local details
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <CtaBanner />
    </>
  );
}
