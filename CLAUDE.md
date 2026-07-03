@AGENTS.md

# HomePro Appliances — Website Guide for Claude

Marketing + booking website for HomePro Appliances (appliance repair, Surrey BC).
Next.js App Router + TypeScript + Tailwind CSS v4 + Framer Motion. Deployed on Vercel;
bookings stored in Supabase; AI chat powered by the Anthropic API.

## Where everything lives

**ALL site content is in `src/content/` — most edits happen there, not in components:**

| File | What it controls |
| --- | --- |
| `src/content/business.ts` | Name, phone, email, address, hours, stats, guarantees, brands, secondary services, production URL |
| `src/content/services.ts` | The 6 repair services → pages at `/services/[slug]`, booking form options, AI helper knowledge |
| `src/content/cities.ts` | The ~20 SEO city pages at `/service-areas/[slug]` |
| `src/content/testimonials.ts` | Home-page reviews — **placeholders, replace with real reviews** |
| `src/content/faqs.ts` | General FAQ (home page + FAQ structured data) |

Other important locations:

- Pages: `src/app/**/page.tsx` (home `page.tsx`, `book`, `diagnose`, `about`, `contact`, `services/[slug]`, `service-areas/[city]`)
- Reusable sections: `src/components/sections/` (hero, services grid, FAQ, CTA banner…)
- UI primitives: `src/components/ui/` (Button, Container, Reveal animation wrapper, Accordion, appliance icons)
- Booking wizard: `src/components/booking/booking-wizard.tsx`; validation shared with the API in `src/lib/booking-schema.ts`
- Booking API: `src/app/api/bookings/route.ts` (Supabase insert + Resend email)
- AI chat: `src/components/chat/`; system prompt in `src/app/api/chat/route.ts`
- SEO: `src/app/sitemap.ts`, `src/app/robots.ts`, JSON-LD in `src/components/seo/json-ld.tsx`
- Design tokens (brand colors, shadows): `@theme` block in `src/app/globals.css`
- Images: `public/images/` — brand-styled illustrations generated for launch. To switch to
  photos, replace the files keeping the same names (`hero.jpg`, `why-us.jpg`, `about.jpg`,
  `service-*.jpg`, `og.jpg`); no code changes needed.

## Common edit recipes

- **Change phone/hours/address** → `src/content/business.ts` (updates header, footer, every CTA, and structured data at once)
- **Add a service area city** → copy an entry in `src/content/cities.ts`, write a UNIQUE intro
  (never copy-paste between cities — it hurts SEO), add neighbourhoods + one local FAQ
- **Add a repair service** → copy an entry in `src/content/services.ts`; add an icon key to
  `src/components/ui/service-icon.tsx` if needed; add a `public/images/service-<name>.jpg`
- **Change brand colors** → edit `--color-brand-*` / `--color-accent-*` in `src/app/globals.css`
- **Tune the AI helper's behaviour** → edit `SYSTEM_PROMPT` in `src/app/api/chat/route.ts`
- **Change booking form fields** → update `src/lib/booking-schema.ts` + the wizard + the API
  insert + the `supabase/migrations` schema together
- **Real reviews** → replace `src/content/testimonials.ts` entries with reviews from the
  Google Business profile

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (must pass before pushing)
- `npm run lint` — ESLint

## Environment variables

See `.env.example`. Every integration degrades gracefully when unset: the AI chat shows a
call-us fallback, the booking API returns a friendly 503. Never expose
`SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` to client components.

## Deployment

Vercel (auto-deploys from the connected GitHub repo). Database schema lives in
`supabase/migrations/001_bookings.sql` — run it in the Supabase SQL Editor for a new project.
Full setup steps in `README.md`. Update `business.siteUrl` when the domain changes.
