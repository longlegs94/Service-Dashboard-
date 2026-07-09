# HomePro Appliances — Website Blueprint & Monetization Roadmap

*Master plan of record. Written 2026-07-05. Update phase statuses as work lands.*
*Execution model: Fable 5 orchestrates and reviews; implementation work is delegated to
cheaper models (Haiku = mechanical edits, Sonnet = feature builds) — see §7.*

---

## 0. Where the business makes money (the point of all of this)

| Revenue stream | Status | Engine on the site |
|---|---|---|
| **Repair bookings** (core, highest margin) | LIVE | `/book` wizard + AI helper funnel + 20 SEO city pages |
| **Used appliance parts sales** | Phase 2 (next) | `/parts` storefront powered by Shopify |
| Refurbished / dent & scratch appliance sales | Phase 3 | Extend the Shopify catalog with an "Appliances" collection |
| Maintenance memberships (annual tune-up plan) | Phase 4 | Recurring revenue; Shopify subscriptions or Stripe |
| Priority / same-day service fee | Phase 4 | Paid upgrade in the booking wizard |
| Appliance recycling pickup fee | Phase 4 | Add-on service in wizard |

North-star metrics: **booked repairs/week**, **parts orders/week**, **Google ranking for
"appliance repair {city}"**, **AI-chat → booking conversion rate**.

---

## 1. Phase 1 — GO LIVE (in progress; blocking everything else)

The executable runbook lives in `.claude/skills/homepro-launch-campaign/SKILL.md`. Summary:

- [ ] **Gate 0** — owner opens `service-dashboard-momj.vercel.app` in incognito; if login wall → disable Deployment Protection
- [ ] **Gate 1** — all 5 env vars in Vercel (`homepro-config-and-env` skill has values) + redeploy
- [ ] **Gate 3** — one real booking round-trip: confirmation → Supabase row → email; delete test row
- [ ] **Gate 4** — GoDaddy DNS cutover to Vercel (replaces the current Wix site — owner go-ahead required)
- [ ] **Gate 5** — update `siteUrl`, submit sitemap to Search Console, replace placeholder testimonials + confirm business email

**Cost:** $0/mo (Vercel Hobby + Supabase Free) + ~pennies of Anthropic usage.

---

## 2. Phase 2 — PARTS STORE (Shopify) 💰

**Decision (2026-07-05): Shopify, not Square.** Reasons: native CSV import *with photo URLs*,
best-in-class admin app for adding items individually (photo from phone camera → live in
minutes), Storefront API for clean embedding into this site, session already has a Shopify
connector so Claude can manage products conversationally. Square remains a good future
POS for in-store card payments; the two can coexist.

### Architecture

```
Shopify (system of record: products, photos, inventory, orders, payments)
   │  Storefront API (public token, read-only)
   ▼
/parts            — catalog grid: search, filter by appliance type/brand
/parts/[handle]   — product detail + "Buy now" (Shopify checkout link)
```

- Site stays statically fast: catalog pages revalidate on a timer (ISR) so new products
  appear without a redeploy.
- Checkout happens on Shopify's hosted checkout (PCI compliance handled). No cart state
  to build on our side for v1 — "Buy now" per item fits used-parts shopping (qty 1 items).
- **Admin = Shopify admin.** CSV bulk upload (their template + image URLs) or the mobile
  app for one-off listings. No custom admin software to build or maintain.

### Owner setup (once, ~30 min)
1. Create the store — **Shopify Basic** (~CAD $51/mo, or Starter ~$7/mo if only Buy-links
   are needed; Basic recommended for the full catalog + shipping labels).
2. Re-authorize the **Shopify connector** in claude.ai settings so Claude can create/manage
   products, collections, and discounts for you conversationally.
3. Send Claude the Storefront API token (Settings → Apps → Develop apps → Storefront API,
   read products scope) → goes into Vercel env as `SHOPIFY_STOREFRONT_TOKEN` + `SHOPIFY_STORE_DOMAIN`.

### Build (delegated to Sonnet agent when tokens allow)
- [ ] `/parts` + `/parts/[handle]` pages (Storefront API, ISR, graceful "store coming soon"
      fallback when env unset — consistent with the architecture contract)
- [ ] Part fields convention: title, price, condition (used/tested/refurb), fits-brands,
      appliance type (as Shopify tags → site filters), model-number compatibility in body
