create extension if not exists pgcrypto;

create type app_role as enum ('admin', 'operator', 'customer');
create type vehicle_category as enum ('suv', 'sprinter', 'minibus');
create type trip_type as enum ('one_way', 'round_trip', 'hourly');
create type booking_status as enum (
  'draft',
  'quoted',
  'requested',
  'operator_offer_open',
  'manual_review_pending',
  'customer_approval_required',
  'operator_accepted',
  'payment_processing',
  'payment_action_required',
  'confirmed',
  'offer_expired',
  'no_operator_available',
  'cancelled',
  'refunded',
  'closed_unfulfilled'
);
create type offer_status as enum ('pending', 'accepted', 'declined', 'expired', 'closed');
create type payment_status as enum ('not_collected', 'payment_method_saved', 'processing', 'requires_action', 'paid', 'refunded');

create table users (
  id uuid primary key default gen_random_uuid(),
  role app_role not null,
  email text unique not null,
  name text not null,
  phone text,
  operator_id uuid,
  customer_profile_id uuid,
  created_at timestamptz not null default now()
);

create table customer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create table operators (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  rating numeric(3,2) not null default 5.0,
  status text not null,
  created_at timestamptz not null default now()
);

create table operator_service_areas (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references operators(id) on delete cascade,
  label text not null,
  city text not null,
  state text not null,
  latitude numeric not null,
  longitude numeric not null,
  radius_miles numeric not null,
  is_launch_market boolean not null default false
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references operators(id) on delete cascade,
  name text not null,
  category vehicle_category not null,
  capacity integer not null,
  quantity integer not null default 1,
  active boolean not null default true
);

create table pricing_rules (
  id uuid primary key default gen_random_uuid(),
  category vehicle_category not null unique,
  base_fare numeric not null,
  rate_per_mile numeric not null,
  minimum_fare numeric not null,
  hourly_rate numeric not null,
  minimum_hours integer not null
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references customer_profiles(id),
  customer_user_id uuid references users(id) on delete set null,
  channel text not null default 'web',
  trip_type trip_type not null,
  pickup_timezone text not null,
  pickup_label text not null,
  dropoff_label text not null,
  pickup_datetime_utc timestamptz not null,
  pickup_datetime_local text not null,
  return_datetime_utc timestamptz,
  return_datetime_local text,
  passengers integer not null,
  luggage_count integer not null default 0,
  vehicle_category vehicle_category not null,
  price_locked_amount numeric not null,
  active_amount numeric not null,
  distance_miles numeric not null,
  estimated_duration_minutes integer not null,
  service_fee numeric not null,
  coverage_status text not null,
  review_triggers text[] not null default '{}',
  status booking_status not null,
  payment_status payment_status not null,
  selected_operator_id uuid references operators(id) on delete set null,
  selected_offer_id uuid,
  offer_expires_at timestamptz,
  price_override_reason text,
  approval_token text,
  payment_recovery_token text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table booking_stops (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  stop_order integer not null,
  label text not null,
  latitude numeric not null,
  longitude numeric not null
);

create table booking_offers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  operator_id uuid not null references operators(id) on delete cascade,
  vehicle_category vehicle_category not null,
  status offer_status not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  acted_at timestamptz
);

create unique index unique_accepted_offer_per_booking
  on booking_offers (booking_id)
  where status = 'accepted';

create table payment_method_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  customer_email text not null,
  provider text not null,
  provider_payment_method_id text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table payment_attempts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric not null,
  provider text not null,
  provider_intent_id text not null,
  status payment_status not null,
  failure_reason text,
  created_at timestamptz not null default now()
);

create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  type text not null,
  recipient text not null,
  channel text not null default 'email',
  subject text not null,
  sent_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  actor text not null,
  action text not null,
  details text not null,
  created_at timestamptz not null default now()
);
