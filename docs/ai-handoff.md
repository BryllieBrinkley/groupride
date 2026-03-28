# GroupRide — AI Assistant Handoff

**Last updated:** 2026-03-27. **Authoritative product scope:** `docs/product-scope.md` (marketplace vision, roles, flows, UX bar, entity list, build priorities). **Repo:** Next.js App Router at repository root.

**Data reality:** Almost all product behavior today runs on an **in-memory demo store** (`lib/data/demo-store.ts`), not on Supabase tables—treat as **prototype layer** until persistence and RLS land.

---

## 1. Project Overview

### Product (what we are building)

GroupRide is a **marketplace** for **large-group transportation** (sprinters, party buses, charter buses, minibuses, shuttles, event transport). Use cases include weddings, sports travel, airports, corporate and church groups, nightlife, **multi-stop** routes, and eventually packages with hotels/flights.

**Roles:** Customer · Operator / vendor · Admin.

**Business model:** Request → operators review → **accept or quote** → customer **chooses operator** → **Stripe** captures payment → **platform fee** on each transaction.

**Full narrative, operator/admin requirements, design targets, and entity list:** see **`docs/product-scope.md`**.

### What exists in code today (compressed)

- **Web MVP slice:** quote/booking flows, booking detail, **operator offer accept/decline**, **admin** queue and pricing overrides, **email** hooks (Resend optional), **Stripe** path behind `DEMO_MODE`.
- **Differs from full product spec:** No competitive **quote** UX from multiple vendors as distinct rows; offers are closer to “dispatch offers” than full marketplace bidding. No **fleet / calendar / drivers / payouts / disputes / reviews / analytics** UIs. **Supabase Auth, RLS, storage, realtime** are **targets**, not completed.
- **Launch geography:** Demo data emphasizes **Charlotte** (`NEXT_PUBLIC_DEFAULT_LAUNCH_CITY`); product is nationwide in intent.

### Long-term vision

- Native **iOS** client on top of stable APIs (**out of scope until web MVP is solid**—see `docs/product-scope.md` constraints).
- Premium marketplace parity (Uber / Turo / Airbnb / Thumbtack **as quality bar**, not feature parity).

---

## 2. Tech Stack

### Target stack (product / engineering requirements)

| Area | Target |
|------|--------|
| **Framework** | Next.js App Router, **TypeScript** everywhere |
| **Styling / UI** | **Tailwind CSS**; **shadcn/ui**-style modular components (repo uses `components/ui/*`; align with shadcn patterns as you extend) |
| **Data** | **Supabase** Postgres with **RLS**; auth, storage, realtime as needed |
| **Payments** | **Stripe** — Checkout and/or Payment Intents |
| **Maps** | **Google Maps Platform** (geocoding, distance, routing) |
| **Validation** | **Zod** |
| **APIs** | Reusable route handlers; **server actions** where appropriate; stable JSON contracts for future mobile |

### Actual stack (this repo, current)

| Area | Choice |
|------|--------|
| **Frontend** | Next.js **15** (App Router), React **19**, TypeScript, Tailwind CSS **3** |
| **UI components** | Custom primitives under `components/ui/` (Button, Card, Input, etc.) — **not** full shadcn install via CLI; evolve toward shadcn parity |
| **Backend** | Next.js **Route Handlers** (`app/api/**`), Server Actions (e.g. logout), **no separate API server** |
| **Database (intended)** | **Supabase (Postgres)** — `supabase/migrations/0001_init.sql` |
| **Database (actual runtime)** | **In-memory global store** (`global.__GROUPRIDE_STORE__`) |
| **Auth (actual)** | Custom **HTTP-only cookie** (base64 JSON) + demo users in `demo-store` |
| **Auth (target)** | **Supabase Auth** + `users` / roles — **not wired** to app routes |
| **Payments** | **Stripe** SDK when `DEMO_MODE=false` and keys set; else demo; **no webhook route** yet |
| **Maps** | Google APIs when key + non-demo; else **haversine** fallback (`lib/adapters/maps.ts`, `lib/geo.ts`) |
| **Notifications** | **Resend** optional; in-memory `notification_logs` |
| **RLS** | **Not applied** in migration file as shipped—must be added when Supabase is system of record |
| **Tests** | **Vitest** (`tests/booking-services.test.ts`) |
| **Icons** | `lucide-react` |
| **Utilities** | `clsx`, `date-fns`, `date-fns-tz` |

**Key `package.json` dependencies:** `@supabase/ssr`, `@supabase/supabase-js`, `stripe`, `resend`, `zod`, `next`, `react`, `react-dom`.

---

## 3. Current Architecture

### Folder structure (high level)

