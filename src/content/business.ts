/**
 * ─────────────────────────────────────────────────────────────
 *  BUSINESS INFO — edit this file to change contact details,
 *  hours, taglines, and stats shown across the entire site.
 * ─────────────────────────────────────────────────────────────
 */

export const business = {
  name: "HomePro Appliances",
  legalName: "HomePro Appliances Ltd.",
  tagline: "Fast, honest appliance repair across the Lower Mainland",
  description:
    "Family-owned appliance repair, sales, parts, and installation serving Surrey and the Lower Mainland. Same-week service, upfront pricing, and repairs done right the first time.",

  phone: "(604) 591-6424",
  phoneHref: "tel:+16045916424",
  // NOTE: placeholder — replace with the real business email
  email: "info@homeproappliances.ca",

  address: {
    street: "#102 – 14772 64 Ave",
    city: "Surrey",
    province: "BC",
    postalCode: "V3S 1X7",
    country: "CA",
    mapsUrl: "https://maps.google.com/?q=14772+64+Ave+Unit+102,+Surrey,+BC+V3S+1X7",
  },

  hours: [
    { days: "Monday – Friday", open: "9:30 AM", close: "5:30 PM" },
    { days: "Saturday – Sunday", open: "11:00 AM", close: "5:00 PM" },
  ],

  /** Used in JSON-LD structured data (schema.org format). */
  hoursSchema: [
    { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:30", closes: "17:30" },
    { dayOfWeek: ["Saturday", "Sunday"], opens: "11:00", closes: "17:00" },
  ],

  /** Production URL — update after connecting the domain on Vercel. */
  siteUrl: "https://www.homeproappliances.ca",

  stats: [
    { value: "15+", label: "Years of experience" },
    { value: "10,000+", label: "Repairs completed" },
    { value: "20+", label: "Cities served" },
    { value: "90 days", label: "Warranty on repairs" },
  ],

  guarantees: [
    "Upfront, flat-rate quotes — no surprise fees",
    "90-day warranty on parts and labour",
    "Licensed and insured technicians",
    "Same-week appointments in most areas",
  ],

  /** Secondary offerings shown in the "More than repairs" section. */
  otherServices: [
    {
      title: "Appliance Sales",
      description: "New, dent & scratch, and quality used appliances at showroom prices.",
    },
    {
      title: "Parts Counter",
      description: "OEM and aftermarket parts for all major brands — DIY friendly.",
    },
    {
      title: "Delivery & Installation",
      description: "Professional delivery, hookup, and haul-away of your old unit.",
    },
    {
      title: "Appliance Recycling",
      description: "Responsible pickup and recycling of old or broken appliances.",
    },
  ],

  brands: [
    "Samsung", "LG", "Whirlpool", "GE", "Maytag", "KitchenAid", "Bosch",
    "Frigidaire", "Kenmore", "Electrolux", "Amana", "Inglis", "Danby", "Miele",
  ],
} as const;

export type Business = typeof business;
