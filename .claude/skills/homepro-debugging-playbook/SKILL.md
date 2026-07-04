---
name: homepro-debugging-playbook
description: >
  Symptom→cause→fix triage for the HomePro Appliances website. Load this FIRST when
  anything is broken, erroring, blank, missing, 403ing, 503ing, or "not working" —
  e.g. "bookings aren't saving", "the chat just shows call us", "the site is blank",
  "images are broken", "I get 403 / Forbidden", "booking system temporarily
  unavailable", "screenshots show empty sections", "Supabase is paused/inactive",
  "emails aren't arriving". Contains discriminating checks that tell apart:
  missing env vars vs real API failures, Vercel deployment protection vs bot-blocking
  vs wrong URL, paused database vs misconfigured keys, and the scroll-reveal
  screenshot illusion vs an actual rendering bug.
---

# HomePro debugging playbook

Run the discriminating check BEFORE proposing a fix. Every failure mode below has a
known look-alike; the check is what separates them.

**When NOT to use this skill:** making planned changes → `homepro-change-control`.
Setting up the environment from scratch → `homepro-build-and-env`. Launch/deploy
sequencing → `homepro-launch-campaign`. Incident back-stories → `homepro-failure-archaeology`.

## Triage table

| Symptom | Most likely cause | Discriminating check | Fix |
|---|---|---|---|
| Booking form shows "temporarily unavailable / call us" after submit | `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` unset where the server runs | Send a VALID payload (empty `{}` always 400s at validation, BEFORE the env check): `curl -s -o /dev/null -w '%{http_code}' -X POST <site>/api/bookings -H 'Content-Type: application/json' -d '{"appliance":"washer-repair","problem":"test probe please ignore","preferredDate":"2030-01-01","timeWindow":"flexible","name":"Env Probe","phone":"6045550000","email":"probe@example.com","address":"123 Probe St","city":"Surrey"}'` → 503 = env missing; 200 = env fine (**this creates a real booking row — delete reference from the response in Supabase afterwards**); 500 = env set but insert failing | Set both vars (Vercel → Settings → Environment Variables), **redeploy** (env changes don't apply to existing deployments) |
| Booking submit says "couldn't save your booking" (HTTP 500) | Supabase reachable but insert failed: paused project, wrong key, or schema drift | Supabase MCP `get_project` on `elmghaklnqigrcgvodwk` → status must be `ACTIVE_HEALTHY`; then `list_tables` → `public.bookings` must exist | Paused → restore (below). Missing table → apply `supabase/migrations/001_bookings.sql`. Wrong key → re-copy service_role key |
| Supabase project status `INACTIVE` | Free-tier auto-pause after ~1 week without traffic | `get_project` status field | `restore_project`, then poll `get_project` every ~45 s. Observed timeline 2026-07-04: `COMING_UP` (several min) → `RESTORING` → `ACTIVE_HEALTHY`, ~8–10 min total. Do not panic before 15 min |
| AI chat shows the "isn't available right now — call us" card | `ANTHROPIC_API_KEY` unset (this card is the DESIGNED fallback, HTTP 503 from `/api/chat`) | `curl -s -o /dev/null -w '%{http_code}' -X POST <site>/api/chat -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"hi"}]}'` → 503 = no key; 200 = key works | Set `ANTHROPIC_API_KEY` in Vercel, redeploy. Card ≠ bug: the site is built to degrade this way |
| Chat errors mid-conversation ("Something went wrong") | Real API failure: invalid key, no credit, or model retired | Vercel → project → Logs, filter `/api/chat`; look for `Chat stream error:` lines | Invalid/expired key → replace. Credit exhausted → top up at console.anthropic.com. Model retired → update `model:` in `src/app/api/chat/route.ts` (currently `claude-haiku-4-5`, set 2026-07-04) |
| Booking saved but no email arrived | `RESEND_API_KEY`/`BOOKING_NOTIFICATION_EMAIL` unset, or Resend rejected the send — email is best-effort BY DESIGN; the DB row is the source of truth | Check the row exists in Supabase Table Editor → bookings. Then Vercel logs for `Booking email failed (booking is saved):` | Set both env vars; check Resend dashboard for bounces. Note: `from:` is `onboarding@resend.dev` until a domain is verified in Resend — some inboxes junk it |
| Whole site 403 to a fetcher/tool, but owner sees it fine | Vercel Deployment Protection (auth wall for non-team visitors) OR bot firewall — or you fetched a deployment-specific URL | URL shape check FIRST: `*-<hash>-<team>.vercel.app` URLs are ALWAYS auth-protected; only the stable alias (`service-dashboard-momj.vercel.app`) can be public. Then test stable URL in an incognito browser | If incognito shows a Vercel login → Settings → Deployment Protection → set Vercel Authentication to "Only Preview Deployments". If incognito works → it was bot-blocking; not a real problem |
| Page sections appear BLANK in full-page screenshots | Scroll-reveal illusion: Framer Motion `whileInView` content starts at `opacity:0` and only animates when scrolled into view. SSR HTML carries `style="opacity:0;transform:translateY(24px)"` | In a real browser, scroll down — content appears. In Playwright: check `getComputedStyle(el).opacity` after `el.scrollIntoView()` → becomes `1` | Not a bug. For honest screenshots: set `document.documentElement.style.scrollBehavior='auto'`, scroll stepwise (~700 px, 350 ms pauses) to bottom, return to top, wait ~700 ms, THEN capture. Recipe in `homepro-verification-playbook` |
| Images broken (404) on a page | Filename mismatch — code references `public/images/` files BY NAME (`hero.jpg`, `why-us.jpg`, `about.jpg`, `og.jpg`, `service-fridge/washer/dryer/dishwasher/stove/freezer.jpg`) | `ls public/images/` vs `grep -rn "images/" src/ --include="*.ts*" -o \| sort -u` | Restore the exact filename. When swapping to real photos, KEEP the names |
| Build fails after a content edit | Type error — content files are typed TS | `npm run build` output names the file/line | Fix the field; content shape is defined at the top of each `src/content/*.ts` |
| `npm run lint` error `react-hooks/set-state-in-effect` | Synchronous setState inside `useEffect` | Lint output names the file | Pattern used in `src/components/layout/header.tsx`: wrap initial call in `requestAnimationFrame`, or move state change to an event handler (per build log 2026-07-04) |
| Dev-sandbox `curl` to any external site fails `CONNECT tunnel failed, response 403` | Sandbox egress proxy blocks the host (network policy), NOT the target site being down | `curl -sS "$HTTPS_PROXY/__agentproxy/status"` → `recentRelayFailures` lists denied hosts | Work around it (different host, WebFetch, or generate assets locally); do not diagnose the target site from inside the sandbox |

## Reading production logs

Vercel dashboard → project → **Logs** (runtime) or **Deployments → [build] → Build Logs**.
Both API routes log failures with recognizable prefixes:

- `Booking insert failed:` — Supabase insert error object follows
- `Booking email failed (booking is saved):` — Resend failure; booking is safe
- `Chat stream error:` — Anthropic streaming failure

If the Vercel MCP connector is available, `get_runtime_errors` returns clustered
production errors (needs teamId + projectId; as of 2026-07-04 the connector exposes
observability tools only).

## Escalation order

1. Discriminating check from the table (30 seconds).
2. Vercel runtime logs for the exact error line.
3. Supabase status + Table Editor for data-layer questions.
4. Reproduce locally: `.env.local` mirroring production vars, `npm run dev`,
   curl the local route (see `homepro-verification-playbook`).
5. Only after 1–4: read code with a specific hypothesis.

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| 503-on-missing-env behavior (both routes) | `grep -n "503" src/app/api/bookings/route.ts src/app/api/chat/route.ts` |
| Chat fallback card trigger | `grep -n "unconfigured" src/components/chat/use-chat.ts src/components/chat/chat-panel.tsx` |
| Email is best-effort | `grep -n "best-effort\|email failed" src/app/api/bookings/route.ts` |
| Image filename inventory | `ls public/images/` |
| Chat model id | `grep -n "model:" src/app/api/chat/route.ts` |
| Log line prefixes unchanged | `grep -rn "console.error" src/app/api/` |
| Supabase project id/status | Supabase MCP `list_projects` |
