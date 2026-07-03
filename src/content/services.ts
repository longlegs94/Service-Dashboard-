/**
 * ─────────────────────────────────────────────────────────────
 *  REPAIR SERVICES — one entry per appliance type.
 *  Each entry becomes a page at /services/[slug].
 *  To add a service: copy an entry, change the fields, done.
 * ─────────────────────────────────────────────────────────────
 */

export type Service = {
  slug: string;
  name: string;
  /** Short name used in nav, cards, and the booking form. */
  shortName: string;
  /** Icon key rendered by ServiceIcon (see src/components/ui/service-icon.tsx). */
  icon: "fridge" | "washer" | "dryer" | "dishwasher" | "stove" | "freezer";
  headline: string;
  summary: string;
  description: string;
  /** Common symptoms — used on service pages and by the AI helper. */
  symptoms: string[];
  faqs: { question: string; answer: string }[];
  image: string;
  imageAlt: string;
};

export const services: Service[] = [
  {
    slug: "refrigerator-repair",
    name: "Refrigerator Repair",
    shortName: "Refrigerator",
    icon: "fridge",
    headline: "Refrigerator not cooling? We'll fix it fast.",
    summary:
      "From warm fridges to leaking water lines and noisy compressors — we repair all major refrigerator brands, usually in a single visit.",
    description:
      "A broken fridge can't wait. Our technicians diagnose cooling failures, faulty compressors, broken ice makers, water leaks, and temperature control problems on all major brands. We arrive with common parts on hand so most refrigerator repairs are completed the same day we visit.",
    symptoms: [
      "Fridge not cooling or freezing food",
      "Water leaking inside or under the fridge",
      "Ice maker not working",
      "Loud humming, buzzing, or clicking noises",
      "Frost buildup in the freezer compartment",
      "Door seal worn or not closing properly",
    ],
    faqs: [
      {
        question: "My fridge is running but not cold. What's wrong?",
        answer:
          "The most common causes are dirty condenser coils, a failed evaporator fan, or a faulty start relay. Our technician will diagnose the exact cause and give you a flat-rate quote before any work begins.",
      },
      {
        question: "Is it worth repairing an older refrigerator?",
        answer:
          "Usually yes if the unit is under 10–12 years old. We'll always give you an honest assessment — if a repair doesn't make financial sense, we'll tell you, and we can even help you find a replacement from our showroom.",
      },
    ],
    image: "/images/service-fridge.jpg",
    imageAlt: "Refrigerator repair illustration in HomePro brand style",
  },
  {
    slug: "washer-repair",
    name: "Washing Machine Repair",
    shortName: "Washer",
    icon: "washer",
    headline: "Washer won't drain, spin, or start? We can help.",
    summary:
      "Front-load or top-load, we repair leaks, drainage problems, drum issues, and error codes on every major washer brand.",
    description:
      "Laundry piles up fast when your washer quits. We service both front-load and top-load machines — fixing drain pump failures, door lock faults, drum bearing noise, leaks, and cryptic error codes. Most washer repairs are done in one visit with a 90-day warranty on parts and labour.",
    symptoms: [
      "Washer won't drain or spin",
      "Water leaking from the machine",
      "Drum not turning or making loud banging noises",
      "Door or lid won't lock / unlock",
      "Machine stops mid-cycle or shows an error code",
      "Excessive shaking or walking during spin",
    ],
    faqs: [
      {
        question: "Why is my washer leaving clothes soaking wet?",
        answer:
          "That's usually a drain pump problem, a clogged filter, or a worn drive belt. It's one of the most common repairs we do and is typically fixed in a single visit.",
      },
      {
        question: "Do you repair stacked washer/dryer units?",
        answer:
          "Yes — we regularly service stacked laundry centres and condo laundry closets across the Lower Mainland.",
      },
    ],
    image: "/images/service-washer.jpg",
    imageAlt: "Washing machine repair illustration in HomePro brand style",
  },
  {
    slug: "dryer-repair",
    name: "Dryer Repair",
    shortName: "Dryer",
    icon: "dryer",
    headline: "Dryer not heating or taking forever? Let's fix that.",
    summary:
      "No heat, long dry times, loud squeaks — we repair electric and gas dryers and can service your vent for safer, faster drying.",
    description:
      "A dryer that won't heat — or takes three cycles to dry a load — usually has a failed heating element, thermal fuse, or airflow problem. We repair all major dryer brands, and we'll check your vent line too, since lint-clogged vents are a leading cause of slow drying and house fires.",
    symptoms: [
      "Dryer runs but doesn't heat",
      "Clothes take multiple cycles to dry",
      "Loud squealing, thumping, or grinding",
      "Dryer won't start or stops mid-cycle",
      "Burning smell during operation",
      "Drum not spinning",
    ],
    faqs: [
      {
        question: "Why does my dryer run but never get hot?",
        answer:
          "On electric dryers it's most often a burned-out heating element or a blown thermal fuse; on gas dryers, a failed igniter or gas valve coil. All are quick, affordable repairs for our technicians.",
      },
      {
        question: "Is a burning smell from the dryer dangerous?",
        answer:
          "Stop using the dryer and unplug it. Burning smells often mean lint buildup near the heating element — a real fire risk. Book a repair and we'll inspect and clean it safely.",
      },
    ],
    image: "/images/service-dryer.jpg",
    imageAlt: "Dryer repair illustration in HomePro brand style",
  },
  {
    slug: "dishwasher-repair",
    name: "Dishwasher Repair",
    shortName: "Dishwasher",
    icon: "dishwasher",
    headline: "Dishes coming out dirty or the tub won't drain?",
    summary:
      "We fix poor cleaning, draining failures, leaks, and racks that won't slide — on built-in and portable dishwashers alike.",
    description:
      "Dishwashers fail in quiet ways — dishes come out cloudy, water pools in the bottom, or a slow leak warps your kitchen floor. Our technicians repair spray arms, drain pumps, inlet valves, door seals, and control boards on all major dishwasher brands, restoring that like-new clean.",
    symptoms: [
      "Dishes still dirty or cloudy after a cycle",
      "Water left standing in the bottom of the tub",
      "Dishwasher leaking onto the kitchen floor",
      "Won't start, fill, or complete a cycle",
      "Soap dispenser not opening",
      "Unusual grinding or humming noise",
    ],
    faqs: [
      {
        question: "Why is there water sitting in the bottom of my dishwasher?",
        answer:
          "Standing water usually points to a clogged filter or drain hose, or a failing drain pump. It's a common, inexpensive repair — and much cheaper than water damage from ignoring it.",
      },
      {
        question: "Do you repair built-in panel-ready dishwashers?",
        answer:
          "Yes. We service integrated and panel-ready models, including condo and townhouse installations, and we're careful with cabinetry.",
      },
    ],
    image: "/images/service-dishwasher.jpg",
    imageAlt: "Dishwasher repair illustration in HomePro brand style",
  },
  {
    slug: "stove-oven-repair",
    name: "Stove & Oven Repair",
    shortName: "Stove / Oven",
    icon: "stove",
    headline: "Burners not lighting or oven not holding heat?",
    summary:
      "Electric, gas, and induction — we repair cooktops, ovens, and ranges so dinner stays on schedule.",
    description:
      "Whether it's an element that won't heat, a gas burner that won't light, or an oven that burns everything on one side, we repair electric, gas, and induction ranges from every major brand. Gas appliance work is handled by licensed technicians — never a DIY job.",
    symptoms: [
      "Oven not heating or not holding temperature",
      "Burners won't light or heat unevenly",
      "Oven door won't close or lock",
      "Control panel unresponsive or showing errors",
      "Self-clean cycle not working",
      "Sparking or tripped breakers when using the range",
    ],
    faqs: [
      {
        question: "My oven runs hot on one side. Can that be fixed?",
        answer:
          "Yes — uneven heating is usually a failing bake element, a faulty temperature sensor, or a convection fan issue. All are standard repairs we complete with a 90-day warranty.",
      },
      {
        question: "Do you work on gas stoves?",
        answer:
          "Yes, our licensed technicians safely repair gas cooktops and ranges. If you ever smell gas, leave the area and call your gas provider first — then book us for the repair.",
      },
    ],
    image: "/images/service-stove.jpg",
    imageAlt: "Stove and oven repair illustration in HomePro brand style",
  },
  {
    slug: "freezer-repair",
    name: "Freezer Repair",
    shortName: "Freezer",
    icon: "freezer",
    headline: "Freezer thawing out? Don't lose a full freezer of food.",
    summary:
      "Chest, upright, and built-in freezers — we fix cooling failures, frost buildup, and faulty thermostats before your food spoils.",
    description:
      "When a freezer fails, hundreds of dollars of food is on the line. We prioritize freezer calls and repair compressors, thermostats, defrost systems, and door seals on chest freezers, uprights, and built-in units across all major brands.",
    symptoms: [
      "Freezer not freezing or food thawing",
      "Heavy frost or ice buildup on walls",
      "Freezer running constantly",
      "Loud humming, clicking, or vibrating",
      "Water pooling under the unit",
      "Door seal torn or not sealing",
    ],
    faqs: [
      {
        question: "My freezer is frosting up badly. What causes that?",
        answer:
          "Usually a worn door gasket letting humid air in, or a failed defrost heater or timer. Both are common repairs we can typically complete in one visit.",
      },
      {
        question: "How fast can you come out for a failing freezer?",
        answer:
          "We treat freezers as priority calls because food is at risk. Call us at the shop and we'll get you the earliest available appointment — often within a day or two.",
      },
    ],
    image: "/images/service-freezer.jpg",
    imageAlt: "Freezer repair illustration in HomePro brand style",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
