import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function TrustBar() {
  return (
    <section className="border-y border-ink-100 bg-ink-50">
      <Container>
        <dl className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {business.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06} className="text-center">
              <dt className="order-2 mt-1 text-sm text-ink-500">{stat.label}</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-brand-700">
                {stat.value}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
