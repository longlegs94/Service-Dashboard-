import Link from "next/link";
import { cities } from "@/content/cities";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function ServiceAreas() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Service Areas"
          title="Proudly serving 20+ BC communities"
          subtitle="Based in Surrey with regular routes across the Lower Mainland — find your city."
        />
        <Reveal className="mt-10">
          <div className="flex flex-wrap gap-x-2 gap-y-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/service-areas/${city.slug}`}
                className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors duration-200 hover:border-ink-900 hover:bg-ink-900 hover:text-white"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
