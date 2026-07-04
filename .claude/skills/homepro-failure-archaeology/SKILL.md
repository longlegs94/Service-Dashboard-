---
name: homepro-failure-archaeology
description: >
  The incident record of the HomePro website's 2026-07-04 launch build: every dead
  end, trap, and surprise, with root cause, evidence, and current status. Load this
  BEFORE re-investigating anything that feels mysterious or before re-attempting
  something that might have been tried already — e.g. "why are the images
  illustrations instead of photos", "why is the default branch named
  job-management-app", "why are there 17 unrelated tables in Supabase", "the
  screenshots look blank", "downloading stock photos fails with 403", "lint complains
  about setState in effect", "the Supabase project is paused", "create-next-app
  refuses the directory name". Prevents re-walking known dead ends.
---

# HomePro failure archaeology

Six incidents from the launch build (2026-07-04). Each entry: symptom → root cause →
evidence → status. Source is the build session log unless a repo command is shown;
session-sourced facts are marked *(build log)*.

**When NOT to use this skill:** live triage of a NEW problem → `homepro-debugging-playbook`
(it distills these into a symptom table). Rules going forward → `homepro-change-control`.

## 1. Stock-photo downloads blocked → illustration pipeline

- **Symptom:** every `curl` to `images.pexels.com` / `images.unsplash.com` failed with
  `CONNECT tunnel failed, response 403`; WebFetch to the same hosts also 403'd.
- **Root cause:** the remote dev sandbox's egress proxy allows only an allowlist
  (npm, pypi, GitHub-family hosts…). Image CDNs are denied at the proxy, and
  Unsplash/HomeProAppliances.ca also block Anthropic's fetcher server-side.
- **Dead ends fenced off:** trying more CDN mirrors (same proxy denies them);
  hotlinking unverifiable Unsplash IDs (risk of 404 hero images); Wikimedia (denied).
- **Escape that worked:** brand-styled SVG/CSS scenes rendered in the preinstalled
  Chromium via Playwright and screenshotted to real JPGs in `public/images/`
  (1600×1200 for 4:3 slots, 1200×900 services, 1200×630 OG). Swap-by-filename design
  means real photos can replace them with zero code changes.
- **Status:** shipped. Illustrations are the live imagery. *(build log; artifacts:
  `ls public/images/`)*

## 2. "Blank page" that wasn't — scroll-reveal screenshot illusion

- **Symptom:** full-page Playwright screenshot of the home page showed the hero, then
  ~5000 px of blank sections. Looked like a catastrophic rendering bug.
- **Root cause:** `Reveal` (`src/components/ui/reveal.tsx`) uses Framer Motion
  `whileInView` with `initial={opacity:0, y:24}`; SSR HTML carries
  `style="opacity:0;transform:translateY(24px)"`. Content only animates in when
  scrolled into view — stitched screenshots never scroll. Compounding trap:
  `html { scroll-behavior: smooth }` (in `src/app/globals.css`) makes rapid
  programmatic `scrollTo` loops outrun IntersectionObserver, so even a "scroll first"
  script can capture opacity 0.
- **Proof it works:** `el.scrollIntoView({block:'center',behavior:'instant'})` then
  1.5 s wait → computed opacity `1`. *(build log)*
- **Working capture recipe:** set `document.documentElement.style.scrollBehavior='auto'`,
  scroll in ~700 px steps with ~350 ms pauses to the bottom, scroll to top, wait
  ~700 ms, then screenshot. (Full script in `homepro-verification-playbook`.)
- **Status:** understood; not a bug. Text content is present in SSR HTML regardless
  (crawlers see it).

## 3. Lint errors: `react-hooks/set-state-in-effect`

- **Symptom:** `npm run lint` errored twice in `src/components/layout/header.tsx` —
  calling setState synchronously within an effect.
- **Fixes that stuck:** (a) initial scroll-shadow state set inside
  `window.requestAnimationFrame(onScroll)` instead of calling `onScroll()` directly in
  the effect; (b) mobile-menu close moved from a `useEffect` watching `pathname` to
  `onClick={() => setMenuOpen(false)}` on each menu link.
- **Evidence:** `grep -n "requestAnimationFrame\|setMenuOpen(false)" src/components/layout/header.tsx`
- **Status:** fixed; lint clean. Reuse these two patterns for future hook lint errors.

## 4. Supabase project paused (INACTIVE) and the restore timeline

- **Symptom:** MCP `list_projects` showed project `service-dashboard`
  (`elmghaklnqigrcgvodwk`) status `INACTIVE`; bookings API would 500.
- **Root cause:** Supabase free tier auto-pauses projects after ~1 week without traffic.
- **Observed restore timeline (2026-07-04):** `restore_project` → status `COMING_UP`
  for ~6–7 min (looks stuck; is not) → `RESTORING` briefly → `ACTIVE_HEALTHY`.
  Total ~8–10 min. Poll every ~45 s; don't declare failure before 15 min.
- **Status:** recurring by nature. Expect it after any idle week until the project is
  on a paid plan. *(build log; re-check: MCP `get_project`)*

## 5. One repo, two apps — why nothing here matches its name

- **History:** this GitHub repo (`longlegs94/Service-Dashboard-`) originally held a
  job-management PWA (12 commits: Google auth, clients, scheduling, billing/Square,
  PWA/Capacitor). The website was built on a fresh orphan-like branch while `master`
  didn't exist and the default branch was the job app's.
- **Resolution (owner-approved, 2026-07-04):** old app archived to
  `origin/archive/job-management-app`; the default branch
  `claude/job-management-app-md-h2wgbv` was force-pushed to contain the WEBSITE
  (so Vercel deploys it). A first attempt to push `master` instead was denied by the
  permission system for lacking explicit consent — the archive-then-replace path was
  chosen by the owner from explicit options.
- **Residue to expect:** (a) default branch name is misleading; (b) the shared
  Supabase project still contains 17 empty tables + 3 SECURITY DEFINER functions from
  the old app (advisor warnings about them are old-app debris, not website issues);
  (c) `git log --all` shows both histories.
- **Status:** stable. Old data is not sacred (owner said so) but deletion still needs
  explicit approval.
- **Evidence:** `git ls-remote origin | grep -E "HEAD|archive"`;
  `git log --oneline origin/archive/job-management-app | head -3`

## 6. create-next-app vs the capitalized directory

- **Symptom:** `npx create-next-app@latest .` failed: project name
  "Service-Dashboard-" violates npm naming (no capitals allowed).
- **Escape:** scaffold in a temp dir with a lowercase name (`homepro-site`), delete its
  `.git`, `cp -a` contents into the repo. Package name in `package.json` is
  `homepro-site` for this reason.
- **Status:** done once; only relevant if re-scaffolding. *(build log; evidence:
  `grep '"name"' package.json`)*

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Reveal initial opacity + smooth scroll | `grep -n "opacity: 0" src/components/ui/reveal.tsx; grep -n "scroll-behavior" src/app/globals.css` |
| Header lint-fix patterns present | `grep -n "requestAnimationFrame" src/components/layout/header.tsx` |
| Archive branch + default branch state | `git ls-remote origin \| grep -E "HEAD\|archive\|job-management"` |
| Old-app tables still in shared DB | Supabase MCP `list_tables` project `elmghaklnqigrcgvodwk` |
| Package name workaround | `grep '"name"' package.json` |
| Illustration files present | `ls public/images/` |
