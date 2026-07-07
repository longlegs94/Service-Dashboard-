import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Book in 60 seconds",
    description:
      "Tell us the appliance, the problem, and when you're home — online or by phone. We confirm your appointment window right away.",
  },
  {
    number: "02",
    title: "Get a flat-rate quote",
    description:
      "Our technician diagnoses the fault and quotes the complete repair — parts and labour — before touching a screwdriver. No surprises.",
  },
  {
    number: "03",
    title: "Fixed, usually same visit",
    description:
      "We stock common parts on the truck, so most repairs finish in one visit — backed by a 90-day parts & labour warranty.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-ink-100 bg-ink-50 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From broken to fixed in three steps"
        />
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.08}>
              <div className="border-t-2 border-ink-900 pt-6">
                <p className="font-display text-sm font-bold text-accent-600">{step.number}</p>
                <h3 className="font-display mt-3 text-2xl font-bold text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-ink-500">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14">
          <Button href="/book" size="lg">
            Book Your Repair
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
