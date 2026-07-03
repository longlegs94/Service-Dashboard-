/**
 * ─────────────────────────────────────────────────────────────
 *  SERVICE AREAS — one entry per city.
 *  Each entry becomes an SEO page at /service-areas/[slug].
 *  To add a city: copy an entry and write a unique intro —
 *  unique copy per city matters for Google rankings.
 * ─────────────────────────────────────────────────────────────
 */

export type City = {
  slug: string;
  name: string;
  /** Unique intro paragraph — do not reuse between cities (SEO). */
  intro: string;
  /** Local neighbourhoods / landmarks woven into the page. */
  neighbourhoods: string[];
  /** One city-specific FAQ for the FAQPage schema. */
  faq: { question: string; answer: string };
};

export const cities: City[] = [
  {
    slug: "surrey",
    name: "Surrey",
    intro:
      "Our showroom and parts counter sit right here in Surrey at 64 Avenue, which means Surrey homeowners get our fastest response times and the deepest parts availability. From high-rise condos in City Centre to family homes in Bear Creek and acreages in Port Kells, our technicians repair fridges, washers, dryers, dishwashers, stoves, and freezers across every corner of the city — usually within days, not weeks.",
    neighbourhoods: ["City Centre", "Guildford", "Bear Creek", "Bridgeview", "Port Kells", "Sullivan Station"],
    faq: {
      question: "How quickly can you repair an appliance in Surrey?",
      answer:
        "Because our shop is located in Surrey, we can usually offer same-week — and often next-day — appointments anywhere in the city. Freezer and fridge failures are treated as priority calls.",
    },
  },
  {
    slug: "cloverdale",
    name: "Cloverdale",
    intro:
      "Cloverdale's mix of heritage homes and newer developments around Clayton Heights keeps our technicians busy with everything from decades-old chest freezers to brand-new smart appliances. We're just minutes away on 64 Avenue, so Cloverdale residents get quick appointments, honest flat-rate quotes, and repairs backed by a 90-day warranty.",
    neighbourhoods: ["Clayton Heights", "West Cloverdale", "East Clayton", "Cloverdale Town Centre"],
    faq: {
      question: "Do you service the newer homes in Clayton Heights?",
      answer:
        "Absolutely — Clayton Heights is one of our most common service areas. We regularly repair the stacked laundry units and slim-profile appliances common in newer Cloverdale townhomes.",
    },
  },
  {
    slug: "fleetwood",
    name: "Fleetwood",
    intro:
      "From townhome complexes along Fraser Highway to established family neighbourhoods near Francis Park, Fleetwood homeowners have trusted HomePro for years. Our Surrey shop is a short drive away, so we arrive on time with the common parts for major brands already on the truck — most Fleetwood repairs are finished in a single visit.",
    neighbourhoods: ["Fleetwood Tynehead", "Francis Park area", "Fraser Heights border", "Coyote Creek"],
    faq: {
      question: "Can you repair appliances in Fleetwood townhomes and condos?",
      answer:
        "Yes — a large share of our Fleetwood calls are townhouse and condo units. Our technicians are experienced with strata buildings, tight laundry closets, and stacked washer/dryer combos.",
    },
  },
  {
    slug: "newton",
    name: "Newton",
    intro:
      "Newton is one of Surrey's largest communities, and it's practically our backyard — our shop sits on its eastern edge. Whether it's a fridge that stopped cooling in a Strawberry Hill family home or a dishwasher leaking in a King George corridor condo, Newton customers can often get a technician out faster than anywhere else we serve.",
    neighbourhoods: ["Strawberry Hill", "Sullivan", "Panorama", "King George corridor", "Newton Town Centre"],
    faq: {
      question: "Why choose a local Newton appliance repair company?",
      answer:
        "Our physical shop and parts counter are right beside Newton, so you're not paying big travel fees or waiting a week for parts. Local also means accountable — we've built our name here on repeat customers.",
    },
  },
  {
    slug: "whalley",
    name: "Whalley",
    intro:
      "Whalley and Surrey City Centre are growing fast, with new towers rising around the SkyTrain and established homes on the quieter streets behind them. We repair the compact and European-style appliances common in new condos as well as full-size machines in older houses — with strata-friendly scheduling for high-rise buildings.",
    neighbourhoods: ["Surrey City Centre", "Gateway", "Forsyth Park area", "Whalley Athletic Park area"],
    faq: {
      question: "Do you repair appliances in Whalley high-rise condos?",
      answer:
        "Yes — we work in high-rises around Surrey City Centre regularly. We can coordinate with building managers for elevator bookings and follow strata rules for in-suite work.",
    },
  },
  {
    slug: "panorama-ridge",
    name: "Panorama Ridge",
    intro:
      "Panorama Ridge homes tend to be larger — and so are their appliance setups, from double wall ovens to oversized French-door fridges. Our technicians handle premium and built-in appliances with the care these homes deserve, and our Surrey shop is only minutes away for fast follow-up if a special-order part is needed.",
    neighbourhoods: ["Panorama Ridge", "Sullivan Heights", "Boundary Park area"],
    faq: {
      question: "Can you service built-in and panel-ready appliances in Panorama Ridge?",
      answer:
        "Yes — we regularly repair built-in fridges, wall ovens, and integrated dishwashers, and we take extra care with cabinetry and finished kitchens.",
    },
  },
  {
    slug: "white-rock",
    name: "White Rock",
    intro:
      "By the beach, salt air is hard on appliances — corrosion and moisture issues show up in White Rock machines more than anywhere else we service. Our technicians know the difference, whether we're repairing a dryer in a hillside home with ocean views or a condo dishwasher a block from Marine Drive.",
    neighbourhoods: ["Marine Drive", "East Beach", "West Beach", "White Rock uptown"],
    faq: {
      question: "Does living near the ocean really affect my appliances?",
      answer:
        "It can — salt air accelerates corrosion on condenser coils, connectors, and outdoor-adjacent laundry rooms. We factor that into diagnosis for White Rock homes and recommend simple prevention steps after every repair.",
    },
  },
  {
    slug: "south-surrey",
    name: "South Surrey",
    intro:
      "From Morgan Creek and Grandview Heights to established Ocean Park neighbourhoods, South Surrey homes often feature premium appliance packages — and when a high-end fridge or induction range fails, you want a technician who knows the brand. We repair everything from builder-grade to luxury units, with honest advice on repair versus replace.",
    neighbourhoods: ["Morgan Creek", "Grandview Heights", "Ocean Park", "Elgin Chantrell", "Rosemary Heights"],
    faq: {
      question: "Do you repair high-end appliance brands in South Surrey?",
      answer:
        "Yes — we service premium brands including Bosch, KitchenAid, and Miele alongside all the mainstream makes. We'll give you a straight answer on whether a repair is worth it.",
    },
  },
  {
    slug: "crescent-beach",
    name: "Crescent Beach",
    intro:
      "Crescent Beach's charming seaside cottages and renovated character homes come with quirks — older wiring, compact kitchens, and appliances that have seen a few decades of salt air. We love working in this neighbourhood and bring the patience (and the parts) that older and space-constrained installations demand.",
    neighbourhoods: ["Crescent Beach village", "Crescent Heights", "Ocean Park border"],
    faq: {
      question: "Can you repair older appliances in Crescent Beach character homes?",
      answer:
        "Often, yes — and our Surrey parts counter stocks components for older models that other services write off. If a repair isn't practical, we'll say so honestly and help you find a right-sized replacement.",
    },
  },
  {
    slug: "delta",
    name: "Delta",
    intro:
      "From North Delta family neighbourhoods along Scott Road to homes near Burns Bog, Delta is a quick hop from our Surrey shop. Delta customers get the same fast scheduling as our Surrey neighbours — with technicians who arrive on time, quote a flat rate up front, and back every repair with a 90-day warranty.",
    neighbourhoods: ["North Delta", "Scottsdale", "Nordel", "Annieville", "Sunshine Hills"],
    faq: {
      question: "Do you charge extra to come out to Delta?",
      answer:
        "No — Delta is part of our core service area. North Delta in particular is just minutes from our shop, so response times match what Surrey customers get.",
    },
  },
  {
    slug: "tsawwassen",
    name: "Tsawwassen",
    intro:
      "Tsawwassen's sunny climate is easy on people but its distance from most repair shops means long waits — unless you call us. We schedule Tsawwassen appointments in efficient routes so you get a firm arrival window, not a four-hour guess, whether you're in Beach Grove, English Bluff, or the newer TFN developments.",
    neighbourhoods: ["Beach Grove", "English Bluff", "Cliff Drive", "Tsawwassen Springs"],
    faq: {
      question: "How soon can a technician get to Tsawwassen?",
      answer:
        "We run scheduled routes through South Delta most weeks, so you'll typically get an appointment within a few days — with a firm arrival window confirmed the day before.",
    },
  },
  {
    slug: "ladner",
    name: "Ladner",
    intro:
      "Ladner Village's heritage homes and the newer developments around Hawthorne come with very different appliance needs, and we handle both. Our technicians repair everything from a decades-old chest freezer on a farm property to the latest smart washer in a new build — with parts support from our Surrey counter.",
    neighbourhoods: ["Ladner Village", "Hawthorne", "Port Guichon", "East Ladner"],
    faq: {
      question: "Do you service rural properties around Ladner?",
      answer:
        "Yes — farm and acreage calls around East Ladner and Westham Island are no problem. Let us know about long driveways or outbuildings when you book so we can plan the visit.",
    },
  },
  {
    slug: "langley",
    name: "Langley",
    intro:
      "Langley City and the Township cover a lot of ground — Willoughby's new townhome communities, Walnut Grove family homes, Brookswood acreages, and everything between. We cross the Surrey–Langley border dozens of times a week, so appointments are easy to get and our techs arrive with common parts for every major brand.",
    neighbourhoods: ["Willoughby", "Walnut Grove", "Brookswood", "Murrayville", "Fort Langley", "Aldergrove"],
    faq: {
      question: "Do you cover both Langley City and the Township?",
      answer:
        "Yes — from Langley City to Fort Langley and out to Aldergrove. Rural Township addresses are welcome; just mention any access details when booking.",
    },
  },
  {
    slug: "new-westminster",
    name: "New Westminster",
    intro:
      "New West's mix of heritage Queen's Park homes, Sapperton walk-ups, and Quayside towers means our technicians see every appliance vintage imaginable in a single day. We're experienced with the compact and stacked units common in the city's older buildings and can coordinate with building managers for condo repairs.",
    neighbourhoods: ["Queen's Park", "Sapperton", "Quayside", "Uptown", "Queensborough"],
    faq: {
      question: "Can you repair appliances in older New Westminster buildings?",
      answer:
        "Yes — older buildings are a specialty. We're used to compact European units, tight laundry closets, and the coordination that strata and rental buildings require.",
    },
  },
  {
    slug: "burnaby",
    name: "Burnaby",
    intro:
      "From Metrotown high-rises to Burnaby Heights bungalows, Burnaby is firmly inside our service area. Condo dwellers appreciate that we handle elevator bookings and strata requirements without fuss, while homeowners in Deer Lake and Capitol Hill get the same flat-rate quotes and 90-day warranty we offer every customer.",
    neighbourhoods: ["Metrotown", "Brentwood", "Burnaby Heights", "Deer Lake", "Edmonds", "Capitol Hill"],
    faq: {
      question: "Do you repair appliances in Burnaby condo towers?",
      answer:
        "All the time — Metrotown and Brentwood are regular stops. We'll coordinate elevator access with your building and work within strata-approved hours.",
    },
  },
  {
    slug: "coquitlam",
    name: "Coquitlam",
    intro:
      "Whether it's a fridge on Burke Mountain, a washer in a Maillardville character home, or a wall oven in a Westwood Plateau kitchen, Coquitlam homeowners can count on prompt, professional service. We batch Tri-Cities appointments for efficient routing, which keeps our pricing flat and our arrival windows honest.",
    neighbourhoods: ["Burke Mountain", "Westwood Plateau", "Maillardville", "Austin Heights", "Coquitlam Centre area"],
    faq: {
      question: "Do you serve Port Coquitlam and Port Moody too?",
      answer:
        "Yes — our Tri-Cities routes cover Coquitlam, Port Coquitlam, and Port Moody. Book online or call and we'll fit you into the next route day.",
    },
  },
  {
    slug: "richmond",
    name: "Richmond",
    intro:
      "Richmond kitchens range from compact condo setups in the City Centre to spacious family homes in Steveston and Terra Nova — and we repair appliances in all of them. Our technicians are familiar with the premium and imported brands popular in Richmond and carry common parts for every major make.",
    neighbourhoods: ["City Centre", "Steveston", "Terra Nova", "Broadmoor", "Hamilton"],
    faq: {
      question: "Do you repair imported and luxury appliance brands in Richmond?",
      answer:
        "Yes — alongside mainstream brands we service premium makes like Bosch, Miele, and KitchenAid. If a specialty part needs ordering, our Surrey parts counter handles it quickly.",
    },
  },
  {
    slug: "vancouver",
    name: "Vancouver",
    intro:
      "From East Van character homes to downtown condos and Kerrisdale kitchens, Vancouver customers choose HomePro for straight answers and flat-rate pricing in a city where service calls can get expensive. We handle the compact, stacked, and European appliances common in Vancouver's condos as confidently as full-size machines in detached homes.",
    neighbourhoods: ["East Vancouver", "Kitsilano", "Kerrisdale", "Mount Pleasant", "Downtown", "Dunbar"],
    faq: {
      question: "Is your pricing the same for Vancouver as for Surrey?",
      answer:
        "Yes — flat-rate quotes, no fuel surcharges, no zone pricing. You'll know the full cost before any work begins, wherever you are in Vancouver.",
    },
  },
  {
    slug: "north-vancouver",
    name: "North Vancouver",
    intro:
      "North Vancouver's steep streets and mountain weather don't slow us down. We repair appliances from Lower Lonsdale condo towers to Lynn Valley family homes and Deep Cove cottages, bringing the right parts across the bridge the first time so your repair isn't held hostage by a second trip.",
    neighbourhoods: ["Lower Lonsdale", "Lynn Valley", "Deep Cove", "Edgemont", "Capilano"],
    faq: {
      question: "How do you handle repairs across the bridge in North Vancouver?",
      answer:
        "We group North Shore appointments into dedicated route days and confirm your window in advance, so bridge traffic never turns into a missed appointment.",
    },
  },
  {
    slug: "maple-ridge",
    name: "Maple Ridge",
    intro:
      "Maple Ridge homeowners — from Silver Valley's newer builds to acreages out toward Whonnock — often wait too long for appliance service from Vancouver-based companies. We route regular service days through Maple Ridge and Pitt Meadows, bringing fast, warrantied repairs to the eastern edge of the Lower Mainland.",
    neighbourhoods: ["Silver Valley", "Albion", "Hammond", "Whonnock", "Websters Corners"],
    faq: {
      question: "Do you also cover Pitt Meadows?",
      answer:
        "Yes — Pitt Meadows is on the same route days as Maple Ridge, so appointments are just as easy to get.",
    },
  },
];

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
