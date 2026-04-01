create extension if not exists "pgcrypto";

create type public.role as enum ('customer', 'operator', 'admin');
create type public.profile_status as enum ('active', 'invited', 'suspended');
create type public.operator_status as enum ('pending', 'active', 'suspended');
create type public.driver_status as enum ('active', 'inactive');
create type public.vehicle_status as enum ('active', 'inactive', 'maintenance');
create type public.trip_type as enum ('one_way', 'round_trip', 'hourly');
create type public.trip_intent as enum ('airport', 'event', 'team', 'corporate', 'other');
create type public.vehicle_category as enum ('suv', 'sprinter', 'minibus', 'charter_bus');
create type public.booking_status as enum ('pending', 'quoted', 'awaiting_payment', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'expired', 'rejected', 'cancelled');
create type public.payment_status as enum ('pending', 'requires_action', 'succeeded', 'failed', 'refunded');
create type public.payout_status as enum ('pending', 'in_transit', 'paid', 'failed', 'cancelled');
create type public.payment_provider as enum ('stripe', 'demo');
create type public.payout_provider as enum ('stripe_connect', 'demo');
create type public.notification_channel as enum ('email', 'sms', 'in_app');
create type public.notification_status as enum ('queued', 'sent', 'failed', 'read');
create type public.support_thread_status as enum ('open', 'pending', 'resolved', 'closed');
create type public.review_status as enum ('pending', 'published', 'hidden');
create type public.uploaded_document_type as enum ('insurance', 'license', 'registration', 'w9', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.role not null default 'customer',
  full_name text not null,
  email text not null unique,
  phone text,
  status public.profile_status not null default 'active',
  avatar_url text,
  default_operator_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operators (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  legal_business_name text,
  status public.operator_status not null default 'pending',
  rating numeric(3,2) not null default 0,
  completed_trips integer not null default 0,
  payout_account_connected boolean not null default false,
  service_areas text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_default_operator_fk
  foreign key (default_operator_id) references public.operators(id) on delete set null;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  name text not null,
  category public.vehicle_category not null,
  capacity integer not null,
  luggage_capacity integer not null default 0,
  quantity integer not null default 1,
  status public.vehicle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  license_number text,
  status public.driver_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_profile_id uuid not null references public.profiles(id) on delete restrict,
  operator_id uuid references public.operators(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  accepted_quote_id uuid,
  status public.booking_status not null default 'pending',
  trip_type public.trip_type not null,
  trip_intent public.trip_intent,
  pickup_location_json jsonb not null,
  dropoff_location_json jsonb not null,
  distance_miles numeric(8,2),
  drive_time_minutes integer,
  formatted_route_text text,
  pickup_lat numeric(10,6),
  pickup_lng numeric(10,6),
  dropoff_lat numeric(10,6),
  dropoff_lng numeric(10,6),
  pickup_datetime_local text not null,
  pickup_datetime_utc timestamptz not null,
  return_datetime_local text,
  return_datetime_utc timestamptz,
  passengers integer not null,
  luggage_count integer not null default 0,
  requested_vehicle_category public.vehicle_category,
  quoted_amount integer,
  final_amount integer,
  notes text,
  concierge_trip boolean not null default false,
  payment_intent_id text,
  payment_status public.payment_status,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  seat_label text,
  created_at timestamptz not null default now()
);

create table public.booking_stops (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stop_order integer not null,
  location_json jsonb not null,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  operator_id uuid references public.operators(id) on delete set null,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  source text not null check (source in ('admin', 'operator', 'system')),
  vehicle_category public.vehicle_category not null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  amount integer not null,
  deposit_amount integer,
  service_fee integer not null default 0,
  notes text,
  status public.quote_status not null default 'draft',
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings
  add constraint bookings_accepted_quote_fk
  foreign key (accepted_quote_id) references public.quotes(id) on delete set null;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  customer_profile_id uuid not null references public.profiles(id) on delete restrict,
  provider public.payment_provider not null default 'stripe',
  payment_intent_id text,
  payment_method_id text,
  amount integer not null,
  currency text not null default 'usd',
  status public.payment_status not null default 'pending',
  refund_amount integer,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  operator_id uuid not null references public.operators(id) on delete restrict,
  provider public.payout_provider not null default 'stripe_connect',
  provider_transfer_id text,
  gross_amount integer not null,
  platform_fee_amount integer not null default 0,
  payout_amount integer not null,
  status public.payout_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete cascade,
  payout_id uuid references public.payouts(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  channel public.notification_channel not null,
  recipient text not null,
  status public.notification_status not null default 'queued',
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  read_at timestamptz
);

create table public.support_threads (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  status public.support_thread_status not null default 'open',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_profile_id uuid not null references public.profiles(id) on delete restrict,
  operator_id uuid not null references public.operators(id) on delete restrict,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references public.operators(id) on delete cascade,
  category public.vehicle_category not null,
  name text not null,
  region text not null,
  base_fare integer not null,
  rate_per_mile integer not null,
  minimum_fare integer not null,
  hourly_rate integer not null,
  minimum_hours integer not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  operator_id uuid references public.operators(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  type public.uploaded_document_type not null,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

create index bookings_customer_profile_idx on public.bookings(customer_profile_id);
create index bookings_operator_idx on public.bookings(operator_id);
create index bookings_status_idx on public.bookings(status);
create index bookings_pickup_datetime_idx on public.bookings(pickup_datetime_utc);
create index quotes_booking_idx on public.quotes(booking_id);
create index quotes_status_idx on public.quotes(status);
create index payments_booking_idx on public.payments(booking_id);
create index payments_status_idx on public.payments(status);
create index payouts_operator_idx on public.payouts(operator_id);
create index notifications_profile_idx on public.notifications(profile_id);
create index reviews_operator_idx on public.reviews(operator_id);
create index uploaded_documents_operator_idx on public.uploaded_documents(operator_id);

alter table public.profiles enable row level security;
alter table public.operators enable row level security;
alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_passengers enable row level security;
alter table public.booking_stops enable row level security;
alter table public.quotes enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;
alter table public.notifications enable row level security;
alter table public.support_threads enable row level security;
alter table public.reviews enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.uploaded_documents enable row level security;

-- RLS assumptions:
-- 1. customers can read/update their own profile, bookings, quotes, payments, notifications, support threads, and reviews.
-- 2. operators can read/update their own operator row, fleet, assigned bookings, quotes they authored, payouts, notifications, and uploaded documents.
-- 3. admins have full access via service-role-backed server code.
-- 4. inserts for profiles are performed by trusted server functions after auth sign-up.
-- 5. Stripe webhooks and background jobs run with service-role privileges.
