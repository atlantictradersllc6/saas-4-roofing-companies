# Ridgeline — Roofing OS

An operations console for roofing companies: **leads/CRM, estimates, crew scheduling, and invoicing.** Built with **Next.js 16 (App Router) + TypeScript + Neon Postgres**.

It runs two ways with zero code changes:

- **Preview mode** (default) — no database needed. The app shows realistic sample data so you can click through everything immediately.
- **Connected mode** — set one env var (`DATABASE_URL`) and it reads/writes your Neon Postgres database.

---

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. You'll land on the dashboard in preview mode (a banner tells you so).

---

## How the pieces fit (the part worth understanding)

Three layers. Each page only talks to the layer directly below it — that's what keeps it swappable.

```
  Pages  ──►  Data layer (lib/queries.ts)  ──►  Neon Postgres
 (what you see)      (the switch)                  (your data)
                          │
                          └──► Sample data  (when DATABASE_URL is unset)
```

### 1. Server Components fetch data on the server

Every page (e.g. `app/(app)/dashboard/page.tsx`) is an `async` **Server Component**. It calls the data layer and renders with the result *before* anything reaches the browser — no loading spinners, and your database URL never touches the client. (This is why Next.js beats a plain React SPA here: a SPA has no server, so it can't query securely.)

### 2. The data layer is the switch (`lib/queries.ts`)

Each function does the same thing:

```ts
if (!isDbConfigured()) return SAMPLE_DATA;   // no DATABASE_URL → demo
return sql`select * from leads ...`;         // DATABASE_URL set → Neon
```

Because pages only see the *return value*, connecting Neon is just setting one env var. Nothing in the pages changes.

### 3. Client Components + Server Actions for writes

Interactive bits are small `"use client"` components; writes go through **Server Actions** (`app/(app)/*/actions.ts`) that run on the server and persist to Neon. Highlights:

- **Estimate builder** (`components/EstimateBuilder.tsx`) — line amounts live in React state; subtotal/tax/total recompute instantly; **Save line items** persists them.
- **Pipeline drag-and-drop** (`components/LeadsBoard.tsx`) — drag a lead between stages; `useOptimistic` moves the card instantly while `updateLeadStage` saves.

> **Auth:** this build has no login — Neon is a database only. If you need sign-in later, add [Auth.js](https://authjs.dev) (a small, separate layer). The earlier Supabase auth was removed when we moved to Neon.

---

## Connect your Neon database

**Via Vercel (recommended):**

1. In your Vercel project → **Storage** → **Create Database** → **Neon** (Postgres). Follow the prompts (free tier is fine).
2. Open the store's **`.env.local`** tab and copy the **pooled** `DATABASE_URL`.
3. Locally: paste it into `.env.local`, then seed the database:
   ```bash
   npm run db:migrate      # runs db/schema.sql then db/seed.sql
   ```
4. Restart `npm run dev`. The banner disappears and every screen now reads from Postgres.

When you deploy, Vercel injects the same `DATABASE_URL` into the project automatically (that's what the integration does), so production is connected with no extra config.

**Standalone Neon** works too: sign up at [neon.tech](https://neon.tech), create a project, copy the connection string into `.env.local`, and run `npm run db:migrate`.

---

## Deploy to Vercel

```bash
# push to a Git repo, then "Import Project" in Vercel — or use the Vercel CLI
```

It's a standard Next.js app; Vercel auto-detects everything. Make sure the Neon `DATABASE_URL` is set in the project's environment variables (the Neon integration does this for you).

---

## Project map

```
app/
  layout.tsx              root layout + fonts
  page.tsx                → redirects to /dashboard
  (app)/
    layout.tsx            sidebar + top bar shell (+ preview banner)
    dashboard/page.tsx    KPIs, revenue chart, today, activity
    leads/                pipeline kanban + New Lead + drag-and-drop
    estimates/            editable estimate builder + New Estimate
    invoices/             invoice table + New Invoice
    schedule/page.tsx     crew week grid
    */actions.ts          Server Actions (writes) per section
components/               Sidebar, Topbar, and the client widgets
lib/
  db.ts                   Neon client + isDbConfigured() + num()
  queries.ts              THE SWITCH (Neon or sample data)
  preview-store.ts        in-memory store for preview-mode writes
  sample-data.ts          demo records
  types.ts                domain types (mirror the DB tables)
  format.ts               money/initials/nextRef helpers
db/
  schema.sql              tables
  seed.sql                the sample records
scripts/migrate.mjs       applies schema + seed to Neon (npm run db:migrate)
```

---

## What's wired vs. what's next

**Working now:** all five screens; create leads / invoices / estimates; edit + save estimate line items; drag-and-drop leads between stages; light/dark theme. Every write runs through a Server Action that hits Neon when connected, or the in-memory store in preview mode.

**Natural next steps:** authentication (Auth.js), "Send proposal" / PDF export, and multi-tenancy (a `company_id` column + scoping) for a real multi-company SaaS.
