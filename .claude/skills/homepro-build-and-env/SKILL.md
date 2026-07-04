---
name: homepro-build-and-env
description: >
  Recreate the HomePro website development environment from scratch and avoid its
  known traps. Load this when cloning the repo fresh, when "npm install/build/dev
  fails", when unsure which Node/Next/Tailwind versions apply, before using any
  Next.js API from memory (the installed Next is NEWER than model training data —
  read node_modules/next/dist/docs first), when needing Playwright/Chromium in the
  remote sandbox, or when a sandbox network request fails with CONNECT 403. Covers:
  install/dev/build/lint commands, Tailwind v4 @theme (no tailwind.config file),
  fonts, and the egress-proxy allowlist reality.
---

# HomePro build and environment

**When NOT to use this skill:** env VAR values and key rotation →
`homepro-config-and-env`. Verifying a change works → `homepro-verification-playbook`.

## From clean clone to running site

```bash
git clone <repo-url> && cd <repo>
npm install                  # Node 22.x used at build time (2026-07-04)
cp .env.example .env.local   # fill what you have; everything degrades gracefully
npm run dev                  # http://localhost:3000
```

| Command | What it does | Must-pass gate? |
|---|---|---|
| `npm run dev` | Dev server (Turbopack) | — |
| `npm run build` | Production build; prerenders all 31+ pages | YES, before any push |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs`) | YES, before any push |
| `npm run start` | Serve the production build locally | for verification |

## Version reality (2026-07-04) — and the single most important rule

| Piece | Version | Trap |
|---|---|---|
| Next.js | 16.2.10 | **NEWER than model training data.** Before writing nontrivial Next.js code from memory, read the relevant guide in `node_modules/next/dist/docs/` (this rule is repo law — see `AGENTS.md`). Known Next-16 facts used here: route params are `Promise` (`const { slug } = await params`), `useSearchParams` requires a `<Suspense>` boundary |
| React | 19.2.x | — |
| Tailwind CSS | v4 | **There is NO `tailwind.config.js`.** Design tokens live in the `@theme` block of `src/app/globals.css`; import is `@import "tailwindcss"` via `postcss.config.mjs`. Spacing utilities accept any integer (e.g. `h-13`) |
| Framer Motion | 12.x | Scroll-reveal screenshot trap — see `homepro-debugging-playbook` |
| Zod | 4.x | `z.email()` is top-level (not `z.string().email()`) |
| Fonts | Inter via `next/font/google` | Exposed as CSS var `--font-inter`, mapped in `@theme` |

## Remote sandbox specifics (Claude Code cloud environment)

- **Egress is allowlisted.** npm/pypi/GitHub-family hosts work; most other hosts
  (image CDNs, vercel.app, random sites) fail with
  `curl: (56) CONNECT tunnel failed, response 403`. Diagnose with
  `curl -sS "$HTTPS_PROXY/__agentproxy/status"`. Never disable TLS verification or
  unset HTTPS_PROXY.
- **Playwright is preinstalled globally** — do NOT `playwright install`:
  - module: `NODE_PATH=/opt/node22/lib/node_modules node -e "require('playwright')"`
  - browsers: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` (chromium present)
- **create-next-app trap:** the repo directory name contains capitals, which npm
  rejects as a package name. Package is named `homepro-site` for this reason. If ever
  re-scaffolding: scaffold in a temp dir, remove its `.git`, copy contents in.

## What a healthy build looks like

`npm run build` ends with a route table: `○` (static) for home/about/contact/book/
diagnose/services/service-areas indexes, `●` (SSG) with listed paths for
`/services/[slug]` (6) and `/service-areas/[city]` (20), `ƒ` (dynamic) ONLY for
`/api/chat` and `/api/bookings`, plus `○ /sitemap.xml`. Anything else appearing
dynamic is a regression (see `homepro-architecture-contract` invariant 5).

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Versions | `npm ls next react tailwindcss framer-motion zod --depth=0` |
| Node version in use | `node --version` |
| No tailwind.config | `ls tailwind.config.* 2>&1` (expect: not found) |
| @theme token home | `grep -n "@theme" src/app/globals.css` |
| Next docs location | `ls node_modules/next/dist/docs/ \| head` |
| Playwright availability (sandbox) | `NODE_PATH=/opt/node22/lib/node_modules node -e "console.log(require('playwright')?'ok':'')" && ls /opt/pw-browsers` |
| Healthy route table | `npm run build 2>&1 \| tail -30` |
