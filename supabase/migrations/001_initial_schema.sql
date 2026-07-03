create extension if not exists "pgcrypto";

create type public.user_role as enum ('platform_admin', 'client', 'prospect');
create type public.package_level as enum ('starter', 'growth');
create type public.audit_status as enum ('submitted', 'in_review', 'ready', 'archived');
create type public.report_visibility as enum ('starter', 'growth');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'prospect',
  full_name text,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  business_name text not null,
  website_url text,
  service_area text,
  industry text,
  visibility_score integer check (visibility_score between 0 and 100),
  booking_url text,
  billing_portal_url text,
  created_at timestamptz not null default now()
);

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  business_name text not null,
  website_url text,
  service_area text,
  industry text,
  created_at timestamptz not null default now()
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  level public.package_level not null unique,
  name text not null,
  monthly_price_cents integer not null,
  features jsonb not null default '[]'::jsonb
);

create table public.client_package_access (
  client_id uuid primary key references public.clients(id) on delete cascade,
  package_id uuid not null references public.packages(id),
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now()
);

create table public.audit_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  business_name text not null,
  website_url text,
  service_area text,
  industry text,
  phone text,
  email text not null,
  status public.audit_status not null default 'submitted',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  required_access public.report_visibility not null default 'starter',
  sort_order integer not null default 0
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  category_id uuid not null references public.report_categories(id),
  title text not null,
  summary text,
  storage_path text not null,
  required_access public.report_visibility not null default 'starter',
  report_month date,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  calendly_event_uri text,
  starts_at timestamptz,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  stripe_event_id text unique,
  event_type text not null,
  amount_cents integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now()
);

insert into public.packages (level, name, monthly_price_cents, features) values
  ('starter', 'Starter', 19700, '["Visibility Audit","Google Business Profile Report","Recommendations","Audit History"]'),
  ('growth', 'Growth', 29700, '["All Starter features","Ranking Reports","Review Tracking","Lead Tracking","Monthly Reporting","Priority Support","Strategy Recommendations"]')
on conflict (level) do nothing;

insert into public.report_categories (name, required_access, sort_order) values
  ('Visibility Audit', 'starter', 10),
  ('Google Business Profile', 'starter', 20),
  ('Keyword Rankings', 'growth', 30),
  ('Review Growth', 'growth', 40),
  ('Website Analytics', 'growth', 50),
  ('Lead Reports', 'growth', 60),
  ('Monthly Report', 'growth', 70)
on conflict (name) do nothing;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.prospects enable row level security;
alter table public.packages enable row level security;
alter table public.client_package_access enable row level security;
alter table public.audit_requests enable row level security;
alter table public.report_categories enable row level security;
alter table public.reports enable row level security;
alter table public.appointments enable row level security;
alter table public.billing_events enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'platform_admin'
  );
$$;

create or replace function public.current_client_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.clients where profile_id = auth.uid();
$$;

create policy "profiles own or admin" on public.profiles
  for all using (id = auth.uid() or public.is_platform_admin())
  with check (id = auth.uid() or public.is_platform_admin());

create policy "clients own or admin" on public.clients
  for all using (profile_id = auth.uid() or public.is_platform_admin())
  with check (profile_id = auth.uid() or public.is_platform_admin());

create policy "prospects own or admin" on public.prospects
  for all using (profile_id = auth.uid() or public.is_platform_admin())
  with check (profile_id = auth.uid() or public.is_platform_admin());

create policy "packages readable" on public.packages
  for select using (auth.role() = 'authenticated');

create policy "packages admin writable" on public.packages
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "client package own or admin" on public.client_package_access
  for select using (client_id = public.current_client_id() or public.is_platform_admin());

create policy "client package admin writable" on public.client_package_access
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "audit own or admin" on public.audit_requests
  for all using (profile_id = auth.uid() or public.is_platform_admin())
  with check (profile_id = auth.uid() or public.is_platform_admin());

create policy "public audit request intake" on public.audit_requests
  for insert with check (true);

create policy "report categories readable" on public.report_categories
  for select using (auth.role() = 'authenticated');

create policy "reports package gated" on public.reports
  for select using (
    public.is_platform_admin()
    or client_id = public.current_client_id()
    and (
      required_access = 'starter'
      or exists (
        select 1
        from public.client_package_access cpa
        join public.packages p on p.id = cpa.package_id
        where cpa.client_id = reports.client_id and p.level = 'growth'
      )
    )
  );

create policy "reports admin writable" on public.reports
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "appointments own or admin" on public.appointments
  for all using (profile_id = auth.uid() or public.is_platform_admin())
  with check (profile_id = auth.uid() or public.is_platform_admin());

create policy "billing own or admin" on public.billing_events
  for select using (client_id = public.current_client_id() or public.is_platform_admin());

create policy "notifications own or admin" on public.notifications
  for all using (profile_id = auth.uid() or public.is_platform_admin())
  with check (profile_id = auth.uid() or public.is_platform_admin());

create policy "push tokens own or admin" on public.push_tokens
  for all using (profile_id = auth.uid() or public.is_platform_admin())
  with check (profile_id = auth.uid() or public.is_platform_admin());
