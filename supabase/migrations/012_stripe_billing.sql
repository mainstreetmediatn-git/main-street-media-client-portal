alter table public.profiles
  add column if not exists customer_status text not null default 'Lead' check (customer_status in ('Lead', 'Paid', 'Canceled')),
  add column if not exists payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'canceled')),
  add column if not exists selected_package text,
  add column if not exists payment_amount_cents integer,
  add column if not exists payment_currency text default 'usd',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_selected_package text,
  add column if not exists stripe_lead_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists payment_synced_at timestamptz;

create unique index if not exists profiles_stripe_customer_id_idx on public.profiles (stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists profiles_stripe_checkout_session_id_idx on public.profiles (stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create unique index if not exists profiles_stripe_payment_intent_id_idx on public.profiles (stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create unique index if not exists profiles_stripe_subscription_id_idx on public.profiles (stripe_subscription_id) where stripe_subscription_id is not null;

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lead_id text,
  selected_package text not null,
  customer_name text not null,
  business_name text not null,
  customer_email text not null,
  checkout_idempotency_key text not null unique,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_subscription_id text unique,
  stripe_event_id text unique,
  stripe_event_type text,
  amount_cents integer,
  currency text not null default 'usd',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'canceled', 'refunded')),
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_events_profile_id_idx on public.billing_events (profile_id);
create index if not exists billing_events_checkout_idempotency_key_idx on public.billing_events (checkout_idempotency_key);
create index if not exists billing_events_stripe_checkout_session_id_idx on public.billing_events (stripe_checkout_session_id);
create index if not exists billing_events_stripe_event_id_idx on public.billing_events (stripe_event_id);

drop trigger if exists billing_events_set_updated_at on public.billing_events;
create trigger billing_events_set_updated_at
before update on public.billing_events
for each row execute function public.set_updated_at();

create table if not exists public.customer_follow_ups (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  billing_event_id uuid references public.billing_events(id) on delete set null,
  lead_id text,
  customer_name text,
  business_name text,
  email text,
  selected_package text,
  workflow_name text not null default 'paid_customer_follow_up',
  trigger_source text not null,
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'completed', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  triggered_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, lead_id, workflow_name)
);

create index if not exists customer_follow_ups_profile_id_idx on public.customer_follow_ups (profile_id);
create index if not exists customer_follow_ups_status_idx on public.customer_follow_ups (status);
create index if not exists customer_follow_ups_triggered_at_idx on public.customer_follow_ups (triggered_at desc);

drop trigger if exists customer_follow_ups_set_updated_at on public.customer_follow_ups;
create trigger customer_follow_ups_set_updated_at
before update on public.customer_follow_ups
for each row execute function public.set_updated_at();

alter table public.billing_events enable row level security;
alter table public.customer_follow_ups enable row level security;

drop policy if exists "billing events admin only" on public.billing_events;
create policy "billing events admin only"
on public.billing_events
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "customer follow ups admin only" on public.customer_follow_ups;
create policy "customer follow ups admin only"
on public.customer_follow_ups
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());
