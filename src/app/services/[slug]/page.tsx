import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2, Phone } from "lucide-react";
import { business } from "@/content/business";
import { services, getService } from "@/content/services";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBanner } from "@/components/sections/cta-banner";
import { ServiceJsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} in Surrey & the Lower Mainland`,
    description: `${service.summary} Flat-rate quotes, 90-day warranty. Serving Surrey, Langley, Delta & 20+ BC cities. Call ${business.phone}.`,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <ServiceJsonLd service={service} />

      <section className="border-b border-ink-100 pb-16 pt-14 sm:pt-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
              <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
              {service.name}
            </p>
            <h1 className="font-display mt-5 text-4xl font-bold leading-tight text-ink-900 sm:text-[3.2rem]">
              {service.headline}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">{service.description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={`/book?appliance=${service.slug}`} size="lg">
                Book {service.shortName} Repair
              </Button>
              <Button href={business.phoneHref} variant="outline" size="lg">
                <Phone className="h-4 w-4 text-accent-500" aria-hidden="true" /> {business.phone}
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display flex items-center gap-3 text-2xl font-bold text-ink-900">
              <AlertCircle className="h-6 w-6 text-accent-500" aria-hidden="true" />
              Symptoms we fix every week
            </h2>
            <ul className="mt-6 divide-y divide-ink-100 border-y border-ink-100">
              {service.symptoms.map((symptom) => (
                <li key={symptom} className="flex items-center gap-4 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" />
                  <span className="font-semibold text-ink-900">{symptom}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-display text-2xl font-bold text-ink-900">Brands we service</h2>
            <p className="mt-3 leading-relaxed text-ink-500">
              Our technicians are experienced with every major appliance brand, and our Surrey
              parts counter keeps common components in stock.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {business.brands.map((brand) => (
                <span
                  key={brand}
                  className="rounded-full border border-ink-200 px-4 py-1.5 text-sm font-semibold text-ink-700"
                >
                  {brand}
                </span>
              ))}
            </div>
            <div className="relative mt-10 overflow-hidden rounded-2xl bg-night-900 p-8 text-white">
              <div className="dotgrid-dark absolute inset-0" aria-hidden="true" />
              <div className="relative">
                <h3 className="font-display text-xl font-bold">
                  Not sure it&apos;s worth repairing?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  Describe the problem to our free AI helper and get the likely causes before
                  you spend a dollar — or call us for an honest opinion.
                </p>
                <Button href="/diagnose" variant="white" className="mt-5">
                  Try the AI Helper
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <FaqSection
        faqs={service.faqs}
        title={`${service.shortName} repair questions`}
        subtitle="Answers to what customers ask us most about this repair."
      />
      <CtaBanner
        title={`Book your ${service.shortName.toLowerCase()} repair today`}
        subtitle="Flat-rate quote before any work begins, and a 90-day warranty after it's done."
      />
    </>
  );
}
