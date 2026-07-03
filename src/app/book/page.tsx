import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarCheck, PhoneCall, ShieldCheck } from "lucide-react";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book an Appliance Repair Online",
  description: `Book your appliance repair in under a minute. Same-week appointments across Surrey & the Lower Mainland, flat-rate quotes, 90-day warranty. Or call ${business.phone}.`,
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="bg-ink-50">
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Takes under a minute
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Book your repair
          </h1>
          <p className="mt-3 text-lg text-ink-500">
            Tell us what&apos;s broken and when you&apos;re home — we&apos;ll confirm your
            appointment right away.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white shadow-soft" />}>
            <BookingWizard />
          </Suspense>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-3 text-sm text-ink-500 sm:flex-row sm:gap-8">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> 90-day warranty on
            every repair
          </p>
          <p className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-brand-600" aria-hidden="true" /> Prefer to call?{" "}
            <a href={business.phoneHref} className="font-semibold text-brand-700">
              {business.phone}
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
