import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/container";

/** Simple gradient page header used on inner pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-white pb-16 pt-14 sm:pt-20">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-5 text-lg leading-relaxed text-ink-500">{subtitle}</p>}
        </Reveal>
      </Container>
    </section>
  );
}
