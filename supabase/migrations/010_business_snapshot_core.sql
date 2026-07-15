create table if not exists public.business_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  version integer not null,
  snapshot_type text not null default 'business_snapshot',
  payload jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  confidence_score numeric(5,4) not null default 0,
  snapshot_hash text,
  generated_by text,
  generated_at timestamptz not null default now(),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, version)
);

create index if not exists business_snapshots_profile_id_idx on public.business_snapshots (profile_id);
create index if not exists business_snapshots_version_idx on public.business_snapshots (version);
create index if not exists business_snapshots_generated_at_idx on public.business_snapshots (generated_at desc);

create table if not exists public.domain_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  business_snapshot_id uuid references public.business_snapshots(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists domain_events_event_type_idx on public.domain_events (event_type);
create index if not exists domain_events_aggregate_idx on public.domain_events (aggregate_type, aggregate_id);
create index if not exists domain_events_published_at_idx on public.domain_events (published_at desc);

drop trigger if exists business_snapshots_set_updated_at on public.business_snapshots;
create trigger business_snapshots_set_updated_at
before update on public.business_snapshots
for each row execute function public.set_updated_at();

create or replace view public.business_snapshot_current as
select distinct on (profile_id)
  id,
  profile_id,
  version,
  snapshot_type,
  payload,
  provenance,
  confidence_score,
  snapshot_hash,
  generated_by,
  generated_at,
  valid_from,
  valid_to,
  created_at,
  updated_at
from public.business_snapshots
order by profile_id, version desc, generated_at desc, created_at desc;

alter table public.business_snapshots enable row level security;
alter table public.domain_events enable row level security;

drop policy if exists "business snapshots admin only" on public.business_snapshots;
create policy "business snapshots admin only"
on public.business_snapshots
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "domain events admin only" on public.domain_events;
create policy "domain events admin only"
on public.domain_events
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());
