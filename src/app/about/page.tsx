import type { Metadata } from "next";
import Image from "next/image";
import { Handshake, HeartHandshake, ShieldCheck, Wrench } from "lucide-react";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { TrustBar } from "@/components/sections/trust-bar";
import { CtaBanner } from "@/components/sections/cta-banner";

export const metadata: Metadata = {
  title: "About Us | Family-Owned Appliance Experts in Surrey",
  description:
    "HomePro Appliances is a family-owned appliance repair and sales business in Surrey, BC. Real shop, real parts counter, and technicians who treat your home like their own.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: Handshake,
    title: "Honesty first",
    description:
      "If a repair doesn't make financial sense, we say so — even when it costs us the job. That honesty is why customers come back.",
  },
  {
    icon: Wrench,
    title: "Fixed right, first time",
    description:
      "Experienced technicians, stocked trucks, and a real parts counter behind them. Most repairs are finished in a single visit.",
  },
  {
    icon: ShieldCheck,
    title: "Stand behind the work",
    description:
      "Every repair carries a 90-day parts and labour warranty. If the problem comes back, so do we — at no charge.",
  },
  {
    icon: HeartHandshake,
    title: "Neighbours, not a call centre",
    description:
      "We live and work here. When you call, you talk to people who know Surrey, not a script in another time zone.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A family business built on fixed appliances and kept promises"
        subtitle={`From our shop at ${business.address.street} in Surrey, we've spent years helping Lower Mainland families keep their kitchens and laundry rooms running.`}
      />

      <section className="pb-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
              <Image
                src="/images/about.jpg"
                alt="Illustration of the HomePro Appliances storefront in Surrey, BC"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-3xl font-bold text-ink-900">
              One-stop shop, zero runaround
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-ink-500">
              <p>
                {business.name} started with a simple idea: appliance service should be honest,
                local, and complete. Today our shop at {business.address.street} in Surrey houses a
                showroom of new, dent &amp; scratch, and quality used appliances, a fully stocked
                parts counter, and the repair team that serves 20+ communities across the Lower
                Mainland.
              </p>
              <p>
                Because we sell appliances and parts as well as repair them, our advice has no
                agenda — if fixing your machine is the right call, we fix it; if replacing it makes
                more sense, we&apos;ll help you find the right unit and take the old one away for
                recycling.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <TrustBar />

      <section className="py-20">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600">
              Our values
            </p>
            <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-[2.6rem]">
              What we promise every customer
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.06}>
                <div className="flex h-full gap-5 rounded-2xl border border-ink-100 bg-white p-7 shadow-soft">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <value.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink-900">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{value.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
