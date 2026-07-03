import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function WhyUs() {
  return (
    <section className="bg-ink-50 py-20 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
            <Image
              src="/images/why-us.jpg"
              alt="Illustration of a home protected by HomePro's 90-day repair warranty"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-3 -top-5 rounded-2xl border border-ink-100 bg-white px-5 py-3 shadow-lift sm:right-6">
            <p className="text-sm font-bold text-ink-900">Serving the Lower Mainland</p>
            <p className="text-xs text-ink-500">20+ cities, one local team</p>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600">
              Why HomePro
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              A local family business that treats your home like ours
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">
              We&apos;re not a national call centre. We&apos;re your neighbours in Surrey — with a
              real shop, a real parts counter, and technicians who&apos;ve been fixing appliances
              here for over a decade.
            </p>
          </Reveal>
          <ul className="mt-8 space-y-4">
            {business.guarantees.map((point, i) => (
              <Reveal key={point} delay={i * 0.06}>
                <li className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-soft">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="font-medium text-ink-900">{point}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
