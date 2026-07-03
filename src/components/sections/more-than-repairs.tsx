import { Store, Package, Truck, Recycle } from "lucide-react";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const icons = [Store, Package, Truck, Recycle];

export function MoreThanRepairs() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="More than repairs"
          title="Your one-stop appliance shop in Surrey"
          subtitle="Visit our showroom and parts counter at #102 – 14772 64 Ave — repair is just the beginning."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {business.otherServices.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-ink-100 bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-600">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
