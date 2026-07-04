---
name: homepro-architecture-contract
description: >
  The load-bearing design decisions of the HomePro website and the invariants that
  must hold through any change. Load this BEFORE any refactor, new feature, new page,
  new integration, or dependency change — and whenever tempted to: hardcode copy in a
  component, add Supabase RLS policies to the bookings table, import server secrets
  into a client component, make an SEO page dynamic, or bypass the shared Zod schema.
  Also load when a security scanner or Supabase advisor flags "RLS enabled no policy"
  (that finding is intentional here). Explains WHY each invariant exists and lists
  the known-weak points honestly.
---

# HomePro architecture contract

Six invariants. Breaking any of them is a regression even if the build stays green.

**When NOT to use this skill:** step-by-step edits → `homepro-content-editing`.
Debugging → `homepro-debugging-playbook`. Gates/branches → `homepro-change-control`.

## Invariant 1 — All copy lives in `src/content/`, never in components

Every human-readable business fact and marketing string is in
`src/content/{business,services,cities,testimonials,faqs}.ts`. Components import and
render them.

- **Why:** the owner edits via future AI sessions (stated 2026-07-04); one-file edits
  that can't break layout are the core UX of maintaining this site. A phone-number
  change updates header, footer, CTAs, contact page, and JSON-LD structured data at once.
- **Test:** adding a city or changing hours must touch exactly one file under
  `src/content/`.
- **Corollary:** never duplicate a business fact into a component; import it.

## Invariant 2 — Graceful degradation on missing config

Every external integration checks its env var and degrades to a friendly, working
state instead of crashing:

| Integration | Without its key | Where implemented |
|---|---|---|
| Anthropic chat | `/api/chat` returns 503 → widget shows call-us/book-now card | `src/app/api/chat/route.ts` (top of POST), `src/components/chat/use-chat.ts` (`unconfigured` status) |
| Supabase bookings | `/api/bookings` returns 503 with "call us" message | `src/lib/supabase-admin.ts` returns `null`; route handles it |
| Resend email | Send is skipped/caught; booking still succeeds | `src/app/api/bookings/route.ts` (email wrapped in try/catch AFTER insert) |

- **Why:** the site must be deployable before every account exists, and an expired key
  must never take down the whole site.
- **Rule for new integrations:** same pattern — probe env var, return a designed
  fallback, never throw to the user.

## Invariant 3 — Database is service-role-only (RLS with ZERO policies)

`public.bookings` has row-level security enabled and **no policies at all**. Only the
service-role key (server-side, in `/api/bookings`) can read/write. Supabase's linter
reports INFO `rls_enabled_no_policy` for this table — **that is the design, not a bug**.

- **Why:** booking rows are customer PII with no reason for any browser-side access.
  Zero policies is the smallest possible attack surface.
- **Never:** add anon/authenticated policies, expose the table via PostgREST, or use
  `SUPABASE_SERVICE_ROLE_KEY` anywhere that ships to the client.
- **Client/server boundary:** only env vars prefixed `NEXT_PUBLIC_` reach the browser
  (Next.js convention). `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`,
  `RESEND_API_KEY` are server-only; `src/lib/supabase-admin.ts` must never be imported
  from a `"use client"` file.

## Invariant 4 — One Zod schema validates both wizard and API

`src/lib/booking-schema.ts` exports `bookingSchema`; the booking wizard validates each
step with `bookingSchema.pick(...)` and `/api/bookings` validates the full payload
with the same object.

- **Why:** client and server can never disagree about what a valid booking is; a field
  added in one place fails loudly in the other.
- **Never:** hand-roll validation in the route or the wizard; extend the schema instead.
  Field changes follow the 4-place checklist in `homepro-booking-pipeline`.

## Invariant 5 — SEO pages are statically generated

Home, services (6), service-areas (20), about, contact, book, diagnose are all
prerendered (`○`/`●` in build output). Dynamic rendering is reserved for the two API
routes only. `generateStaticParams` in `src/app/services/[slug]/page.tsx` and
`src/app/service-areas/[city]/page.tsx` enumerate content files.

- **Why:** the 20 city pages are the SEO strategy; static HTML is the fastest and most
  reliably indexed form. A regression to dynamic rendering hurts rankings silently.
- **Test after any page-level change:** `npm run build` output still shows all city
  and service paths as prerendered.

## Invariant 6 — Images are referenced by fixed filename

Code references `public/images/hero.jpg`, `why-us.jpg`, `about.jpg`, `og.jpg`, and
`service-<icon>.jpg`. Current files are generated brand illustrations; the upgrade
path to real photography is file replacement with identical names.

- **Why:** lets a non-developer (or a content-only session) upgrade imagery with zero
  code risk.

## Known-weak points (stated plainly; candidates for improvement, not rules)

- **No CI and no test suite.** Gates are manual `npm run build && npm run lint`
  (see `homepro-change-control`). A GitHub Actions workflow running both would be a
  strict improvement.
- **Placeholder data still live:** testimonials are labeled samples; business email
  is an unconfirmed guess (`src/content/business.ts` has the NOTE).
- **Resend `from:` is `onboarding@resend.dev`** until a domain is verified in Resend —
  deliverability is reduced (`src/app/api/bookings/route.ts`).
- **Booking reference (`HP-XXXXXX`) is random without a DB-side uniqueness retry** —
  collision odds are tiny (32^6) but a duplicate-key insert error is theoretically
  possible; the unique constraint exists on `reference`.
- **`business.siteUrl` is hardcoded** to `https://www.homeproappliances.ca` and feeds
  metadata/sitemap/JSON-LD; it must be edited when the domain actually cuts over.
- **Supabase free tier pauses** after ~1 week idle (see `homepro-debugging-playbook`).

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| No hardcoded copy crept into components | `grep -rn "591-6424\|64 Ave" src/components/ --include="*.tsx" \| grep -v content` (expect: nothing) |
| Degradation paths intact | `grep -n "503" src/app/api/*/route.ts; grep -n "return null" src/lib/supabase-admin.ts` |
| RLS zero-policy state | Supabase MCP: `get_advisors` type=security → INFO `rls_enabled_no_policy` on `public.bookings` |
| Service-role never client-side | `grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/ \| grep -v "supabase-admin\|api/"` (expect: nothing) |
| Shared schema still dual-used | `grep -rn "bookingSchema" src/ \| grep -v node_modules` (expect: schema file, wizard, API route) |
| All SEO pages still SSG | `npm run build` → routes table shows ○/● for all non-API routes |
| Image name contract | `ls public/images/; grep -rn "/images/" src/content/services.ts` |
