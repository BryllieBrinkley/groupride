# Current Routes

Next.js App Router. **Public shell:** `AppShell` (`components/app-shell.tsx`) omits `SiteHeader` on `/`, `/quote`, and `/checkout` (those pages use `PublicNavbar` where needed). All other pages render inside `SiteHeader` + `app-shell` layout.

## Pages (`app/**/page.tsx`)

| Path | Auth | Description |
|------|------|-------------|
| `/` | Public | Marketing home (`HomeHero`, how-it-works) |
| `/book` | Public | Multi-step booking wizard (`BookingPlanner`) |
| `/quote` | Public | Quote from query params; POSTs to `/api/quote` |
| `/checkout` | Public | Short checkout form; POSTs to `/api/bookings` |
| `/login` | Public | Login form → `/api/auth/login` |
| `/booking/[bookingId]` | Public (detail); actions gated | Booking status, tokens in URL for approval/payment recovery |
| `/account` | Customer (`requireRole`) | List of customer’s trips |
| `/admin` | Admin | Ops dashboard + metrics |
| `/admin/bookings` | Admin | Booking queue and actions |
| `/admin/operators` | Admin | Read-only operator directory view |
| `/admin/pricing` | Admin | Editable pricing rules (per category) |
| `/operator` | Operator | Inbox-style overview |
| `/operator/offers` | Operator | Offer queue |
| `/test` | Public | Dev Supabase smoke test (remove or protect in production) |

## API routes (`app/api/**/route.ts`)

| Method | Path | Role / notes |
|--------|------|----------------|
| POST | `/api/auth/login` | Email/password → session cookie |
| POST | `/api/auth/logout` | Clears session |
| POST | `/api/quote` | `quoteBooking` |
| POST | `/api/bookings` | `createBooking` |
| GET | `/api/bookings/[bookingId]` | Booking JSON |
| POST | `/api/bookings/[bookingId]/cancel` | Cancel + refund rules |
| POST | `/api/bookings/[bookingId]/approve-revision` | Customer approves revised price |
| POST | `/api/bookings/[bookingId]/recover-payment` | Token-based payment retry |
| POST | `/api/operator/offers/[offerId]/accept` | Operator accepts |
| POST | `/api/operator/offers/[offerId]/decline` | Operator declines |
| POST | `/api/admin/bookings/[bookingId]/review` | Admin route offers / close / no supply |
| POST | `/api/admin/bookings/[bookingId]/override-price` | Admin price override |
| PATCH | `/api/admin/pricing/[ruleId]` | Update pricing rule |

There is **no** Stripe webhook route in the repo yet (`STRIPE_WEBHOOK_SECRET` is reserved in `lib/env.ts`).

## Hard-coded demo links

`SiteHeader` links “Track request” to `/booking/booking_offer_demo` (a seeded demo id in `lib/data/demo-store.ts`).
