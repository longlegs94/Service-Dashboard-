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
    <section className="bg-ink-50 py-20 sm:py-24">
      <FaqJsonLd faqs={faqs} />
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title={title} subtitle={subtitle} />
        <Reveal className="mt-12">
          <Accordion items={faqs} />
        </Reveal>
      </Container>
    </section>
  );
}
