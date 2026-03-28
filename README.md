# GroupRide

Marketplace platform for **large-group transportation** (sprinters, charter and party buses, minibuses, shuttles, event transport). Customers submit trips; **operators** review, accept, or quote; customers confirm; **Stripe** captures payment; GroupRide takes a **marketplace fee**.

**Product scope (authoritative):** [`docs/product-scope.md`](docs/product-scope.md) · **Engineering handoff:** [`docs/ai-handoff.md`](docs/ai-handoff.md)

## Stack

- Next.js App Router (TypeScript, Tailwind CSS)
- Target: **Supabase** (auth, database, storage, realtime) with **RLS** — current demo uses in-memory store; see docs
- **Stripe** (Checkout / Payment Intents target) with demo fallback
- **Google Maps Platform** for geocoding/routing when configured; local estimator fallback
- Zod validation · Vitest for service-level tests

## Quick Start

1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The app runs in `DEMO_MODE=true` by default so core booking, operator, and admin flows work without external credentials.

## Demo Credentials

- Admin: `admin@groupride.app` / `Admin123!`
- Operator: `ops@charlottemobility.com` / `Operator123!`

## Notes

- The project is structured around stable internal APIs so a native iOS client can be added later without reworking business logic.
- Database schema starters live in `supabase/migrations`.
