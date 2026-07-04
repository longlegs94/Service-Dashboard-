---
name: homepro-seo-playbook
description: >
  The SEO system of the HomePro website and the discipline that keeps it working:
  the 20 city-page strategy and its unique-copy rule, JSON-LD structured data
  inventory (LocalBusiness/Service/FAQPage), per-page metadata patterns, sitemap and
  robots behavior, the siteUrl dependency, and post-launch search operations (Search
  Console, indexing). Load this when asked about "SEO", "Google ranking", "city
  pages", "why isn't the site showing up in search", "add a city for SEO", "meta
  tags", "structured data", "schema.org", "sitemap", or before editing anything in
  src/app/sitemap.ts, robots.ts, src/components/seo/, or city/service page copy.
---

# HomePro SEO playbook

Strategy in one line: **20 statically-generated city pages with genuinely local copy,
wrapped in complete structured data, targeting "appliance repair in {city}"**.

**When NOT to use this skill:** writing/editing the content itself →
`homepro-content-editing` (this skill defines the SEO constraints it must obey).
Verifying tags render → `homepro-verification-playbook`.

## The unique-copy rule (the load-bearing discipline)

Google devalues near-duplicate pages ("thin content" / "doorway pages"). Every city
page intro in `src/content/cities.ts` is individually written with real local
signals: neighbourhoods (e.g. Clayton Heights, Steveston, Lower Lonsdale), housing
stock (condo towers vs acreages), geography (salt air in White Rock, bridge routing
for North Vancouver). **Never** template-generate or copy-swap city intros. A new
city page with lazy copy hurts ALL city pages.

Each city page contains: unique intro, neighbourhood list, service links, one
city-specific FAQ (feeds FAQPage schema), CTA. Same structure, unique substance.

## Structured data inventory (`src/components/seo/json-ld.tsx`)

| Schema | Emitted | Where |
|---|---|---|
| `HomeAndConstructionBusiness` (LocalBusiness subtype) | site-wide, once | root layout — name, address, phone, hours, areaServed built from `business.ts` + `cities.ts` |
| `Service` | per service page | `src/app/services/[slug]/page.tsx` |
| `FAQPage` | any page with an FAQ section | via `FaqSection` component (home, service pages, city pages) |

After changing structured data, validate at https://validator.schema.org.

## Metadata pattern (repeat it for new pages)

- Root layout sets `metadataBase` (from `business.siteUrl`), a title TEMPLATE
  (`%s | HomePro Appliances`), OG/Twitter defaults with `/images/og.jpg`.
- Every page exports `metadata` or `generateMetadata` with: unique `title` (keyword
  first: "Appliance Repair in {city}, BC"), unique `description` (~150 chars, includes
  phone), and `alternates.canonical` (its own path).
- City/service pages build these from content-file fields — new entries get correct
  metadata automatically.

## Sitemap and robots

- `src/app/sitemap.ts` → `/sitemap.xml`: 7 static routes + all services + all cities
  (33 URLs as of 2026-07-04), priorities 1.0 home / 0.9 book / 0.8 city+service / 0.7 rest.
  New content entries appear automatically.
- `src/app/robots.ts` → `/robots.txt`: allow all, disallow `/api/`, sitemap pointer.
- Both derive absolute URLs from `business.siteUrl` — **wrong siteUrl = every
  canonical/sitemap URL wrong**. Update it the day the real domain goes live.

## Post-launch search operations (owner actions, in order)

1. Domain live on Vercel with HTTPS (see `homepro-launch-campaign`).
2. `business.siteUrl` updated + deployed BEFORE submitting anything to Google.
3. [Google Search Console](https://search.google.com/search-console): verify the
   domain property (DNS TXT record at GoDaddy), submit `https://<domain>/sitemap.xml`.
4. Google Business Profile: keep NAP (Name/Address/Phone) EXACTLY matching
   `business.ts` — NAP consistency is a local-ranking factor.
5. Expect city pages to index over days–weeks; check Search Console → Pages. Pages
   "Crawled - currently not indexed" for months usually means copy isn't
   differentiated enough — strengthen local signals rather than adding more pages.

## Honest expectations (no oversell)

Structured data and unique copy are necessary, not sufficient. Local rankings also
weigh reviews, citations, and proximity — outside this codebase. Claims like "this
will rank #1" are never warranted; "technically clean and well-differentiated" is
what this system delivers.

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Schema types emitted | `grep -n '"@type"' src/components/seo/json-ld.tsx` |
| Canonicals everywhere | `grep -rn "canonical" src/app --include="*.tsx" \| wc -l` (≥ 9) |
| Sitemap URL count | `curl -s localhost:3000/sitemap.xml \| grep -c "<url>"` (33 as of 2026-07-04) |
| siteUrl current value | `grep -n "siteUrl" src/content/business.ts` |
| City copy still unique | spot-read two intros in `src/content/cities.ts`; no shared sentences |
| OG image wired | `grep -n "og.jpg" src/app/layout.tsx` |
