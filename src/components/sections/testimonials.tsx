import { Star } from "lucide-react";
import { testimonials } from "@/content/testimonials";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function Testimonials() {
  return (
    <section className="border-y border-ink-100 bg-ink-50 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Reviews"
          title="Trusted by homeowners across the Lower Mainland"
        />
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <figure className="flex h-full flex-col border-l-2 border-accent-500 pl-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex gap-1" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="font-display mt-4 flex-1 text-lg font-medium leading-relaxed text-ink-900">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm text-ink-500">
                  <span className="font-semibold text-ink-700">{t.name}</span>
                  <br />
                  {t.service} · {t.location}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
