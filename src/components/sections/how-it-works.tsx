import { CalendarCheck, ClipboardCheck, Wrench } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: CalendarCheck,
    title: "Book in 60 seconds",
    description:
      "Tell us the appliance, the problem, and when you're home — online or by phone. We confirm your appointment window right away.",
  },
  {
    icon: ClipboardCheck,
    title: "Get a flat-rate quote",
    description:
      "Our technician diagnoses the fault and quotes the complete repair — parts and labour — before touching a screwdriver. No surprises.",
  },
  {
    icon: Wrench,
    title: "Fixed, usually same visit",
    description:
      "We stock common parts on the truck, so most repairs finish in one visit — backed by a 90-day parts & labour warranty.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-brand-900 py-20 text-white sm:py-24">
      <Container>
        <SectionHeadingDark />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="relative">
              <div className="flex items-start gap-4 md:flex-col">
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/20">
                    <step.icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold md:mt-5">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-100/90">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14 text-center">
          <Button href="/book" size="lg">
            Book Your Repair
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}

function SectionHeadingDark() {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-300">
        How it works
      </p>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        From broken to fixed in three easy steps
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-brand-100/90">
        No call-out roulette, no vague estimates — just a simple process built around your
        schedule.
      </p>
    </Reveal>
  );
}
