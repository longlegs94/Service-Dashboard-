# HomePro Appliances — Website

Marketing + booking website for HomePro Appliances (appliance repair, Surrey BC), built with
Next.js, Tailwind CSS, Supabase, and the Anthropic API.

**Features:** startup-quality design with subtle animations · 6 repair-service pages ·
20 SEO-optimized BC city pages · 3-step online booking (saved to Supabase + email
notification) · free AI diagnosis chat · JSON-LD structured data, sitemap & Open Graph.

> ✏️ Editing content later? See **CLAUDE.md** — all copy lives in `src/content/` and Claude
> can make most changes in one file.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in what you have — everything degrades gracefully
npm run dev                  # http://localhost:3000
```

## Going live — one-time setup (~20 minutes)

### 1. Supabase (stores bookings) — ✅ already set up

The `bookings` table lives in the **service-dashboard** project
(`elmghaklnqigrcgvodwk`, region `ca-central-1`) with RLS locked down; the schema in
[`supabase/migrations/001_bookings.sql`](supabase/migrations/001_bookings.sql) has been applied.

- `NEXT_PUBLIC_SUPABASE_URL` = `https://elmghaklnqigrcgvodwk.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` → copy from the
  [project's API settings](https://supabase.com/dashboard/project/elmghaklnqigrcgvodwk/settings/api-keys)
  (`service_role` secret — keep it server-side only)
- New bookings appear in **Table Editor → bookings**. Update the `status` column as you
  confirm/complete jobs.
- Note: free-tier projects pause after ~1 week of inactivity; click "Restore" in the
  dashboard if that happens.

### 2. Anthropic (powers the AI helper)

1. Create an API key at [console.anthropic.com](https://console.anthropic.com) → `ANTHROPIC_API_KEY`.
2. Add a few dollars of credit — the chat uses Claude Haiku, so a typical conversation costs
   well under a cent.
3. No key? The chat gracefully offers "call us / book now" instead — the site still works.

### 3. Resend (emails you each booking)

1. Create a free account at [resend.com](https://resend.com) → API key → `RESEND_API_KEY`.
2. Set `BOOKING_NOTIFICATION_EMAIL` to the inbox that should receive bookings.
3. Out of the box, emails send from `onboarding@resend.dev` (fine for testing). For
   production, verify your domain in Resend and change the `from:` address in
   `src/app/api/bookings/route.ts`.
4. Bookings are saved to Supabase even if email fails — email is a courtesy copy.

### 4. Vercel (hosts the site)

1. At [vercel.com/new](https://vercel.com/new), import the `Service-Dashboard-` repository —
   Next.js is detected automatically.
2. **Important:** if the site code hasn't been merged to the default branch yet, go to
   **Project → Settings → Git → Production Branch** and set it to
   `claude/appliance-repair-website-4nl377`, then redeploy.
3. In the import screen (or later under **Settings → Environment Variables**), add all five
   variables from `.env.example`.
4. Deploy. Every push to the production branch redeploys automatically.

### 5. Your GoDaddy domain (optional)

Keep the domain at GoDaddy and point it at Vercel:

1. In Vercel: **Project → Settings → Domains** → add `yourdomain.ca` and `www.yourdomain.ca`.
2. In GoDaddy DNS management, add the records Vercel shows you (an `A` record `@ → 76.76.21.21`
   and a `CNAME` `www → cname.vercel-dns.com` — use the exact values Vercel displays).
3. Wait for DNS to propagate (minutes to a few hours). Vercel issues HTTPS automatically.
4. Update `siteUrl` in `src/content/business.ts` to the final domain (used for SEO tags/sitemap).

## Before launch checklist

- [ ] Replace placeholder testimonials in `src/content/testimonials.ts` with real reviews
- [ ] Confirm the business email in `src/content/business.ts` (currently a placeholder)
- [ ] Optionally swap the illustration images in `public/images/` for real photos (same filenames)
- [ ] Set `siteUrl` in `src/content/business.ts` to your production domain
- [ ] Submit `https://yourdomain/sitemap.xml` in [Google Search Console](https://search.google.com/search-console)

## Project structure

```
src/content/        ← ALL editable content (business info, services, cities, FAQs)
src/app/            ← pages & API routes (chat, bookings)
src/components/     ← sections, UI primitives, booking wizard, chat widget
supabase/migrations ← database schema
public/images/      ← site imagery
```
