---
name: homepro-launch-campaign
description: >
  The executable, decision-gated campaign for the HomePro website's hardest live
  problem (owner-stated 2026-07-04): get the site FULLY live — publicly reachable on
  Vercel, all env vars wired, a real booking landing in Supabase and email, and the
  GoDaddy domain cut over. Load this when the user says "let's go live", "launch",
  "deploy it for real", "is the site up?", "connect my domain", "test a real
  booking", "finish the setup", or shares a vercel.app URL. Every gate lists the
  expected observation AND what to do when you see something else. Work the gates in
  order; do not skip.
---

# HomePro launch campaign

State known at 2026-07-04: code deployed to Vercel (project alias
`service-dashboard-momj.vercel.app`); Supabase live with the bookings table; env-var
status on Vercel UNKNOWN; public reachability UNKNOWN (deployment-specific URLs 403
by design); domain not cut over. Update this paragraph as gates pass.

**When NOT to use this skill:** a specific thing is broken and you know which →
`homepro-debugging-playbook`. This campaign SEQUENCES; the playbook DIAGNOSES.

## Gate 0 — Confirm what "the site URL" even is

Vercel URL taxonomy (memorize; wrong-URL confusion is the #1 time sink):

| URL shape | Example | Publicly reachable? |
|---|---|---|
| Stable project alias | `service-dashboard-momj.vercel.app` | YES, unless Deployment Protection is on |
| Deployment-specific | `service-dashboard-momj-p51hfkfwt-longlegs94s-projects.vercel.app` | NO — auth-walled by default, always. Never use for public checks |
| Custom domain | `homeproappliances.ca` | after Gate 4 |

**Action:** owner opens the STABLE alias in a private/incognito window.
**Expected:** HomePro home page. → Gate 1.
**If Vercel login / "Authentication Required":** Vercel → project → Settings →
Deployment Protection → Vercel Authentication → "Only Preview Deployments" → retest.
**If 404 DEPLOYMENT_NOT_FOUND:** the deploy didn't finish/exists under another name —
check Vercel → Deployments for the latest Production deploy status.
**Note:** automated fetchers may see 403 from Vercel's bot firewall even when
browsers work — only the incognito-browser test is authoritative.

## Gate 1 — Env vars present on the deployment

**Action:** Vercel → project → Settings → Environment Variables. Confirm all five
(values in `homepro-config-and-env`): `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`,
`BOOKING_NOTIFICATION_EMAIL`. If ANY was added after the last deploy: Deployments →
⋯ → Redeploy (env is baked at build time).
**Expected:** five vars, then a redeploy newer than the last var change.
**If keys don't exist yet:** Supabase key from the dashboard (API keys page);
Anthropic from console.anthropic.com (add credit); Resend free tier. AI chat and
email are optional-degradable — Gate 2 can pass with only the two Supabase vars, but
note what's deferred.

## Gate 2 — Live probes of the deployed site

```bash
# (from any machine with open egress; sandbox egress may block vercel.app)
BASE=https://service-dashboard-momj.vercel.app
curl -s -o /dev/null -w '%{http_code}\n' $BASE/                    # expect 200
curl -s $BASE/sitemap.xml | grep -c "<url>"                        # expect 33
curl -s -o /dev/null -w '%{http_code}\n' -X POST $BASE/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"my fridge is warm"}]}'  # 200 = AI live; 503 = key missing (degraded OK)
```
**Expected:** 200 / 33 / 200.
**If chat 503:** acceptable to proceed; log "AI deferred" and return after Gate 3.

## Gate 3 — One real booking, end to end (the campaign's core proof)

**Action:** on the live site, submit a booking: appliance Washer, problem
"LAUNCH TEST — please ignore", tomorrow's date, flexible, real owner contact info.
**Expected, all three:**
1. Confirmation screen with reference `HP-XXXXXX`.
2. Row in Supabase → Table Editor → bookings (project `elmghaklnqigrcgvodwk`) with
   that reference, status `new`.
3. Notification email at `BOOKING_NOTIFICATION_EMAIL` (check spam — sender is
   `onboarding@resend.dev` until a domain is verified in Resend).
**Then:** delete the test row (`delete from bookings where reference = 'HP-XXXXXX';`).
**If "temporarily unavailable":** Supabase env vars missing on the deployment → Gate 1.
**If "couldn't save":** Supabase paused or key wrong → `homepro-debugging-playbook`.
**If no email but row exists:** booking system is FINE; fix Resend vars later —
do not block launch on email.

## Gate 4 — GoDaddy domain cutover (owner decision required first)

**Decision:** the real HomeProAppliances.ca currently serves the business's existing
site. Cutting DNS replaces it for all visitors. Get explicit owner go-ahead.

1. Vercel → project → Settings → Domains → add `homeproappliances.ca` AND
   `www.homeproappliances.ca`.
2. GoDaddy → DNS: add the exact records Vercel displays (typically A `@` →
   `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com` — use what Vercel shows).
3. Wait for propagation (minutes–hours). Vercel auto-issues HTTPS.
**Expected:** both hosts show "Valid Configuration" in Vercel; `https://www.homeproappliances.ca`
loads the new site in incognito.
**If "Invalid Configuration" persists >1 h:** recheck record values/typos; delete
conflicting old A/CNAME records at GoDaddy.

## Gate 5 — Post-cutover finalization

1. `src/content/business.ts` → confirm `siteUrl` matches the live domain exactly
   (scheme + www) — it feeds canonicals/sitemap/JSON-LD. Edit, build, push if not.
2. Search Console: verify domain property (DNS TXT at GoDaddy), submit sitemap —
   steps in `homepro-seo-playbook`.
3. Re-run Gate 2 probes against the custom domain.
4. Replace placeholder testimonials + confirm business email
   (`homepro-content-editing`) — owner said business facts must never be wrong.

## Campaign completion criteria (all must be true)

- [ ] Stable URL loads in incognito (Gate 0)
- [ ] Booking round-trip proven: confirmation + Supabase row + email (Gate 3)
- [ ] AI chat live (200) or explicitly deferred by owner
- [ ] Domain serves the site with HTTPS (Gate 4) — if owner chose to cut over
- [ ] siteUrl correct + sitemap submitted (Gate 5)
- [ ] Test rows deleted; placeholders replaced or explicitly deferred

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Current deployment state paragraph | update it whenever a gate passes; it IS the campaign log |
| Stable alias | Vercel dashboard → project → Domains |
| Vercel DNS record values | always use what the Vercel Domains screen shows, not this doc |
| Supabase project for row checks | MCP `list_projects` |
| Env var semantics | `homepro-config-and-env` |
