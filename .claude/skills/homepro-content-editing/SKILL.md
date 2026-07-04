---
name: homepro-content-editing
description: >
  Step-by-step recipes for editing the HomePro website's content: change the phone
  number, email, address, or hours; add/edit a service-area city page; add/edit a
  repair service; replace placeholder testimonials with real reviews; edit FAQs;
  change brand colors; swap images for real photos. Load this whenever the user asks
  to "update the site", "change the copy", "add a city", "add a service", "put in our
  real reviews", "change the colors", "use our photos", or any text/content change.
  Each recipe names the exact file, the fields, and the verification command.
---

# HomePro content editing recipes

All content lives in `src/content/` (typed TypeScript — a wrong edit fails the build,
which is the safety net). After ANY recipe: `npm run build` must pass before pushing.

**When NOT to use this skill:** new components/layout/behavior → treat as code change
per `homepro-change-control`. SEO strategy (what to write for rankings) →
`homepro-seo-playbook`. Two hard rules from change-control apply to every recipe here:
**business facts must be verified-true**, and **no invented reviews or claims**.

## Recipe: change phone / email / address / hours

File: `src/content/business.ts`

- `phone` (display format) AND `phoneHref` (`tel:+1...` — digits only after tel:+) —
  change BOTH.
- `email` — currently a placeholder guess (see NOTE comment); confirm with owner.
- `address.*` — also feeds JSON-LD structured data and the contact-page map (map query
  is built from address fields; no separate edit needed).
- `hours` (display) AND `hoursSchema` (schema.org format for structured data) —
  change BOTH.

Verify: `npm run build` then check header, footer, `/contact` render the new value
(`grep -rn "<new value>" .next/server/app/contact.html` or view in dev server).

## Recipe: add a service-area city page

File: `src/content/cities.ts` — copy an existing entry, then:

1. `slug`: lowercase-hyphenated (becomes `/service-areas/<slug>`).
2. `intro`: **write a genuinely UNIQUE paragraph** — mention real local geography,
   housing stock, or service logistics. NEVER copy another city's intro and swap the
   name; near-duplicate pages hurt Google rankings (thin-content rule, CLAUDE.md).
3. `neighbourhoods`: 3–6 real neighbourhood names in that city.
4. `faq`: one city-specific Q&A (feeds FAQPage structured data).

The page, sitemap entry, and footer/section links generate automatically.
Verify: `npm run build` → new path listed under `/service-areas/[city]`.

## Recipe: add a repair service

File: `src/content/services.ts` — copy an entry, then:

1. `slug` (`/services/<slug>`), `name`, `shortName` (used in booking form + nav),
   `headline`, `summary`, `description`.
2. `icon`: must be one of the keys in `src/components/ui/service-icon.tsx`
   (`fridge|washer|dryer|dishwasher|stove|freezer`). A NEW appliance type needs a new
   SVG added there first (code change) and the `icon` union type extended.
3. `symptoms` (6ish bullets — also feed the AI helper's knowledge) and `faqs` (2).
4. `image`: add `public/images/service-<name>.jpg` (1200×900); `imageAlt` describes it.

The service page, booking-form option, footer link, and sitemap entry generate
automatically; the AI chat's system prompt picks up the new service on next deploy.
Verify: `npm run build` → new `/services/<slug>` path; `/book` shows the new appliance.

## Recipe: replace placeholder testimonials (REQUIRED before serious marketing)

File: `src/content/testimonials.ts`

- Current entries are labeled "Sample Review — replace me". Replace `quote`, `name`,
  `location`, `service`, `rating` with REAL reviews only (e.g., from the Google
  Business profile). Keep 3 entries for the layout (more is fine — grid wraps).
- **Never** invent a review, embellish a real one, or drop the placeholder label while
  keeping sample text.

Verify: `grep -c "replace me" src/content/testimonials.ts` → `0` only when all are real.

## Recipe: edit general FAQs

File: `src/content/faqs.ts` — plain question/answer objects; shown on the home page
accordion AND emitted as FAQPage structured data. Keep answers factual (warranty
length, hours, pricing policy must match `business.ts`).

## Recipe: change brand colors

File: `src/app/globals.css`, the `@theme` block.

- `--color-brand-*` = trust blue scale (50–900); `--color-accent-*` = CTA orange.
- Change the whole scale consistently (use an OKLCH/HSL ramp tool), not one stop.
- Components reference tokens like `bg-brand-700`, `text-accent-500` — no per-component
  edits needed.

Verify: `npm run dev` → check button contrast on hero, dark `how-it-works` section,
and the orange CTA banner. Keep white-on-brand-700 and white-on-accent-500 readable
(WCAG AA ≈ 4.5:1 contrast).

## Recipe: swap illustrations for real photos

Directory: `public/images/` — replace files KEEPING THE SAME NAMES:
`hero.jpg` (1600×1200), `why-us.jpg`, `about.jpg` (1600×1200), `og.jpg` (1200×630),
`service-fridge|washer|dryer|dishwasher|stove|freezer.jpg` (1200×900).

- Match aspect ratios (4:3 except og) — `next/image` uses `object-cover`, so off-ratio
  photos crop rather than distort, but keep subjects centered.
- Update the `imageAlt` fields in `src/content/services.ts` and alt props in
  `hero.tsx` / `why-us.tsx` / `about/page.tsx` to describe the real photos.
- Licensing: only photos the business owns or has license to use.

Verify: `npm run dev` → hero, a service page, about, and (via social-preview tools)
the OG image.

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Content file inventory | `ls src/content/` |
| Icon key union | `grep -n "icon:" src/content/services.ts \| head -1; grep -n "IconKey\|paths: Record" src/components/ui/service-icon.tsx` |
| Placeholder testimonial state | `grep -c "replace me" src/content/testimonials.ts` |
| Image filename contract | `ls public/images/` |
| City/service pages auto-generate | `grep -n "generateStaticParams" src/app/service-areas/[city]/page.tsx src/app/services/[slug]/page.tsx` |
| Theme token names | `grep -n "color-brand-700\|color-accent-500" src/app/globals.css` |
