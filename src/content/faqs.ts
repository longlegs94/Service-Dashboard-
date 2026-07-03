/**
 * ─────────────────────────────────────────────────────────────
 *  GENERAL FAQs — shown on the home page and used for the
 *  FAQPage structured data. Service-specific FAQs live in
 *  services.ts; city-specific FAQs live in cities.ts.
 * ─────────────────────────────────────────────────────────────
 */

export type Faq = { question: string; answer: string };

export const generalFaqs: Faq[] = [
  {
    question: "How much does an appliance repair cost?",
    answer:
      "Every repair starts with a diagnostic visit where the technician identifies the fault and gives you a flat-rate quote for the complete repair — parts and labour — before any work begins. If you approve the repair, you pay the quoted price and nothing more.",
  },
  {
    question: "How quickly can you come out?",
    answer:
      "Most areas get same-week appointments, and Surrey, Delta, and Langley customers can often be seen within a day or two. Fridge and freezer failures are treated as priority calls because food is at risk.",
  },
  {
    question: "Is your work guaranteed?",
    answer:
      "Yes — every repair is backed by a 90-day warranty covering both parts and labour. If the same problem comes back within the warranty period, we return and make it right at no charge.",
  },
  {
    question: "Which brands do you repair?",
    answer:
      "All major brands including Samsung, LG, Whirlpool, GE, Maytag, KitchenAid, Bosch, Frigidaire, Kenmore, Electrolux, and more. Our Surrey parts counter stocks common components so most repairs finish in a single visit.",
  },
  {
    question: "Should I repair my appliance or replace it?",
    answer:
      "Our rule of thumb: if the repair costs less than half the price of a comparable new unit and the appliance is under ten years old, repair usually wins. Our technicians give you an honest recommendation either way — and since we also sell new and quality used appliances, we can help whichever route you choose.",
  },
  {
    question: "Do you sell parts if I want to fix it myself?",
    answer:
      "Yes — our Surrey parts counter carries OEM and aftermarket parts for all major brands. Bring your model number and we'll get you the right part, with friendly advice included.",
  },
];
