import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function TrustBar() {
  return (
    <section className="border-y border-ink-100 bg-ink-50">
      <Container>
        <dl className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          {business.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.05}>
              <div className="border-l-2 border-accent-500 pl-5">
                <dd className="font-display text-3xl font-bold text-ink-900">{stat.value}</dd>
                <dt className="mt-1 text-sm text-ink-500">{stat.label}</dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
