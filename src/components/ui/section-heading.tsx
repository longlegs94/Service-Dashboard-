import { Reveal } from "@/components/ui/reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <Reveal className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
          {align === "left" && <span className="h-px w-8 bg-accent-500" aria-hidden="true" />}
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight text-ink-900 sm:text-[2.6rem]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-ink-500">{subtitle}</p>}
    </Reveal>
  );
}
