# GroupRide

Web-first operations-heavy MVP for nationwide group transportation booking.

## Stack

- Next.js App Router
- TypeScript + Tailwind CSS
- Supabase-ready data/auth adapters with demo-mode fallbacks
- Stripe-ready payment orchestration with demo payment adapter
- Google Maps-ready routing adapter with local mileage estimator fallback
- Vitest for service-level tests

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
