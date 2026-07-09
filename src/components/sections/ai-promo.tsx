import { MessageCircle, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ConnectedHomeIllustration } from "@/components/illustrations/connected-home-illustration";

export function AiPromo() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-night-900 text-white">
            <div className="dotgrid-dark absolute inset-0" aria-hidden="true" />
            <div className="relative grid items-center gap-12 p-10 sm:p-14 lg:grid-cols-2">
              <div>
                <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> Free AI diagnosis
                </p>
                <h2 className="font-display mt-5 text-3xl font-bold leading-tight sm:text-[2.6rem]">
                  Not sure what&apos;s wrong? Ask our AI helper.
                </h2>
                <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-300">
                  Describe the problem in plain English — &ldquo;my washer won&apos;t
                  drain&rdquo; — and get the likely causes, safe checks to try, and a
                  one-click path to booking if it needs a pro.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button href="/diagnose" variant="white" size="lg">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Try the AI Helper
                  </Button>
                  <Button href="/book" size="lg">
                    Skip to Booking
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block">
                <ConnectedHomeIllustration className="w-full" />
                <div className="ml-auto max-w-sm space-y-3" aria-hidden="true">
                  <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm font-medium text-ink-900">
                    My dryer runs but the clothes stay cold…
                  </div>
                  <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3 text-sm leading-relaxed text-ink-100">
                    That usually points to a burned-out heating element or a blown thermal
                    fuse. First, check that the lint filter and vent aren&apos;t clogged…
                  </div>
                  <div className="w-fit rounded-full bg-accent-500 px-4 py-2 text-sm font-bold">
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