```
app/           # Pages + API routes (App Router)
components/    # UI: shells, booking, admin, operator, shared UI under components/ui/
lib/
  adapters/    # maps.ts — routing/geocoding
  data/        # demo-store.ts — seeded in-memory DB
  services/    # bookings.ts, pricing.ts, matching.ts, payment.ts, notifications.ts
  supabase/    # client.ts — browser client (used by /test only)
  auth.ts, env.ts, types.ts, validation.ts, utils.ts, time.ts, geo.ts
supabase/migrations/
tests/
docs/          # This handoff + schema/routes/todo helpers
```

### Important routes / pages

See **`docs/current-routes.md`** for the full table. Summary:

- **Public funnel:** `/`, `/book`, `/quote`, `/checkout`, `/booking/[id]`, `/login`
- **Customer:** `/account`
- **Admin:** `/admin`, `/admin/bookings`, `/admin/operators`, `/admin/pricing`
- **Operator:** `/operator`, `/operator/offers`
- **Dev:** `/test` (Supabase client smoke test)

### Important components

- **`AppShell`** — Suppresses main header on `/`, `/quote`, `/checkout`.
- **`SiteHeader`** — Nav + login/logout; role-based links.
- **`PublicNavbar`**, **`HomeHero`** — Marketing shell.
- **`BookingPlanner`** — Large multi-screen booking wizard (intent, airport, team flows, vehicle, fake card capture).
- **`BookingCustomerActions`**, **`AdminBookingActions`**, **`OperatorOfferActions`** — Role-specific CTAs wired to API routes.
- **`PricingRuleEditor`** — Admin PATCH to update pricing.
- **UI primitives:** `components/ui/*` (Button, Card, Input, Label, Badge, Separator).

### Hooks, utilities, services

- **No centralized hooks directory** — Client components use React hooks inline.
- **`lib/services/bookings.ts`** — Core domain: `quoteBooking`, `createBooking`, lists, admin/operator actions, metrics, offer expiry (`expireOpenOffers`).
- **`lib/services/pricing.ts`** — Vehicle choice, fees, review triggers.
- **`lib/services/matching.ts`** — Operator eligibility by service area / vehicle.
- **`lib/services/payment.ts`** — Stripe vs demo capture.
- **`lib/services/notifications.ts`** — Resend + in-memory log.
- **`lib/time.ts`**, **`lib/utils.ts`** — Formatting, IDs, dates.

### API patterns

- REST-style **JSON** route handlers; errors often `400` with `{ error: string }`.
- Domain logic lives in **services**, not in route files (routes stay thin).

### State management

- **Server:** Demo store singleton (mutable global).
- **Client:** Local `useState` / `useTransition`; no Redux/Zustand.
- **Session:** Cookie via `next/headers` (`getSessionUser`, `setSession`, `clearSession`).

### Database schema overview

See **`docs/current-schema.md`**. Application entities mirror TS types in **`lib/types.ts`**; SQL migration is the target shape for Supabase.

### Supabase table overview

Tables: `users`, `customer_profiles`, `operators`, `operator_service_areas`, `vehicles`, `pricing_rules`, `bookings`, `booking_stops`, `booking_offers`, `payment_method_records`, `payment_attempts`, `notification_logs`, `audit_logs`. **Not used by main app persistence yet.**

### Environment variables required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | App URL for links (default localhost) |
| `NEXT_PUBLIC_MARKET_NAME` | Brand string |
| `NEXT_PUBLIC_DEFAULT_LAUNCH_CITY` | Market label (e.g. Charlotte) |
| `DEMO_MODE` | Default **true**; when `false`, Stripe/Resend/Maps used if keys present |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | In **`lib/env.ts`** (server-oriented naming) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Used by **`lib/supabase/client.ts`** (browser client) — **naming mismatch** with `.env.example` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe (webhook secret unused until webhook route exists) |
| `GOOGLE_MAPS_API_KEY` | Geocoding + directions |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email |
| `SESSION_COOKIE_SECRET` | Declared in `lib/env.ts`; **session cookie is not HMAC-signed today** |

Reference: **`.env.example`** at repo root (differs from Supabase client variable names—treat as tech debt).

---

## 4. Features Already Built

For each: **exists / files / gaps / known issues.**

### Marketing home

- **Exists:** Hero, how-it-works, public styling.
- **Files:** `app/page.tsx`, `components/home-hero.tsx`, `components/public-navbar.tsx`.
- **Gaps:** No CMS; content is static.

### Quote API + quote page

