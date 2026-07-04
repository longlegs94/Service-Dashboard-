# SKILL LIBRARY BUILD STATE  (updated: 2026-07-04)

## Phase: done

## Discovery summary
- Project: HomePro Appliances marketing + booking website (appliance repair, Surrey BC). Next.js 16.2.10 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 + Framer Motion 12.
- Repo short name for skills: `homepro`. Domain: local-service marketing site with booking + AI triage chat.
- ALL site content lives in typed data files `src/content/{business,services,cities,testimonials,faqs}.ts` — components render from them. This is the core editing invariant (documented in CLAUDE.md).
- Pages: home, /services + 6 SSG service pages, /service-areas + 20 SSG city SEO pages, /book (3-step wizard), /diagnose (AI chat), /about, /contact, /api/chat, /api/bookings.
- Backend: Supabase project `service-dashboard` (`elmghaklnqigrcgvodwk`, ca-central-1). `bookings` table, RLS enabled, ZERO policies by design (service-role-only access). Migration: `supabase/migrations/001_bookings.sql`. Free tier → project PAUSES after ~1 week idle; restore takes ~8–10 min (observed 2026-07-04).
- Booking pipeline: wizard (`src/components/booking/booking-wizard.tsx`) → shared Zod schema (`src/lib/booking-schema.ts`) → `POST /api/bookings` → Supabase insert (+ best-effort Resend email). Changing a form field touches 4 places: schema, wizard, API insert, SQL migration.
- AI chat: `src/components/chat/*` → streaming `POST /api/chat` (Anthropic SDK, model `claude-haiku-4-5`), SYSTEM_PROMPT embeds services/cities data + hard safety rules (no sealed-system/gas/electrical DIY; gas smell → FortisBC 1-800-663-9911). Deep-links to `/book?appliance=&problem=`.
- Graceful-degradation invariant: every integration no-ops friendly when its env var is missing (chat → call-us card via 503; bookings → friendly 503). Env vars (5): ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, BOOKING_NOTIFICATION_EMAIL (`.env.example`).
- Build/verify reality: NO CI, NO test suite. Gates are `npm run build` + `npm run lint` (both must pass; enforced socially via CLAUDE.md). E2E verification pattern used at launch: Playwright (global install at /opt/node22/lib/node_modules, chromium at /opt/pw-browsers) click-through, 25 checks.
- Known trap: Framer Motion `whileInView` scroll-reveals render opacity:0 in naive full-page screenshots; must scroll stepwise (with `scroll-behavior:auto` override) before capture. Cost real debugging time at launch.
- Known trap: dev sandboxes may block image CDNs (Pexels/Unsplash 403 via proxy) — images in `public/images/` are self-hosted brand illustrations generated via Chromium screenshot of `scenes.html`; swap-by-filename convention (no code changes).
- SEO layer: per-page generateMetadata, JSON-LD (`src/components/seo/json-ld.tsx`: HomeAndConstructionBusiness site-wide, Service, FAQPage), `src/app/sitemap.ts`, `robots.ts`. City pages REQUIRE unique intro copy (thin-content rule in CLAUDE.md).
- Git history: repo previously hosted a different app (job-management PWA, 12 commits, Supabase tables still present in the shared DB: profiles/organizations/jobs/quotes/invoices/etc., all 0 rows). Archived at `origin/archive/job-management-app` after default branch was replaced (user-approved force-push 2026-07-04). Default branch is still NAMED `claude/job-management-app-md-h2wgbv` but contains the website.
- Deployment: Vercel auto-deploys the default branch. First deployment exists (service-dashboard-momj*.vercel.app); public reachability unconfirmed — 403 to external fetchers suggests Vercel Deployment Protection may be on. GoDaddy DNS cutover documented in README. `business.siteUrl` (https://www.homeproappliances.ca) must be updated on domain change.
- Placeholders needing real data: testimonials (labeled placeholder), business email (info@homeproappliances.ca is a guess), real photos optional swap.
- AGENTS.md warning is load-bearing: Next.js version is NEWER than model training data — consult `node_modules/next/dist/docs/` before nontrivial Next API work.
- No TODO/FIXME markers anywhere in source.

## Adapted taxonomy (target 12 skills; thin categories merged, site-specific ones added)
| # | skill | one-line charter |
|---|---|---|
| 1 | homepro-change-control | Change classes (content/code/schema/branding), gates for each (build+lint must pass), branch rules incl. the default-branch-replacement incident, deploy-on-push consequences |
| 2 | homepro-debugging-playbook | Symptom→triage table: booking 503s, chat fallback card, paused Supabase, broken images, invisible sections in screenshots, Vercel 403s; discriminating checks for each |
| 3 | homepro-failure-archaeology | Real incidents: image-CDN proxy block → illustration pipeline; scroll-reveal screenshot trap; react-hooks/set-state-in-effect lint fixes; Supabase INACTIVE restore timeline; repo-shared-with-old-app archaeology |
| 4 | homepro-architecture-contract | Invariants: content-in-data-files, graceful degradation, service-role-only DB (RLS zero policies), shared Zod schema, SSG for SEO pages, server-only secrets |
| 5 | homepro-content-editing | The content model + edit recipes (phone/hours, add city, add service, testimonials, brand colors) with per-recipe verification |
| 6 | homepro-config-and-env | Every env var: where read, what breaks/degrades without it, local vs Vercel setup, re-verification commands |
| 7 | homepro-build-and-env | Recreate dev env from scratch; Next 16 docs-in-node_modules rule; Tailwind v4 @theme tokens; Playwright availability; known sandbox traps |
| 8 | homepro-verification-playbook | What counts as evidence before push: build+lint, Playwright click-through pattern (incl. scroll-reveal capture recipe), API curl tests, JSON-LD validation |
| 9 | homepro-booking-pipeline | End-to-end booking flow; 4-place field-change checklist; Supabase ops (restore, table admin, status workflow); Resend email path |
| 10 | homepro-ai-chat | Chat architecture, SYSTEM_PROMPT tuning rules, non-negotiable safety rules, model/cost notes, fallback behavior, booking handoff format |
| 11 | homepro-seo-playbook | City/service page discipline (unique copy), JSON-LD schema inventory, metadata patterns, add-a-city checklist, Search Console + sitemap ops |
| 12 | homepro-launch-campaign | Decision-gated executable campaign for the hardest live problem (default: get site publicly live + first real booking + domain cutover); every gate has expected observations and branch-on-failure paths |

## User answers to Phase 1 questions
(asked and answered 2026-07-04, verbatim from the question tool)

1. "What is the hardest live problem for this project right now?" → **"Go fully live + first booking (Recommended)"** (option text: Public site confirmed reachable, env vars wired, a real booking lands in Supabase + email, GoDaddy domain cut over.)
2. "Are there unwritten rules — things that must never be done on this project that no doc states yet?" → **"Business facts must never be wrong"** AND **"No invented reviews or claims"**. (User did NOT select "Never touch the old job-app data" — old data is not sacred, but deletion still requires explicit user approval per standing change-control.)
3. "Who will actually use this skill library, and what don't they know?" → **"Future Claude sessions (Recommended)"** — AI sessions with zero memory of this build.
4. "What has cost the most time so far?" → **"Nothing painful yet"** — capture current state well; the incidents in discovery still get documented as prevention.

## Skills
| skill name | status | notes |
|---|---|---|
| homepro-change-control | reviewed | verified: no CI, env ignore rules, placeholder markers |
| homepro-debugging-playbook | reviewed | verified: 503 paths, fallback trigger, model id, image names |
| homepro-failure-archaeology | reviewed | verified: reveal opacity, header raf fix, pkg name, branches |
| homepro-architecture-contract | reviewed | verified: no hardcoded copy, schema dual-use, secret isolation |
| homepro-content-editing | reviewed | recipes mirror CLAUDE.md + verified paths |
| homepro-config-and-env | reviewed | verified: env reads, .env.example, model id |
| homepro-build-and-env | reviewed | verified: versions, no tailwind.config, next docs dir |
| homepro-verification-playbook | reviewed | script tested green 16/16; sitemap count verified |
| homepro-booking-pipeline | reviewed | flow + 4-place checklist; DB verified live earlier today |
| homepro-ai-chat | reviewed | verified: safety rules in prompt, content-driven knowledge |
| homepro-seo-playbook | reviewed | verified: canonicals, schema types, sitemap count |
| homepro-launch-campaign | reviewed | gates 0-5 with branch-on-failure paths |

## Review findings log
(three review passes run 2026-07-04 by orchestrator-as-reviewer: FACTUAL re-ran every provenance command + live API probes; DOCTRINE cross-read all 12 for contradictions/overstatement; USABILITY judged descriptions + structure)

| severity | file | finding | status |
|---|---|---|---|
| IMPORTANT | homepro-booking-pipeline/SKILL.md | Provenance command for column↔insert comparison would miss JS-shorthand `reference,` and flag false drift | FIXED — replaced with human-comparison instruction noting the shorthand and DB-default columns |
| IMPORTANT | homepro-debugging-playbook/SKILL.md | (caught during authoring) empty-{} probe claimed to discriminate env state, but validation runs BEFORE the env check → always 400 | FIXED — valid-payload probe documented; verified live (valid payload returns 503 when env missing, 400 only for invalid payloads) |
| IMPORTANT | src/components/sections/more-than-repairs.tsx + src/app/about/page.tsx | (caught by architecture-contract verification) hardcoded street address in two components violated invariant 1 | FIXED in source — both now interpolate `business.address.street`; tsc clean |
| MINOR | several skills | Supabase project id `elmghaklnqigrcgvodwk` stated in 4 skills (home: config-and-env); accepted for self-containedness, id is stable | logged, not applied |
| MINOR | booking-pipeline vs debugging-playbook | paused-project restore steps summarized in both (full home: debugging-playbook) | logged, not applied |

## Authoring mode note (2026-07-04)
Subagent launches failed (session limit + classifier unavailable). Per mission fallback, the orchestrator authors skills ITSELF, sequentially, one per unit of work, checkpointing this file after each. Orchestrator has full build-session context (it built the repo), so session-sourced facts are first-hand; repo-checkable facts still verified by inspection.

## Next action for successor session
Library complete. MAINTENANCE: re-run the FACTUAL reviewer pass (re-execute every "Provenance and maintenance" command in each SKILL.md) quarterly or after any major refactor, dependency upgrade, or domain cutover; update date-stamped facts (model id, sitemap count, deployment state paragraph in homepro-launch-campaign) as they change.
