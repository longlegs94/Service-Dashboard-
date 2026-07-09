import { business } from "@/content/business";

const phrases = [
  "Same-week service",
  "90-day warranty",
  "Flat-rate quotes",
  "Licensed & insured technicians",
];

/**
 * Full-width infinite ticker between the hero and the services grid — pure
 * CSS animation (see .marquee-track in globals.css), no JS/framer-motion
 * needed. Content is duplicated once in the markup so a 50% translateX loop
 * wraps seamlessly. Decorative: brand names and the phrases here are
 * reinforced elsewhere on the page in an accessible form, so the whole strip
 * is hidden from assistive tech to avoid reading a repeated list twice.
 */
export function MarqueeStrip() {
  const items = [...business.brands, ...phrases];
  const track = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-y border-ink-100 bg-ink-50 py-4"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max items-center">
        {track.map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-3 px-6 text-sm font-semibold uppercase tracking-wide text-ink-500"
          >
            <span className="h-1 w-1 shrink-0 rounded-full bg-accent-500" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
