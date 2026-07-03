import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { business } from "@/content/business";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "Contact Us | Surrey Appliance Repair Shop",
  description: `Visit HomePro Appliances at ${business.address.street}, Surrey, BC, call ${business.phone}, or book a repair online. Open 7 days a week.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a real local expert"
        subtitle="Call, email, visit the shop, or book online — whatever's easiest for you."
      />

      <section className="pb-20">
        <Container className="grid gap-10 lg:grid-cols-5">
          <Reveal className="space-y-5 lg:col-span-2">
            <a
              href={business.phoneHref}
              className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Phone className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold text-ink-900">{business.phone}</span>
                <span className="mt-1 block text-sm text-ink-500">
                  Fastest way to reach us — call during shop hours.
                </span>
              </span>
            </a>

            <a
              href={`mailto:${business.email}`}
              className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold text-ink-900">{business.email}</span>
                <span className="mt-1 block text-sm text-ink-500">
                  Email us photos of the problem or your model number.
                </span>
              </span>
            </a>

            <div className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-ink-900">Shop hours</p>
                <ul className="mt-1 space-y-0.5 text-sm text-ink-500">
                  {business.hours.map((h) => (
                    <li key={h.days}>
                      {h.days}: {h.open} – {h.close}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-900 p-6 text-white shadow-lift">
              <p className="font-bold">Prefer to book online?</p>
              <p className="mt-1 text-sm text-brand-100">
                Tell us the appliance and the problem — takes under a minute.
              </p>
              <Button href="/book" className="mt-4">
                Book a Repair
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-ink-100 shadow-lift">
              <iframe
                title={`Map to ${business.name} at ${business.address.street}, ${business.address.city}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${business.address.street}, ${business.address.city}, ${business.address.province} ${business.address.postalCode}`,
                )}&output=embed`}
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-5">
                <p className="flex items-center gap-2 font-semibold text-ink-900">
                  <MapPin className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  {business.address.street}, {business.address.city},{" "}
                  {business.address.province} {business.address.postalCode}
                </p>
                <Button
                  href={business.address.mapsUrl}
                  variant="outline"
                  size="sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