- [ ] Nav + footer links, "Parts" promo section on home page
- [ ] SEO: product JSON-LD, parts sitemap entries
- [ ] Skill: `homepro-parts-store` (how products flow, CSV template, re-verification)

**CSV template for bulk upload** (Shopify's format): Handle, Title, Body (HTML),
Vendor, Tags (`fridge, samsung, used-tested`), Variant Price, Variant Inventory Qty,
Image Src (public URL). Claude can generate a pre-filled template from a plain
spreadsheet/photo folder whenever needed.

---

## 3. Phase 3 — CONVERSION & TRUST (each item ≤ a day of delegated work)

- [ ] **Real reviews engine**: replace placeholders; add post-repair review-request email/SMS
      with direct Google-review link (biggest local-SEO lever there is)
- [ ] **Deposit/prepay on booking** (Stripe or Shopify checkout link) — cuts no-shows
- [ ] **SMS notifications** (Twilio): booking confirmation + "technician on the way"
- [ ] **Before/after gallery** + real shop/team photos replacing illustrations
- [ ] **Refurbished appliances collection** on Shopify (higher ticket than parts)
- [ ] **Punjabi + Hindi landing pages** (`/pa`, `/hi` home + booking): Surrey has one of
      Canada's largest Punjabi-speaking communities — near-zero competitor coverage
- [ ] Google Business Profile optimization + weekly posts; Local Services Ads pilot budget

## 4. Phase 4 — RECURRING REVENUE & OPS

- [ ] **HomePro Care Plan**: $12–20/mo membership (annual tune-up, priority scheduling,
      10% off parts) — Shopify subscriptions; target 100 members = stable base income
- [ ] Priority same-day service fee as a wizard upsell
- [ ] Customer accounts: repair history per address (Supabase Auth) → repeat bookings
- [ ] Simple dispatch board for technicians (the old job-management app archive is a
      reference; rebuild lean on the existing Supabase project)
- [ ] QuickBooks connector for invoices/books (connector already available in session)

## 5. Phase 5 — SCALE THE MOAT

- [ ] Content engine: 2 SEO articles/mo ("dryer error codes {brand}", "is it worth fixing…")
      generated → owner-reviewed → published; each targets a long-tail repair query
- [ ] Service-area expansion pages (Abbotsford, Mission, Chilliwack…) as routes justify
- [ ] AI helper v2: photo diagnosis (customer uploads a photo of the rating plate/error
      code), part-number lookup that links straight to `/parts` listings — chat becomes a
      parts sales channel
- [ ] Seasonal campaigns (spring AC/fridge, holiday oven rush) via email list from bookings

---

## 6. Cost & tooling summary

| Item | Monthly |
|---|---|
| Vercel Hobby / Supabase Free / GoDaddy DNS | $0 |
| Anthropic API (chat, Haiku) | ~$1–5 at realistic traffic |
| Resend email | $0 (free tier) |
| **Shopify Basic** (Phase 2) | ~CAD $51 (Starter alternative ~$7) |
| Twilio SMS (Phase 3) | ~$0.01/msg |
| Google LSA budget (optional) | owner-set |

## 7. How future work gets done (delegation protocol)

| Task type | Model | Examples |
|---|---|---|
| Planning, architecture, review, anything customer-visible-risky | **Fable 5** (orchestrator) | this blueprint, code review, Shopify schema decisions |
| Feature builds, design work, multi-file changes | **Sonnet subagent** | /parts pages, animations, admin flows |
| Mechanical edits, content swaps, copy, CSV generation | **Haiku subagent** | testimonial swap, add a city, product CSV fill |

Every delegated task must: read `CLAUDE.md` + relevant `.claude/skills/*` first, pass
`npm run build && npm run lint`, run the 16-check verification script for site changes,
and leave the tree uncommitted for orchestrator review. Session limits: when a limit
resets, resume from this file + `git status` — phases above are ordered by ROI.

## 8. Current state snapshot (2026-07-05)

Built & deployed: 31-page site (6 services, 20 city SEO pages), booking wizard →
Supabase (live, verified) + Resend email, Claude AI diagnosis chat with safety rules,
JSON-LD/sitemap/OG SEO layer, editorial redesign (Bricolage display font, dark hero,
flat poster-style art), 12-skill maintenance library in `.claude/skills/`.
In flight: tech-startup animation pass (delegated). Blocking owner actions: Vercel
env vars + incognito reachability check; Shopify store creation + connector re-auth.
