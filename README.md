# Service Dashboard

A field-service management app (think **Jobber** / **ServiceTitan**) to organize
jobs, scheduling, and billing for a solo operator — built as a responsive,
installable PWA that runs on **Android and desktop** from one codebase.

- Product overview: [`JOB_MANAGEMENT_APP.md`](./JOB_MANAGEMENT_APP.md)
- Technical design: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

> **Status: Phase 0 (Foundation).** Google sign-in, protected app shell,
> navigation, the full database schema, and Row Level Security are in place.
> Clients, jobs, the pipeline board, scheduling, and billing come in later phases.

## Tech Stack
React + Vite + TypeScript · Tailwind + shadcn/ui · React Router · TanStack Query ·
Zustand · React Hook Form + Zod · Supabase (Postgres + Auth + Storage + Edge
Functions + RLS) · Square (Phase 3) · Capacitor (Phase 5).

## Prerequisites
- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) project
- A [Google Cloud](https://console.cloud.google.com) project (for Google sign-in)
- (Optional, Phase 0 DB work) the [Supabase CLI](https://supabase.com/docs/guides/cli)

## 1. Install & run
```bash
npm install
cp .env.example .env.local   # then fill in the two VITE_ values (step 3)
npm run dev                  # http://localhost:5173
```
Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`.

## 2. Set up the database
With the Supabase CLI:
```bash
supabase link --project-ref <your-project-ref>
supabase db push             # applies supabase/migrations/0001 → 0005
```
Or paste each file in `supabase/migrations/` (in order) into the Supabase
dashboard SQL editor. The migrations create the schema, the first-login trigger,
all RLS policies, and the private `job-attachments` storage bucket.

To regenerate the TypeScript types after schema changes:
```bash
supabase gen types typescript --linked > src/types/database.types.ts
```

## 3. Configure Google sign-in
**In Google Cloud Console:**
1. Create/select a project → **APIs & Services → OAuth consent screen** (External;
   add yourself as a test user while in testing).
2. **Credentials → Create credentials → OAuth client ID → Web application.**
   - **Authorized JavaScript origins:** `http://localhost:5173` and your production origin.
   - **Authorized redirect URIs:** your Supabase callback —
     `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Copy the **Client ID** and **Client Secret**.

**In the Supabase dashboard:**
1. **Authentication → Providers → Google** → enable, paste the Client ID + Secret.
2. **Authentication → URL Configuration** → set **Site URL** and add every
   redirect target to the allow-list (e.g. `http://localhost:5173/auth/callback`
   and your production `…/auth/callback`). *A redirect URL that isn't on the
   allow-list makes login silently fail.*

**In `.env.local`** (values from **Project Settings → API**):
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

## 4. Sign in
Run `npm run dev`, open the app, and click **Continue with Google**. On first
login the database trigger automatically creates your profile, a personal
organization, and an owner membership — no manual setup needed.

## Project layout
See [`ARCHITECTURE.md`](./ARCHITECTURE.md#project-structure) for the full tree.
Key entry points: `src/app/App.tsx`, `src/app/routes.tsx`,
`src/services/auth.ts`, `src/lib/supabase.ts`, `supabase/migrations/`.

## Security notes
- Never expose the Supabase **service role key** or the **Square** token/webhook
  key to the browser — those are Edge Function secrets only (`.env.example`).
- RLS is enforced on every table; cross-organization access is denied by default.