- **Exists:** POST `/api/quote`; `/quote` reads query params and displays vehicle choices.
- **Files:** `app/api/quote/route.ts`, `app/quote/page.tsx`, `lib/services/bookings.ts` (`quoteBooking`).
- **Gaps:** Quote page depends on URL params—no full form on that page alone.
- **Limits:** Validation errors surface as messages; Maps fallback if no key.

### Booking wizard (`/book`)

- **Exists:** Multi-step flow (intent, airport, team, destination, vehicle, checkout with fake card fields).
- **Files:** `components/booking-planner.tsx`, `app/book/page.tsx`.
- **Gaps:** Card inputs are **not** Stripe Elements; payment token is simulated.
- **Limits:** Complex flow—mobile polish varies by screen.

### Checkout (`/checkout`)

- **Exists:** Simpler path: contact + POST `createBooking`.
- **Files:** `app/checkout/page.tsx`, `app/api/bookings/route.ts`.

### Booking detail (`/booking/[bookingId]`)

- **Exists:** Status display, customer actions (cancel, approve revision, payment recovery when tokens apply).
- **Files:** `app/booking/[bookingId]/page.tsx`, `components/booking-customer-actions.tsx`.
- **Gaps:** Deep-link security relies on opaque tokens on the booking record.

### Login / logout

- **Exists:** Email/password against demo users; session cookie.
- **Files:** `app/login/page.tsx`, `components/login-form.tsx`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `lib/auth.ts`.
- **Gaps:** No Supabase Auth; passwords stored in plaintext in demo store.

### Admin dashboard & queue

- **Exists:** Metrics, booking queue snippets, full booking list, price override, review actions, pricing editor, operator directory view.
- **Files:** `app/admin/**/*.tsx`, `components/admin-booking-actions.tsx`, `components/pricing-rule-editor.tsx`, API routes under `app/api/admin/**`.
- **Gaps:** Operators/pricing/vehicles are **not** fully CRUD—seeding + in-memory updates only.

### Operator dashboard & offers

- **Exists:** Lists offers and bookings; accept/decline.
- **Files:** `app/operator/page.tsx`, `app/operator/offers/page.tsx`, `components/operator-offer-actions.tsx`, `app/api/operator/**`.

### Customer account

- **Exists:** `/account` lists trips for logged-in customer.
- **Files:** `app/account/page.tsx`, `listCustomerBookings` in `lib/services/bookings.ts`.

### Notifications

- **Exists:** `sendNotification` logs and optionally emails via Resend.
- **Files:** `lib/services/notifications.ts`.
- **Gaps:** HTML body is minimal; no templates.

### Automated tests

- **Exists:** Vitest coverage for quote, create booking, offer expiry, accept offer.
- **Files:** `tests/booking-services.test.ts`, `vitest.config.ts`.

---

## 5. Features Not Yet Built

Aligned to **`docs/product-scope.md`** (product) vs **repo** (implementation).

### Infrastructure / platform

- **Supabase as system of record** — wire `lib/services/*` to Postgres; **RLS policies** for all tenant-scoped tables.
- **Supabase Auth** — replace demo cookie; customer/operator/admin onboarding.
- **Storage / Realtime** — not used yet; add when messaging or live trip tracking needs them.
- **Stripe webhooks**, idempotent payment state, Checkout or Elements for real PM/SCA.
- **Embedded map UI** — product calls for maps alongside address fields; today only server-side routing/geocode.

### Marketplace flows (product spec)

- **Operator-submitted quotes** as first-class competing offers; **customer choice** among operators (today: offers are more “dispatch acceptance” than full bidding UI).
- **Payouts**, **commission** reporting, **disputes**, **reviews** — entities listed in product scope; **no tables/UI** completed end-to-end.

### Operator dashboard gaps

- **Fleet management** (full CRUD), **availability calendar**, **drivers**, **payout history** — specified in product scope; **not built**.

### Admin dashboard gaps

- **All users** CRUD, **disputes**, **analytics**, **vendor moderation** beyond static lists — **not built**.

### Other

- **Scheduled jobs** — e.g. `expireOpenOffers` not on a cron in production.
- **iOS** — explicitly **deferred** (see product constraints).

---

## 6. UX / UI Direction

### Product bar (target)

- **Premium marketplace** feel — quality aspiration: **Uber**, **Turo**, **Airbnb**, **Thumbtack**.
- **Modern, minimal**; **mobile responsive**; **dark + light mode**.
- **Short path** to book; strong **cards**, **maps**, **pricing modules**, **vehicle cards**, clear **dashboards**.

### Current implementation

- **Tailwind** tokens in `tailwind.config.ts` (`ink`, `copy`, `accent`, etc.); **Inter** font (`app/layout.tsx`).
- **Light mode only** today (`color-scheme: light` in `app/globals.css`) — **dark mode is a gap**.
- **Components:** `components/ui/*`, `PageHeader`, dashboards — professional ops look; marketing home uses a distinct minimal style.
- **Monolithic risk:** `booking-planner.tsx` is large — product asks to **split** into smaller modules over time.

