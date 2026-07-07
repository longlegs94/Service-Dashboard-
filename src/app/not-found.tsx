import Link from "next/link";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-24 text-center sm:py-32">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Wrench className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="font-display mt-6 text-4xl font-bold text-ink-900">
        This page needs a repair
      </h1>
      <p className="mt-3 max-w-md text-lg text-ink-500">
        We couldn&apos;t find that page — but fixing things is literally our job. Let&apos;s get
        you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button href="/">Back to Home</Button>
        <Button href="/book" variant="outline">
          Book a Repair
        </Button>
      </div>
      <p className="mt-6 text-sm text-ink-500">
        Or explore our <Link href="/services" className="font-semibold text-brand-700 hover:underline">repair services</Link>.
      </p>
    </Container>
  );
}
