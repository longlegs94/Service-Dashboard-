import Link from "next/link";
import { MapPin } from "lucide-react";
import { cities } from "@/content/cities";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function ServiceAreas() {
  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Service Areas"
          title="Proudly serving 20+ communities in BC"
          subtitle="Based in Surrey with regular routes across the Lower Mainland — find your city below."
        />
        <Reveal className="mt-12">
          <div className="flex flex-wrap justify-center gap-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/service-areas/${city.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-lift"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
                {city.name}
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
