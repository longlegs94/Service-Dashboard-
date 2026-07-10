# HomePro Appliances — Strategic Roadmap

*The strategy layer. `BLUEPRINT.md` is the execution layer under it. Written 2026-07-05
from the CPO/CEO seat. Revisit quarterly; every feature request gets tested against §1.*

---

## 1. The thesis: stop being a repair shop

Every competitor in the Lower Mainland is one of three things: an invisible one-van
operator, a boomer-era shop with a dead website, or a lead-gen aggregator (HomeStars,
Jiffy) that taxes the customer relationship and owns *your* reviews. None of them own
the full appliance lifecycle. HomePro already physically does — it just doesn't sell
itself that way.

**Positioning: "The appliance lifecycle company."**

```
        ┌────────────────────────────────────────────────────────┐
        │                                                        │
   DIAGNOSE (free, AI) → REPAIR → PARTS (DIY) → REPLACE (refurb) │
        ▲                                                        │
        └── MAINTAIN (care plan) ←── RECYCLE (paid pickup) ◄─────┘
                                      │
                                      └─► PARTS HARVESTING (inventory at negative cost)
```

Every stage monetizes, every stage feeds the next, and the loop closes: recycled
machines become the used-parts inventory that the AI helper sells. A van-only
competitor cannot copy this — they have no shop, no parts counter, no intake stream.
The sustainability story ("we keep appliances out of the landfill") is free marketing
that fits BC's culture and the growing Right-to-Repair movement.

**The moats, ranked by durability:**
1. **The data loop** — every chat, booking, and repair builds a local symptom→fix→part
   dataset nobody else has (see §4).
2. **The physical loop** — shop + parts counter + recycling intake.
3. **Trust stack** — reviews + radical price transparency + warranty (buildable fast,
   copyable slowly).