### Areas needing polish

- Dark mode theme tokens + `next-themes` (or equivalent).  
- Map and pricing modules on public flow.  
- Replace fake card UX with Stripe; loading skeletons; `/test` lockdown.

---

## 7. Current Priorities (Ranked)

**Product order** (from `docs/product-scope.md`): (1) Public booking flow → (2) Operator dashboard → (3) Admin dashboard → (4) Pricing engine → (5) Notifications → (6) Vendor onboarding → (7) Analytics.

**Engineering order** (what unblocks the above safely):

1. **Supabase persistence + RLS** — otherwise no production marketplace.  
2. **Supabase Auth** + env cleanup (`NEXT_PUBLIC_*` vs `SUPABASE_*`).  
3. **Public flow polish** — Stripe UI, maps, fewer steps where possible, component splits.  
4. **Operator dashboard depth** — quotes, fleet, calendar, drivers, payouts (iterate in slices).  
5. **Admin depth** — users, disputes, commissions, analytics, moderation.  
6. **Pricing engine** — already partially in `lib/services/pricing.ts`; extend for commissions and operator quotes.  
7. **Notifications** — templates, all status transitions, optional SMS later.  
8. **Vendor onboarding** — operator signup, verification, fleet intake.  
9. **Analytics** — events + admin dashboards.  
10. **Tests / CI / remove or protect `/test`**.

*(Detailed engineering backlog: `docs/todo-priority.md`.)*

---

## 8. Known Problems / Tech Debt

- **Data loss** on server restart (in-memory store).
- **Session cookie** is unsigned JSON; `secure: false` in `setSession` (dev-friendly, not production-safe).
- **Supabase env mismatch** between `.env.example`, `lib/env.ts`, and `lib/supabase/client.ts`.
- **No Next.js middleware** for auth—each page calls `requireRole` (API routes may need the same checks consistently).
- **Stripe webhook secret** unused; no idempotency layer for payments.
- **`expireOpenOffers`** not scheduled in production path.
- **Tests** only cover service layer, not HTTP or UI.
- **Security:** Demo passwords in repo seed; `/test` exposes DB test button; **RLS** not defined in checked-in migration—add before production Supabase.

---

## 9. Recommended Next Steps (5–10 Tasks)

1. Add a **repository / data-access layer** and migrate `bookings.ts` off `getStore()` behind interfaces (keeps APIs stable for future iOS).
2. Apply **Supabase migration** + write **RLS** for `users`, `bookings`, `operators`, etc.
3. **Unify env** and validate at boot; document client vs server keys.
4. **Supabase Auth** + role mapping; protect API routes consistently (middleware or shared guard).
5. **Stripe:** webhook route + Checkout/Elements + remove demo card fields from `BookingPlanner`.
6. **Split** `booking-planner.tsx` into route steps/components per product UX goals.
7. **Operator slice:** vendor onboarding MVP + fleet CRUD (schema may need extension vs product entity list).
8. **Admin slice:** user list + refunds/disputes stubs before full analytics.
9. **E2E** tests for quote → book → operator action on real Supabase test project.
10. **Dark mode** tokens + `next-themes` when core flows are stable.

---

## 10. Important Files

| File | Why it matters |
|------|----------------|
| `lib/services/bookings.ts` | Entire booking lifecycle and admin/operator actions. |
| `lib/data/demo-store.ts` | All seed data and in-memory persistence. |
| `lib/types.ts` | Canonical domain types for TS layer. |
| `lib/auth.ts` | Session implementation and `requireRole`. |
| `lib/env.ts` | Centralized env with `demoMode` behavior. |
| `lib/adapters/maps.ts` | Google vs fallback routing. |
| `lib/services/payment.ts` | Stripe vs demo payment capture. |
| `lib/validation.ts` | Zod schemas for trip and login input. |
| `supabase/migrations/0001_init.sql` | Target Postgres schema. |
| `components/booking-planner.tsx` | Main customer UX surface. |
| `components/app-shell.tsx` | Public vs authenticated chrome split. |
| `app/layout.tsx` | Root layout, fonts, global CSS. |
| `package.json` | Scripts and dependency versions. |
| `README.md` | Human quick start and demo credentials. |
| `tests/booking-services.test.ts` | Regression tests for core flows. |

---

*End of handoff. **Product scope:** `docs/product-scope.md`. **Indexes:** `docs/current-schema.md`, `docs/current-routes.md`, `docs/todo-priority.md`.*
