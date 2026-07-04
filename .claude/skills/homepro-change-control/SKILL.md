---
name: homepro-change-control
description: >
  Rules for making ANY change to the HomePro Appliances website repo safely. Load this
  BEFORE editing files, committing, pushing, changing the database schema, changing
  branding, or touching branches — especially if the user says "change", "update",
  "edit", "fix", "push", "deploy", "rename", "merge", or asks for new features. Covers:
  the four change classes (content / code / schema / branding) and the gate each must
  pass; the build+lint must-pass rule; branch layout including why the default branch
  has a misleading name; the deploy-on-push consequence (Vercel auto-deploys the
  default branch); and the two owner-mandated hard rules — business facts must never
  be wrong, and no invented reviews or claims. Also load when tempted to force-push,
  delete branches, or drop database tables.
---

# HomePro change control

This skill defines how changes are classified, gated, and shipped in this repo.
It exists because the site is a live business asset: a wrong phone number or a fake
review costs the owner real customers and trust.

**When NOT to use this skill:** diagnosing why something is broken → use
`homepro-debugging-playbook`. Understanding why the code is shaped this way → use
`homepro-architecture-contract`. Step-by-step content edits → use
`homepro-content-editing` (it references the gates defined here).

## Hard rules (owner-mandated, 2026-07-04 — never violate)

| Rule | Meaning in practice |
|---|---|
| **Business facts must never be wrong** | Phone, address, hours, warranty terms, service areas in `src/content/business.ts` must match reality. If a task requires a business fact you cannot confirm, ASK the owner — do not guess. The current email `info@homeproappliances.ca` is a known placeholder guess; it is flagged in README. |
| **No invented reviews or claims** | `src/content/testimonials.ts` contains labeled placeholders ("Sample Review — replace me"). Never write realistic-looking fake reviews, never remove the placeholder labels without real reviews to substitute, never invent stats (repair counts, years in business) beyond what `business.ts` already states. |

## Change classes and their gates

| Class | Files touched | Gate before push |
|---|---|---|
| **Content** (copy, cities, services, FAQs, testimonials, contact info) | `src/content/*.ts` only | `npm run build` passes (content files are typed — a bad edit fails the build). For city pages: intro copy must be UNIQUE per city (SEO rule in CLAUDE.md). |
| **Code** (components, pages, API routes, styles) | `src/app/`, `src/components/`, `src/lib/` | `npm run build` AND `npm run lint` pass with zero errors. For user-visible changes, run the site (`npm run dev`) and exercise the changed flow — see `homepro-verification-playbook`. |
| **Schema** (database) | `supabase/migrations/*.sql` + `src/lib/booking-schema.ts` + wizard + API route | All four layers change together (see `homepro-booking-pipeline` for the 4-place checklist). Migration must be applied to the live Supabase project (`elmghaklnqigrcgvodwk`) via MCP `apply_migration` or the dashboard SQL Editor — committing the file alone changes nothing in production. |
| **Branding** (colors, fonts, logo, images) | `src/app/globals.css` `@theme` block, `public/images/*` | Build passes; visually verify at desktop + mobile widths. Image swaps keep the SAME filenames (`hero.jpg`, `service-*.jpg`, …) — code references are by name. |

**There is no CI.** (CI = automated checks that run on push; this repo has none — no
`.github/workflows/`.) The gates above are enforced only by whoever makes the change.
That is why they are non-negotiable: nothing catches you downstream.

```bash
# The universal pre-push gate (run from repo root):
npm run build && npm run lint
```

## Branch layout (as of 2026-07-04) and pushing

| Branch | Content | Rules |
|---|---|---|
| `claude/job-management-app-md-h2wgbv` | **THE DEFAULT BRANCH — contains the WEBSITE despite its name.** Vercel deploys this branch on every push. | Pushing here = deploying to production. Only push after gates pass. History: it originally held a different app (job-management PWA); on 2026-07-04 the owner explicitly approved replacing its content with the website. |
| `claude/appliance-repair-website-4nl377` | The website's working branch (same history) | Development happens here; sync to default branch to deploy. |
| `archive/job-management-app` | Frozen archive of the old job-management app | Do not delete or modify. It exists so the old app's history is never lost. |

Rules with rationale:

1. **Never force-push any branch without the owner's explicit, single-purpose
   approval.** Historical incident: pushing the site to `master` was DENIED by the
   permission system because "please continue" was judged insufficient consent; the
   later default-branch replacement went ahead only after the owner picked that exact
   option from a multiple-choice question. Follow that standard.
2. **Archive before you overwrite.** The old app was saved to
   `archive/job-management-app` before its branch was replaced. Any future destructive
   ref change gets the same treatment: `git push origin <old-sha>:refs/heads/archive/<name>` first.
3. **A push to the default branch IS a production deploy.** There is no staging
   environment. If a change is risky, verify locally first (see
   `homepro-verification-playbook`).
4. The default branch's misleading name is known and accepted; renaming it to `main`
   is a one-click owner action on GitHub (Settings → General → Default branch) that
   Vercel follows automatically. Do not attempt it from a session; sessions have no
   repo-settings tool.

## Database change rules

- The `bookings` table is locked down BY DESIGN: RLS (row-level security — Postgres
  per-row access control) is enabled with **zero policies**, so only the service-role
  key can touch it. Never "fix" this by adding anon/authenticated policies.
- 17 tables from the old job-management app remain in the shared Supabase project
  (profiles, organizations, jobs, quotes, invoices, …; all 0 rows as of 2026-07-04).
  The owner did NOT mark them sacred, but dropping them still requires explicit owner
  approval per rule 1's standard — destructive, not urgent, so ask.

## Commit and push conventions

```bash
git add -A
git commit -m "<imperative summary of the change>"
git push -u origin <branch-name>   # retry with backoff only on network errors
```

- Commit messages: imperative mood, say what changed and why if not obvious.
- Never commit `.env.local` or any secret (`.gitignore` covers `.env*` but keeps
  `.env.example` via a `!.env.example` exception — verify before committing new env files).

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Build/lint are the only gates (no CI) | `ls .github/workflows 2>&1` (expect: no such directory) |
| Default branch name and HEAD | `git ls-remote origin HEAD` and `git ls-remote origin \| head -5` |
| Archive branch exists | `git ls-remote origin archive/job-management-app` |
| Testimonials still placeholders | `grep "replace me" src/content/testimonials.ts` |
| Placeholder email still unconfirmed | `grep -n "placeholder" src/content/business.ts` |
| `.env.example` committed, other env files ignored | `git check-ignore .env.local; git ls-files \| grep .env` |
| Old Supabase tables still present | Supabase MCP `list_tables` on project `elmghaklnqigrcgvodwk` |
