import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
import { business } from "@/content/business";
import { cities, getCity } from "@/content/cities";
import { services } from "@/content/services";
import { generalFaqs } from "@/content/faqs";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ServiceIcon } from "@/components/ui/service-icon";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBanner } from "@/components/sections/cta-banner";

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return {
    title: `Appliance Repair in ${city.name}, BC`,
    description: `Trusted appliance repair in ${city.name} — fridges, washers, dryers, dishwashers, stoves & freezers. Flat-rate quotes, 90-day warranty, fast local service. Call ${business.phone}.`,
    alternates: { canonical: `/service-areas/${city.slug}` },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const cityFaqs = [city.faq, ...generalFaqs.slice(0, 4)];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white pb-16 pt-14 sm:pt-20">
        <Container className="max-w-4xl">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-soft">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {city.name}, British Columbia
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Appliance repair in {city.name}, done right
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">{city.intro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/book" size="lg">
                Book a Repair in {city.name}
              </Button>
              <Button href={business.phoneHref} variant="outline" size="lg">
                <Phone className="h-4 w-4 text-brand-600" aria-hidden="true" /> {business.phone}
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-14">
        <Container className="max-w-4xl">
          <Reveal>
            <h2 className="text-2xl font-bold text-ink-900">
              What we repair in {city.name}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 p-2.5 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                    <ServiceIcon icon={service.icon} className="h-6 w-6" />
                  </span>
                  <span className="flex-1 font-semibold text-ink-900">{service.name}</span>
                  <ArrowRight
                    className="h-4 w-4 text-ink-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-600"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-12">
            <div className="rounded-3xl border border-ink-100 bg-ink-50 p-8">
              <h2 className="text-2xl font-bold text-ink-900">
                Neighbourhoods we serve in {city.name}
              </h2>
              <p className="mt-2 leading-relaxed text-ink-500">
                Our technicians are regularly in and around{" "}
                {city.neighbourhoods.slice(0, -1).join(", ")} and{" "}
                {city.neighbourhoods[city.neighbourhoods.length - 1]}.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {city.neighbourhoods.map((n) => (
                  <li
                    key={n}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-4 py-1.5 text-sm font-medium text-ink-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" /> {n}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      <FaqSection
        faqs={cityFaqs}
        title={`${city.name} appliance repair questions`}
        subtitle={`What ${city.name} homeowners ask us most.`}
      />
      <CtaBanner
        title={`Need an appliance fixed in ${city.name}?`}
        subtitle="Book online in under a minute — flat-rate quote up front, 90-day warranty after."
      />
    </>
  );
}
