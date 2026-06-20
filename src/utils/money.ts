/**
 * Money helpers. Amounts are ALWAYS stored and passed around as integer cents.
 * Never let dollar floats leak into persistence or arithmetic — convert at the
 * boundaries (form input → cents, cents → display) only.
 */

/** Formats integer cents as a localized currency string, e.g. 123456 → "$1,234.56". */
export function formatCents(cents: number, currency = "CAD"): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(safe / 100);
}

/**
 * Converts a dollar value (string from an input, or a number) into integer
 * cents. Rounds to the nearest cent and tolerates "$", commas, and whitespace.
 * Returns 0 for empty/invalid input.
 */
export function dollarsToCents(v: string | number): number {
  if (typeof v === "number") {
    return Number.isFinite(v) ? Math.round(v * 100) : 0;
  }
  const cleaned = v.replace(/[^0-9.\-]/g, "").trim();
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return 0;
  const dollars = Number.parseFloat(cleaned);
  if (!Number.isFinite(dollars)) return 0;
  return Math.round(dollars * 100);
}

/** Converts integer cents to a plain dollar number (e.g. 123456 → 1234.56). */
export function centsToDollars(cents: number): number {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  return safe / 100;
}
