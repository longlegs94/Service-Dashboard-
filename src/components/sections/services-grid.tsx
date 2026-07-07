import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/content/services";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ServiceIcon } from "@/components/ui/service-icon";

export function ServicesGrid() {
  return (
    <section className="py-20 sm:py-28" id="services">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Repair Services"
            title="Every major appliance, every major brand"
          />
          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm leading-relaxed text-ink-500">
              Technicians arrive with common parts on the truck — most repairs finish in a
              single visit.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.05} className="h-full">
              <Link
                href={`/services/${service.slug}`}
                className="group relative flex h-full flex-col bg-white p-8 transition-colors duration-300 hover:bg-ink-50"
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent-500 transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between">
                  <span className="text-brand-700">
                    <ServiceIcon icon={service.icon} className="h-9 w-9" />
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 text-ink-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-500"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display mt-6 text-xl font-bold text-ink-900">
                  {service.name}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-500">
                  {service.summary}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
