---
name: homepro-config-and-env
description: >
  Every configuration axis of the HomePro website: the five environment variables
  (what reads each one, what degrades without it, where to set it locally and on
  Vercel), the Supabase project identity, and the hardcoded config that lives in code
  (siteUrl, chat model, email from-address). Load this when setting up env vars,
  rotating keys, wiring Vercel, asking "why is X not configured", "where do I put the
  API key", "which Supabase project", "what is the service role key", or auditing
  what config exists. Includes the redeploy-after-env-change rule.
---

# HomePro configuration and environment variables

**When NOT to use this skill:** a config value is set but things still fail →
`homepro-debugging-playbook`. First-time machine setup → `homepro-build-and-env`.

## The five environment variables

Template: `.env.example` (committed). Local: copy to `.env.local` (gitignored).
Production: Vercel → Project → Settings → Environment Variables.

| Variable | Read by | Without it | Secret? |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | `src/app/api/chat/route.ts` | Chat returns 503 → widget shows designed call-us/book-now card. Site otherwise fine | YES — server only |
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase-admin.ts` | Bookings API returns friendly 503 | No (public by design; still set it) |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase-admin.ts` | Same friendly 503 | **YES — full DB access.** Never in client code, logs, or commits |
| `RESEND_API_KEY` | `src/app/api/bookings/route.ts` | Bookings still save; email notification silently skipped | YES |
| `BOOKING_NOTIFICATION_EMAIL` | `src/app/api/bookings/route.ts` | Same as above (both are required for email) | No |

**The redeploy rule:** Vercel bakes env vars into a deployment at build time. Adding
or changing a variable does NOTHING to the running site until you trigger a new
deployment (Deployments → ⋯ → Redeploy, or push a commit).

## Where the values come from (as of 2026-07-04)

| Value | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://elmghaklnqigrcgvodwk.supabase.co` (project `service-dashboard`, org "Jindal Control Base", region ca-central-1) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → project → Settings → API keys → `service_role` secret. Not retrievable via MCP — dashboard only |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API keys (needs credit; chat uses Haiku ≈ well under $0.01/conversation) |
| `RESEND_API_KEY` | resend.com dashboard (free tier suffices) |
| `BOOKING_NOTIFICATION_EMAIL` | Owner's choice of inbox |

## Config that lives in CODE, not env

| Setting | Location | When to change |
|---|---|---|
| `business.siteUrl` | `src/content/business.ts` | When the real domain goes live — feeds canonical URLs, sitemap, robots, JSON-LD, OG tags |
| Chat model (`claude-haiku-4-5`) | `src/app/api/chat/route.ts` | If the model is retired or triage quality needs a bump |
| Chat max_tokens (700) + SYSTEM_PROMPT | same file | See `homepro-ai-chat` before touching |
| Email `from:` (`onboarding@resend.dev`) | `src/app/api/bookings/route.ts` | After verifying a domain in Resend, switch to e.g. `bookings@<domain>` for deliverability |
| Booking time windows | `src/lib/booking-schema.ts` (`timeWindows`) | If shop scheduling changes |

## Key rotation runbook

1. Generate the new key at the provider.
2. Update the Vercel env var → **Redeploy**.
3. Verify with the discriminating check for that integration
   (`homepro-debugging-playbook` table).
4. Revoke the old key at the provider.
5. If a secret was ever committed or pasted somewhere public, rotate IMMEDIATELY and
   check `git log -p -- .env*` history (should be empty — `.env*` is gitignored except
   `.env.example`).

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Env var inventory | `cat .env.example` |
| What reads each var | `grep -rn "process.env" src/ --include="*.ts" --include="*.tsx"` |
| Supabase project id | Supabase MCP `list_projects` |
| Chat model + max_tokens | `grep -n "model:\|max_tokens" src/app/api/chat/route.ts` |
| Email from-address | `grep -n "from:" src/app/api/bookings/route.ts` |
| siteUrl value | `grep -n "siteUrl" src/content/business.ts` |
| .env.example committed, .env.local ignored | `git ls-files \| grep env; git check-ignore .env.local` |
