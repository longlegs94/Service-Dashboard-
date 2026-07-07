import { CheckCircle2, Wrench } from "lucide-react";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function WhyUs() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-start gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Why HomePro"
            title="A local family business that treats your home like ours"
            subtitle="We're not a national call centre. We're your neighbours in Surrey — with a real shop, a real parts counter, and technicians who've been fixing appliances here for over a decade."
          />
          <ul className="mt-9 space-y-0 divide-y divide-ink-100 border-y border-ink-100">
            {business.guarantees.map((point, i) => (
              <Reveal key={point} delay={i * 0.05}>
                <li className="flex items-center gap-4 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" />
                  <span className="font-semibold text-ink-900">{point}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.12} className="lg:sticky lg:top-32">
          <div className="relative overflow-hidden rounded-2xl bg-night-900 p-10 text-white sm:p-12">
            <div className="dotgrid-dark absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500">
                <Wrench className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="font-display mt-8 text-3xl font-bold leading-snug sm:text-4xl">
                &ldquo;If a repair doesn&apos;t make financial sense, we&apos;ll tell you —
                even when it costs us the job.&rdquo;
              </p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
                The HomePro promise
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                <div>
                  <p className="font-display text-2xl font-bold text-accent-400">One-stop</p>
                  <p className="mt-1 text-sm text-ink-300">Repairs, sales, parts & recycling</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-accent-400">20+ cities</p>
                  <p className="mt-1 text-sm text-ink-300">One local Surrey team</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
