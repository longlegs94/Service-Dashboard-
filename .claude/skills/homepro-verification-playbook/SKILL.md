---
name: homepro-verification-playbook
description: >
  What counts as EVIDENCE that a HomePro website change works, and how to gather it
  before pushing: the build+lint gate, the shipped Playwright click-through script,
  the honest-screenshot recipe (scroll-reveal-safe), API probes for /api/bookings and
  /api/chat, and JSON-LD/sitemap checks. Load this before claiming "done", "fixed",
  "verified", or "works", before any push of a code change, when asked to screenshot
  the site, or when writing new tests/checks. The screenshot recipe is mandatory —
  naive full-page captures show blank sections and cause false bug reports.
---

# HomePro verification playbook

Rule zero: **a change is verified when you have OBSERVED the changed behavior**, not
when the build passes. Build passing = it compiles. Evidence = you exercised it.

**When NOT to use this skill:** something is failing and you don't know why →
`homepro-debugging-playbook`. Environment won't even start → `homepro-build-and-env`.

## The evidence ladder (do the highest rung that applies)

| Change type | Minimum evidence |
|---|---|
| Content edit | `npm run build` passes + the new text visible on the rendered page |
| Component/style | Build + lint pass + dev-server look at the changed page, desktop AND 390px mobile width |
| Page/route/API change | All of the above + run the shipped verification script (below) |
| Booking/chat logic | Script + a manual end-to-end exercise of the flow (submit a booking / send a chat message) |
| Schema change | All 4 layers changed together + a real round-trip insert (see `homepro-booking-pipeline`) |

## The shipped script

`scripts/verify-site.js` (in this skill's directory) runs 16 checks: all 9 pages
return 200 with expected content, booking route validates, chat route reachable
(reports live-AI vs fallback mode), sitemap/robots/JSON-LD valid, honest screenshots,
zero page JS errors. Tested green 16/16 on 2026-07-04.

```bash
npm run build && (npm run start &) && sleep 4
NODE_PATH=/opt/node22/lib/node_modules node .claude/skills/homepro-verification-playbook/scripts/verify-site.js
# optional args: [baseUrl] [screenshotDir]
```

Exit code 1 = at least one FAIL; the output names it. Extend the script when adding
pages (add to its `pages` array) — keep it the single click-through of record.

## The honest-screenshot recipe (mandatory)

Sections animate in on scroll (Framer Motion `whileInView`, `initial opacity:0`).
A naive `fullPage: true` screenshot shows the hero followed by blank sections — this
is an illusion, not a bug. To capture truthfully:

```js
// 1. defeat smooth-scroll (it makes fast programmatic scrolls outrun the observer)
await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
// 2. scroll stepwise so IntersectionObserver fires for every section
const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= h; y += 700) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(350);
}
// 3. return to top, settle, then capture
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);
await page.screenshot({ path: "home.png", fullPage: true });
```

(The shipped script's `fullReveal()` implements exactly this.)

## API probes (curl, no browser needed)

```bash
# Route alive + validation working (400 expected — runs BEFORE env checks):
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/bookings \
  -H 'Content-Type: application/json' -d '{}'          # expect 400

# Chat mode check (200 = live AI, 503 = designed no-key fallback):
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"hi"}]}'   # expect 200 or 503

# Supabase-env probe: POST a VALID booking (503 = env missing; 200 = SAVED A REAL
# ROW — note the reference in the response and delete it from Supabase afterwards).
# Full payload in homepro-debugging-playbook.
```

## SEO spot-checks

```bash
curl -s localhost:3000/sitemap.xml | grep -c "<url>"      # expect 33 (7 static + 6 services + 20 cities)
curl -s localhost:3000/robots.txt                          # expect sitemap line + /api/ disallow
curl -s localhost:3000/ | grep -o 'application/ld+json' | wc -l   # expect ≥ 2
```

Validate JSON-LD content at https://validator.schema.org (paste page source) after
structured-data changes.

## Reporting results honestly

State what you ran and what you observed, including failures. "16/16 checks passed"
with the command beats "everything works". If a check was skipped (e.g., email path
untested because no Resend key), say so explicitly — silence reads as tested.

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Script still green | run the script (command above) |
| Sitemap count (grows with cities/services) | `curl -s localhost:3000/sitemap.xml \| grep -c "<url>"` must equal 7 static + `grep -c 'slug: "' src/content/services.ts` + `grep -c 'slug: "' src/content/cities.ts` (33 as of 2026-07-04) |
| Scroll-reveal still applies | `grep -n "whileInView" src/components/ui/reveal.tsx` |
| Booking validation-before-env order | `grep -n "safeParse\|getSupabaseAdmin" src/app/api/bookings/route.ts` (safeParse line must come first) |
