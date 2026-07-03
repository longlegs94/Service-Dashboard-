import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/content/services";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ServiceIcon } from "@/components/ui/service-icon";

export function ServicesGrid() {
  return (
    <section className="py-20 sm:py-24" id="services">
      <Container>
        <SectionHeading
          eyebrow="Repair Services"
          title="Every major appliance, every major brand"
          subtitle="One call covers the whole kitchen and laundry room. Our technicians arrive with common parts on the truck, so most repairs finish in a single visit."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.06}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
              >
                <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-50 p-3 text-brand-700 transition-colors duration-300 group-hover:bg-brand-700 group-hover:text-white">
                  <ServiceIcon icon={service.icon} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{service.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  Learn more
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
  );
}
