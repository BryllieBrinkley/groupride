# GroupRide — Product Scope (Authoritative)

**Purpose:** Single source of truth for **what we are building** (marketplace, flows, roles, UX bar, technical targets). For **what is implemented in the repo today**, see `docs/ai-handoff.md` and the “Implementation gap” notes below.

**Constraints:** Web MVP only — **no iOS app yet**. Build fast, keep architecture scalable, avoid overengineering, stay production-ready.

---

## What GroupRide is

A **marketplace platform** for booking **large-group transportation**: sprinter vans, party buses, charter buses, minibuses, shuttle vans, and event transportation.

### Primary use cases

- Weddings  
- AAU and youth sports travel  
- Airport transportation  
- Bachelor/bachelorette parties  
- Corporate events  
- Church groups  
- School trips  
- Concerts and nightlife  
- **Multi-stop** group transportation  
- **Future:** Travel packages that may include hotels and flights (out of initial MVP)

### Business model

1. Customer submits a trip request.  
2. Operators receive and review the request.  
3. Operators **accept** or **submit quotes** (competitive quotes are in scope for the product; implementation may phase in).  
4. Customer **chooses an operator**.  
5. **Stripe** captures payment.  
6. **GroupRide** takes a **marketplace fee** on every transaction.

### Long-term vision

- Nationwide operator network.  
- Stable **HTTP APIs** so a **native iOS app** can be added later without rewriting core business logic.  
- Premium marketplace experience comparable to category leaders (see Design direction).

---

## User roles

| Role | Description |
|------|-------------|
| **Customer** | Books trips, compares options, pays, tracks status. |
| **Operator / transportation vendor** | Receives requests, quotes, accepts/rejects, manages fleet and operations. |
| **Admin** | Platform operations: users, operators, disputes, commissions, pricing, analytics, moderation, refunds. |

---

## Target customer journey (happy path)

1. User enters pickup, dropoff, stops, passenger count, vehicle type, event type, and trip details.  
2. User sees **estimated pricing range** (or quote UX as product evolves).  
3. User submits request.  
4. Operators receive the request.  
5. Operator accepts or sends a quote.  
6. Customer **confirms** booking (and selected operator where applicable).  
7. Payment is captured (**Stripe**).  
8. Customer receives **confirmation** and **ongoing trip status** updates (email and, later, other channels).

---

## Operator dashboard (product requirements)

- View **incoming requests**  
- **Accept / reject** requests  
- **Submit quotes**  
- Manage **fleet / vehicles**  
- Manage **availability calendar**  
- Manage **drivers**  
- View **payout history**  
- Track **upcoming rides**

**Implementation note:** The repo today has a thinner slice (e.g. offers accept/decline, lists). Fleet, calendar, drivers, and payouts are **not** built end-to-end yet.

---

## Admin dashboard (product requirements)

- Manage **all users**  
- Manage **operators**  
- **Review disputes**  
- Manage **commissions** and **pricing rules**  
- View **bookings**  
- View **analytics**  
- **Moderate vendors**  
- Handle **refunds**

**Implementation note:** Current web app has bookings queue, pricing rules editor, and operator directory views; disputes, full user management, analytics, and moderation are **largely not built**.

---

## MVP scope (technical targets)

| Area | Target |
|------|--------|
| **Client** | Web-first **Next.js** (App Router), **TypeScript**, **Tailwind CSS** |
| **UI kit** | **shadcn/ui** components (modular, reusable; avoid monolithic UI files) |
| **Backend** | **Supabase**: auth, database, storage, realtime (as features need them) |
| **Payments** | **Stripe** — Checkout and/or Payment Intents as appropriate |
| **Maps** | **Google Maps Platform** — distance, geocoding, route calculations |
| **Notifications** | Email for booking status updates (expand later) |
| **APIs** | Reusable, stable JSON surface for future native app |
| **Server** | Server Actions where appropriate; **Zod** for validation |
| **Security** | **Supabase Row Level Security (RLS)** on Postgres |

---

## Important database entities (product model)

Conceptual entities to plan schema and features around:

`users` · `operators` · `vehicles` · `bookings` · `quotes` · `payments` · `trips` · `drivers` · `availability` · `notifications` · `reviews` · `disputes`

**Implementation note:** The checked-in migration (`supabase/migrations/0001_init.sql`) covers a subset and uses different naming in places (e.g. `booking_offers` vs a dedicated `quotes` table). Align or extend schema as Supabase becomes the system of record.

---

## Design direction

- **Premium transportation marketplace** feel — polish comparable to **Uber**, **Turo**, **Airbnb**, **Thumbtack** (aspirational bar).  
- **Modern, minimal** UI.  
- **Mobile responsive** everywhere.  
- **Dark and light mode** support.  
- **Ease of use** — minimal steps to complete a booking.  
- Clear **cards**, **maps**, **pricing modules**, **vehicle cards**, and **dashboards**.

**Implementation note:** Current app is **light-mode-first**; dark mode is a **target**, not fully implemented in `globals.css` / theme tokens yet.

---

## Build priority (product order)

1. Public booking flow  
2. Operator dashboard  
3. Admin dashboard  
4. Pricing engine  
5. Notifications  
6. Vendor onboarding  
7. Analytics  

Engineering sequencing may interleave infrastructure (Supabase auth, persistence, Stripe webhooks) so these product layers can ship safely—see `docs/todo-priority.md`.

---

## Implementation gap (summary)

Until Supabase backs the app and auth is real:

- Data is largely **in-memory demo** — not production.  
- **Operator quote submission**, **customer pick among operators**, **fleet/calendar/drivers/payouts**, **disputes/reviews/analytics**, and **full RLS** are **not** done.  
- **iOS** is explicitly **out of scope** for now.

For file-level detail, see **`docs/ai-handoff.md`**.