4. The website/AI itself (least durable — copyable in a year; that's why we keep moving).

---

## 2. Horizon 1 — WIN THE PANIC MOMENT (months 0–3)

Goal: when an appliance dies anywhere from Vancouver to Langley, HomePro is the fastest
credible answer. Target: **20+ web bookings/week, 25+ new Google reviews, parts store live.**

| # | Move | Why it pays |
|---|---|---|
| 1.1 | Finish launch gates (BLUEPRINT §1) | Everything below is blocked on this |
| 1.2 | **Review engine**: post-repair SMS/email with direct Google-review link; reviews auto-surface on site | #1 local-SEO ranking factor; compounds forever |
| 1.3 | **Parts store v1** on Shopify (BLUEPRINT §2) | Second revenue line; inventory already exists |
| 1.4 | **Radical price transparency page**: publish flat-rate repair menu | Nobody local dares; instant differentiation + "appliance repair cost" SEO traffic |
| 1.5 | **Booking deposits** (Stripe/Shopify link) | Kills no-shows; ~15–20% revenue protection |
| 1.6 | Google Business Profile weekly cadence + Local Services Ads pilot ($500/mo cap) | LSA = pay-per-lead with Google Guarantee badge; fastest paid channel for home services |
| 1.7 | **"Fix or Replace?" calculator** (interactive, shareable) | Lead magnet + SEO asset; funnels BOTH ways — repair booking or refurb sale. Honest answers build the trust brand |

## 3. Horizon 2 — OWN THE LIFECYCLE (months 3–9)

Goal: revenue that doesn't depend on today's Google ranking. Target: **30% of revenue
from non-emergency sources (B2B, plans, parts).**

| # | Move | Why it pays |
|---|---|---|
| 2.1 | **Diagnosis-to-cart** ⭐ the signature feature: AI helper identifies the likely part → links the exact in-stock used part + install difficulty rating → "DIY it ($45 part)" or "We'll do it (book now)" | Monetizes BOTH outcomes of every conversation. No local or national player does this. This is the "tech startup taking over the industry" feature |
| 2.2 | **Landlord & property-manager program** ⭐ biggest untapped line: multi-unit accounts, priority SLA, tenant-direct booking billed to the PM, monthly consolidated invoices (QuickBooks connector already in our stack) | Surrey/Burnaby rental stock is enormous. B2B = recurring, high-LTV, zero ad spend, books revenue in slow seasons |
| 2.3 | **HomePro Care Plan** ($15–20/mo: annual tune-up, priority line, 10% parts discount) | Recurring revenue floor; 200 members ≈ $40k/yr baseline |
| 2.4 | **Harvest-to-inventory ops**: recycling intake triaged against parts-demand data — salvage exactly what sells, photo → AI-generated Shopify listing in minutes | Inventory acquired at *negative* cost (paid pickup fees) with data-guided margins |
| 2.5 | **Punjabi + Hindi site versions** (booking + home + top services) | One of Canada's largest Punjabi-speaking markets, ~zero competitor coverage; cheap to build with our content architecture |
| 2.6 | Photo diagnosis in the AI helper (rating plate / error code upload) | Better triage → better part matching → feeds 2.1 |
| 2.7 | Warranty-work partnerships (brands, extended-warranty cos) | Steady volume feed independent of marketing |

## 4. Horizon 3 — BECOME THE PLATFORM (months 9–24)

Goal: turn the operating stack itself into an asset. The shop is the proof-of-concept;
the **platform** is the company.

| # | Move | Why it pays |
|---|---|---|
| 3.1 | **Predictive maintenance from the data loop**: "Your 2019 LG fridge model shows compressor failures around year 7 — book a $49 checkup" (email/SMS to repair history list) | Converts the dataset into demand generation; feels like magic, is just SQL |
| 3.2 | **Customer home profile**: every address gets an appliance inventory + service history; renewal-style reminders | Lifetime relationship instead of one-off transactions |
| 3.3 | Second-metro expansion (Fraser Valley: Abbotsford/Chilliwack) using the exact playbook — site pages, GBP, one van | The playbook is now proven and cheap to replicate |
| 3.4 | **"HomePro OS" licensing pilot** ⭐ the endgame: package the stack (site + AI triage + booking + parts flow + skills library) and license it to ONE independent repair shop in another city as SaaS ($300–500/mo) | If it works, the TAM stops being "Surrey repairs" and becomes "every independent repair shop in North America." The AI-maintainable codebase (skills library) is literally the product |
| 3.5 | Fleet/dispatch software for our own techs (rebuild the archived job-app lean) | Prereq for 3.3/3.4; margin via utilization |

---

## 5. Financial sketch (conservative, CAD, for planning not promises)

| Stream | Unit economics | Month-6 base case | Month-18 target |
|---|---|---|---|
| Repairs (web-booked) | ~$300 avg ticket | 15/wk ≈ $18k/mo | 30/wk ≈ $36k/mo |
| Parts orders | ~$80 avg, ~60% margin | 10/wk ≈ $3.2k/mo | 40/wk ≈ $12.8k/mo |
| Refurb appliances | ~$600 avg | 4/mo ≈ $2.4k/mo | 12/mo ≈ $7.2k/mo |
| Care Plan members | $18/mo | 50 ≈ $0.9k/mo | 300 ≈ $5.4k/mo |
| PM/B2B contracts | ~$150/door/yr | 100 doors ≈ $1.2k/mo | 600 doors ≈ $7.5k/mo |
| HomePro OS | $400/mo/shop | — | 3 shops ≈ $1.2k/mo |

Web-attributed total: **~$26k/mo month-6 → ~$70k/mo month-18** (excludes walk-in/phone
business). Fixed digital cost stays under ~$120/mo + ad budget. The point of the table:
**no single stream needs to be heroic** — six mediocre streams beat one great one, and
four of the six are recession-resistant (people fix, not replace, in downturns).

## 6. What we will NOT do (discipline list)

- No lead-gen marketplaces (HomeStars etc.) — they rent us our own customers.
- No general handyman scope creep — appliance depth IS the brand.
- No custom checkout/payment code — Shopify/Stripe carry that risk.
- No paid social until LSA + SEO channels are saturated (home services intent lives in search).
- No feature that violates the trust brand (dark patterns, fake urgency, invented reviews —
  the last is already a hard owner rule).

## 7. KPIs on the wall

| Horizon 1 | Horizon 2 | Horizon 3 |
|---|---|---|
| Web bookings/wk | Non-emergency revenue % | Repeat-customer rate |
| Google reviews count + avg | Care Plan members | Predictive-campaign conversion |
| "appliance repair {city}" rankings | PM doors under contract | Second-metro payback period |
| AI chat → booking conversion | Parts attach rate on chats | OS pilot NPS |

## 8. Operating cadence

- **Weekly** (owner, 15 min): bookings, reviews, parts orders — three numbers, one Claude
  session: "give me the weekly numbers and the one thing to fix."
- **Monthly**: pick next BLUEPRINT items; Claude delegates builds per the §7 protocol
  (Fable 5 plans/reviews, Sonnet builds, Haiku edits).
- **Quarterly**: revisit this document; kill anything that missed two quarters of KPIs.

## 9. Top risks & mitigations

| Risk | Mitigation |
|---|---|
| Google algorithm/ranking dependence | Horizon 2 exists precisely to diversify (B2B, plans, repeat) |
| Owner is the bottleneck (solo operator) | Ruthless automation: review asks, booking confirmations, listing generation are all automated by design |
| Supabase/Vercel free tiers pause or throttle | Upgrade triggers documented in skills; ~$45/mo fixes both when volume justifies |
| Copycat builds the same site | The data loop, review base, and physical loop don't copy; keep shipping H2 features |
| Refurb/parts liability | 90-day warranty scoped in writing; tested-condition labeling on every listing |
