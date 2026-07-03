/**
 * ─────────────────────────────────────────────────────────────
 *  TESTIMONIALS — ⚠️ PLACEHOLDER CONTENT ⚠️
 *  These are example reviews written to show the layout.
 *  REPLACE them with real customer reviews (e.g. from your
 *  Google Business profile) before launching the site.
 * ─────────────────────────────────────────────────────────────
 */

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  service: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Our fridge died on a Friday and they had it running again by Monday morning. Upfront price, no surprises, and the tech cleaned up after himself. Couldn't ask for more.",
    name: "Sample Review — replace me",
    location: "Surrey",
    service: "Refrigerator repair",
    rating: 5,
  },
  {
    quote:
      "Second time using HomePro. Washer wouldn't drain — fixed in one visit, and they showed me how to clean the filter so it doesn't happen again. Honest people.",
    name: "Sample Review — replace me",
    location: "Langley",
    service: "Washer repair",
    rating: 5,
  },
  {
    quote:
      "The dryer was squealing like crazy. They quoted a flat rate on the phone, showed up on time, and the final bill matched the quote exactly. Refreshing.",
    name: "Sample Review — replace me",
    location: "Delta",
    service: "Dryer repair",
    rating: 5,
  },
];
