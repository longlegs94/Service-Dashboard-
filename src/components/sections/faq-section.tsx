import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Accordion } from "@/components/ui/accordion";
import { FaqJsonLd } from "@/components/seo/json-ld";
import type { Faq } from "@/content/faqs";

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  subtitle = "Straight answers to the questions we hear most.",
}: {
  faqs: Faq[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="border-t border-ink-100 bg-ink-50 py-20 sm:py-28">
      <FaqJsonLd faqs={faqs} />
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeading eyebrow="FAQ" title={title} subtitle={subtitle} />
        <Reveal delay={0.08}>
          <Accordion items={faqs} />
        </Reveal>
      </Container>
    </section>
  );
}
