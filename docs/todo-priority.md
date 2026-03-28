# Todo Priority

**Product priority order** (from `docs/product-scope.md`):  
1. Public booking flow → 2. Operator dashboard → 3. Admin dashboard → 4. Pricing engine → 5. Notifications → 6. Vendor onboarding → 7. Analytics.

**Constraint:** Web MVP only; no iOS. Build fast, scalable architecture, avoid overengineering.

Below: **engineering sequencing** that unlocks those product layers without blocking on the wrong dependency.

---

### Phase A — Foundation (blocks everything)

1. **Supabase persistence** — Replace `getStore()` in `lib/services/bookings.ts` (and related services) with repositories targeting `supabase/migrations/0001_init.sql` (extend schema for `quotes`, `drivers`, `disputes`, etc. as product scope requires).
2. **Row Level Security** — Policies per role (customer / operator / admin); service role only for privileged server actions.
3. **Unify environment variables** — Align `.env.example`, `lib/env.ts`, and `lib/supabase/client.ts` (`SUPABASE_*` vs `NEXT_PUBLIC_*` / publishable key naming).
4. **Supabase Auth** — Replace demo cookie auth; map `app_role` to JWT / `users` table; middleware or shared API guards.

### Phase B — Public booking flow (product priority #1)

5. **Stripe production path** — Payment Intents and/or Checkout; `/api/webhooks/stripe`; remove or replace fake card fields in `components/booking-planner.tsx`.
6. **Google Maps** — Ensure geocoding/routes in prod; add **embedded map** UI where product scope calls for it.
7. **UX** — Split large wizard file into modular steps; minimal steps to book; mobile polish; **dark mode** (e.g. `next-themes`) when ready.
8. **Lock down `/test`** or remove from production builds.

### Phase C — Operator dashboard (product priority #2)

9. **Incoming requests + accept/reject/submit quote** — Align API with marketplace “operator quotes” model from `docs/product-scope.md`.
10. **Fleet / vehicles** CRUD tied to `operators`.
11. **Availability calendar**, **drivers**, **payout history** — schema + UI in slices (do not monolith one PR).

### Phase D — Admin dashboard (product priority #3)

12. **Users and operators** management CRUD.
13. **Bookings** queue (partially exists) + **refunds** workflows.
14. **Disputes**, **moderation**, **commissions** + **pricing rules** (extend pricing editor).
15. **Analytics** — event instrumentation + dashboards (product priority #7 overlaps here).

### Phase E — Cross-cutting (product priorities #4–6)

16. **Pricing engine** — Marketplace fee, operator quotes, overrides; keep logic modular (`lib/services/pricing.ts` + new modules as needed).
17. **Notifications** — Email templates for all booking status transitions; structure for future SMS.
18. **Vendor onboarding** — Operator signup, verification, first fleet entry.

### Phase F — Quality

19. **Tests** — Vitest expansion + API route tests + Playwright for critical paths.
20. **Deployment** — Host env validation, `secure` cookies, CI.

---

*Revisit after schema changes or priority shifts. See `docs/product-scope.md` and `docs/ai-handoff.md`.*
