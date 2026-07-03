create extension if not exists "pgcrypto";

drop table if exists public.customer_reports cascade;
drop table if exists public.reports cascade;
drop table if exists public.audit_requests cascade;
drop table if exists public.appointments cascade;
drop table if exists public.billing_events cascade;
drop table if exists public.notifications cascade;
drop table if exists public.push_tokens cascade;
drop table if exists public.client_package_access cascade;
drop table if exists public.packages cascade;
drop table if exists public.report_categories cascade;
drop table if exists public.clients cascade;
drop table if exists public.prospects cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  business_name text,
  phone text,
  package_type text check (package_type in ('197', '297')),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  website text,
  phone text,
  email text not null,
  business_category text,
  city text,
  state text,
  notes text,
  status text not null default 'pending' check (status in ('new', 'pending', 'in_review', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  report_type text not null check (report_type in (
    'visibility_audit',
    'google_business_profile',
    'local_seo',
    'website_conversion',
    'reputation_review',
    'custom'
  )),
  description text,
  file_url text,
  content text,
  visibility_package_required text not null default '197' check (visibility_package_required in ('197', '297')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, report_id)
);

create index profiles_role_idx on public.profiles (role);
create index profiles_package_type_idx on public.profiles (package_type);
create index audit_requests_user_id_idx on public.audit_requests (user_id);
create index audit_requests_status_idx on public.audit_requests (status);
create index reports_report_type_idx on public.reports (report_type);
create index reports_package_required_idx on public.reports (visibility_package_required);
create index customer_reports_user_id_idx on public.customer_reports (user_id);
create index customer_reports_report_id_idx on public.customer_reports (report_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger audit_requests_set_updated_at
before update on public.audit_requests
for each row execute function public.set_updated_at();

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, business_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'business_name',
    new.raw_user_meta_data ->> 'phone',
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.audit_requests enable row level security;
alter table public.reports enable row level security;
alter table public.customer_reports enable row level security;

create policy "profiles read own or admin"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or public.is_admin());

create policy "profiles insert own customer"
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
  and role = 'customer'
  and package_type is null
);

create policy "profiles admin update"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles admin delete"
on public.profiles
for delete
to authenticated
using (public.is_admin());

create policy "audit requests read own or admin"
on public.audit_requests
for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy "audit requests insert own"
on public.audit_requests
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "audit requests admin update"
on public.audit_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "audit requests admin delete"
on public.audit_requests
for delete
to authenticated
using (public.is_admin());

create policy "reports read assigned package allowed or admin"
on public.reports
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.customer_reports cr
    join public.profiles p on p.id = cr.user_id
    where cr.report_id = reports.id
      and cr.user_id = (select auth.uid())
      and (
        reports.visibility_package_required = '197'
        or p.package_type = '297'
      )
  )
);

create policy "reports admin insert"
on public.reports
for insert
to authenticated
with check (public.is_admin());

create policy "reports admin update"
on public.reports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "reports admin delete"
on public.reports
for delete
to authenticated
using (public.is_admin());

create policy "customer reports read own or admin"
on public.customer_reports
for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy "customer reports admin insert"
on public.customer_reports
for insert
to authenticated
with check (public.is_admin());

create policy "customer reports admin update"
on public.customer_reports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "customer reports admin delete"
on public.customer_reports
for delete
to authenticated
using (public.is_admin());

insert into public.reports (
  title,
  report_type,
  description,
  content,
  visibility_package_required
) values
  (
    'Visibility Audit Overview',
    'visibility_audit',
    'Core local visibility findings and next steps.',
    'This report is assigned after Main Street Media Co. completes the visibility audit.',
    '197'
  ),
  (
    'Google Business Profile Report',
    'google_business_profile',
    'Google Business Profile completeness, search presence, and conversion recommendations.',
    'This report is assigned after Main Street Media Co. reviews your Google Business Profile.',
    '197'
  ),
  (
    'Local SEO Report',
    'local_seo',
    'Local ranking, citation, and city/service-area search opportunity.',
    'Growth package report.',
    '297'
  ),
  (
    'Website / Conversion Report',
    'website_conversion',
    'Website trust, clarity, speed, and lead conversion recommendations.',
    'Growth package report.',
    '297'
  ),
  (
    'Reputation / Review Report',
    'reputation_review',
    'Review velocity, rating health, response quality, and reputation opportunities.',
    'Growth package report.',
    '297'
  )
on conflict do nothing;

