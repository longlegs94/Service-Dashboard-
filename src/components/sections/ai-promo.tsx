import { MessageCircle, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function AiPromo() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-12 text-white shadow-lift sm:px-14 sm:py-16">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/20">
                  <Sparkles className="h-4 w-4 text-accent-400" aria-hidden="true" /> New — free AI
                  diagnosis
                </p>
                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Not sure what&apos;s wrong? Ask our AI helper.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-brand-100">
                  Describe the problem in plain English — &ldquo;my washer won&apos;t drain&rdquo;
                  — and get the likely causes, safe checks you can try, and a one-click path to
                  booking if it needs a pro.
                </p>
                <div className="mt-7 flex flex-wrap gap-4">
                  <Button href="/diagnose" variant="white" size="lg">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Try the AI Helper
                  </Button>
                  <Button href="/book" size="lg">
                    Skip to Booking
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block" aria-hidden="true">
                <div className="ml-auto max-w-sm space-y-3 rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                  <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-sm font-medium text-ink-900">
                    My dryer runs but the clothes stay cold…
                  </div>
                  <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-brand-800/80 px-4 py-2.5 text-sm text-brand-50 ring-1 ring-white/10">
                    That usually points to a burned-out heating element or a blown thermal fuse.
                    First, check that the lint filter and vent aren&apos;t clogged…
                  </div>
                  <div className="w-fit rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold">
                    Book a dryer repair →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
