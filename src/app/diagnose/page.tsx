import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Free AI Appliance Diagnosis",
  description:
    "Describe your appliance problem and our AI helper will suggest likely causes, safe checks you can do yourself, and whether it's time to book a technician.",
  alternates: { canonical: "/diagnose" },
};

export default function DiagnosePage() {
  return (
    <div className="bg-ink-50">
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Free AI-powered diagnosis
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold text-ink-900 sm:text-[2.6rem]">
            What&apos;s your appliance doing?
          </h1>
          <p className="mt-3 text-lg text-ink-500">
            Describe the problem in your own words. Our AI helper narrows down the likely cause,
            suggests safe checks, and helps you book a repair if it needs a pro.
          </p>
        </div>

        <div className="mx-auto mt-10 h-[560px] max-w-2xl overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lift">
          <ChatPanel />
        </div>
      </Container>
    </div>
  );
}
