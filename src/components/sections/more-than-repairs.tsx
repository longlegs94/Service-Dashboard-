import { Store, Package, Truck, Recycle } from "lucide-react";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const icons = [Store, Package, Truck, Recycle];

export function MoreThanRepairs() {
  return (
    <section className="border-t border-ink-100 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="More than repairs"
          title="Your one-stop appliance shop in Surrey"
          subtitle={`Visit our showroom and parts counter at ${business.address.street} — repair is just the beginning.`}
        />
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {business.otherServices.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={item.title} delay={i * 0.05}>
                <div className="border-t-2 border-ink-900 pt-5">
                  <Icon className="h-6 w-6 text-accent-600" aria-hidden="true" />
                  <h3 className="font-display mt-4 text-lg font-bold text-ink-900">
                    {item.title}
                  </h3>
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
