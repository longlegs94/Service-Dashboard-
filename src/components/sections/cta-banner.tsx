import { Phone } from "lucide-react";
import { business } from "@/content/business";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function CtaBanner({
  title = "Ready to get it fixed?",
  subtitle = "Book online in under a minute, or call our Surrey shop — we'll get a technician to your door fast.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-accent-500">
      <Container className="py-20 sm:py-24">
        <Reveal>
          <div className="grid items-center gap-10 text-white lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-accent-50">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Button href="/book" variant="white" size="lg">
                Book a Repair Now
              </Button>
              <a
                href={business.phoneHref}
                className="inline-flex items-center gap-2.5 rounded-full border-2 border-white/40 px-7 py-3.5 text-base font-bold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <Phone className="h-5 w-5" aria-hidden="true" /> {business.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
