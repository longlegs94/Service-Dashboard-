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
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 px-8 py-14 text-center text-white shadow-lift sm:px-14">
            <div
              className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              aria-hidden="true"
            />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-accent-50">
              {subtitle}
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/book" variant="white" size="lg">
                Book a Repair Now
              </Button>
              <Button
                href={business.phoneHref}
                size="lg"
                className="bg-accent-700 hover:bg-accent-700/80"
              >
                <Phone className="h-5 w-5" aria-hidden="true" /> {business.phone}
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
