# Current Database Schema (Supabase / Postgres)

Source: `supabase/migrations/0001_init.sql`. **Product model** (quotes, drivers, disputes, reviews, etc.) is broader in `docs/product-scope.md`—expect future migrations.

**Status:** The migration defines the intended production schema. **Application business logic does not read or write these tables yet** (bookings, operators, etc. are served from the in-memory demo store in `lib/data/demo-store.ts`). The `/test` page uses `@supabase/supabase-js` to `select` from `bookings` for connectivity checks only.

## Extensions

- `pgcrypto` (for `gen_random_uuid()`)

## Enums

| Name | Values |
|------|--------|
| `app_role` | `admin`, `operator`, `customer` |
| `vehicle_category` | `suv`, `sprinter`, `minibus` |
| `trip_type` | `one_way`, `round_trip`, `hourly` |
| `booking_status` | `draft`, `quoted`, `requested`, `operator_offer_open`, `manual_review_pending`, `customer_approval_required`, `operator_accepted`, `payment_processing`, `payment_action_required`, `confirmed`, `offer_expired`, `no_operator_available`, `cancelled`, `refunded`, `closed_unfulfilled` |
| `offer_status` | `pending`, `accepted`, `declined`, `expired`, `closed` |
| `payment_status` | `not_collected`, `payment_method_saved`, `processing`, `requires_action`, `paid`, `refunded` |

## Tables (summary)

| Table | Purpose |
|-------|---------|
| `users` | User accounts: role, email, name, optional `operator_id` / `customer_profile_id` |
| `customer_profiles` | Customer contact records linked to optional `user_id` |
| `operators` | Charter/transport companies (`company_name`, `rating`, `status`) |
| `operator_service_areas` | Geo coverage: city/state, lat/lng, `radius_miles`, `is_launch_market` |
| `vehicles` | Fleet per operator: category, capacity, quantity, `active` |
| `pricing_rules` | One row per `vehicle_category` (unique): base fare, per-mile, minimums, hourly |
| `bookings` | Trip request + pricing snapshot + status + payment + selected operator/offer tokens |
| `booking_stops` | Ordered stops with coordinates for a booking |
| `booking_offers` | Operator offers on a booking; partial unique index: one accepted offer per booking |
| `payment_method_records` | Saved payment methods per booking (provider id + status) |
| `payment_attempts` | Charge attempts with Stripe intent id and status |
| `notification_logs` | Email (or future channel) audit log |
| `audit_logs` | Generic action log for ops |

## Notable constraints

- `booking_offers`: unique partial index `unique_accepted_offer_per_booking` where `status = 'accepted'`.

## TypeScript mirror

Runtime types and enums are duplicated in `lib/types.ts` for the demo layer (some fields on `Booking` exist in TS but not yet as columns in SQL—e.g. trip intent flags—plan for alignment when migrating to Supabase).
