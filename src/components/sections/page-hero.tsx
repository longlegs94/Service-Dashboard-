import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/container";

/** Simple editorial page header used on inner pages. */
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
    <section className="border-b border-ink-100 pb-14 pt-14 sm:pt-20">
      <Container>
        <Reveal className="max-w-3xl">
          {eyebrow && (
            <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
              <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 sm:text-[3.4rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">{subtitle}</p>}
        </Reveal>
      </Container>
    </section>
  );
}
