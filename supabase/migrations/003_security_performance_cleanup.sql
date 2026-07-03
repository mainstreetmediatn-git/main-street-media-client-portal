create schema if not exists private;

create or replace function private.is_platform_admin()
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
      and role = 'platform_admin'
  );
$$;

create or replace function private.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.clients
  where profile_id = (select auth.uid());
$$;

grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_platform_admin() to anon, authenticated, service_role;
grant execute on function private.current_client_id() to anon, authenticated, service_role;
revoke execute on function public.is_platform_admin() from public, anon, authenticated;
revoke execute on function public.current_client_id() from public, anon, authenticated;

drop policy if exists "profiles own or admin" on public.profiles;
create policy "profiles own or admin" on public.profiles
  for all
  to authenticated
  using (id = (select auth.uid()) or private.is_platform_admin())
  with check (id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "clients own or admin" on public.clients;
create policy "clients own or admin" on public.clients
  for all
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin())
  with check (profile_id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "prospects own or admin" on public.prospects;
create policy "prospects own or admin" on public.prospects
  for all
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin())
  with check (profile_id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "packages readable" on public.packages;
create policy "packages readable" on public.packages
  for select
  to authenticated
  using (true);

drop policy if exists "packages admin writable" on public.packages;
create policy "packages admin insert" on public.packages
  for insert
  to authenticated
  with check (private.is_platform_admin());
create policy "packages admin update" on public.packages
  for update
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());
create policy "packages admin delete" on public.packages
  for delete
  to authenticated
  using (private.is_platform_admin());

drop policy if exists "client package own or admin" on public.client_package_access;
create policy "client package own or admin" on public.client_package_access
  for select
  to authenticated
  using (client_id = private.current_client_id() or private.is_platform_admin());

drop policy if exists "client package admin writable" on public.client_package_access;
create policy "client package admin insert" on public.client_package_access
  for insert
  to authenticated
  with check (private.is_platform_admin());
create policy "client package admin update" on public.client_package_access
  for update
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());
create policy "client package admin delete" on public.client_package_access
  for delete
  to authenticated
  using (private.is_platform_admin());

drop policy if exists "audit own or admin" on public.audit_requests;
create policy "audit own or admin" on public.audit_requests
  for all
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin())
  with check (profile_id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "public audit request intake" on public.audit_requests;
create policy "public audit request intake" on public.audit_requests
  for insert
  to anon, authenticated
  with check (
    email <> ''
    and business_name <> ''
    and (profile_id is null or profile_id = (select auth.uid()))
  );

drop policy if exists "report categories readable" on public.report_categories;
create policy "report categories readable" on public.report_categories
  for select
  to authenticated
  using (true);

drop policy if exists "reports package gated" on public.reports;
create policy "reports package gated" on public.reports
  for select
  to authenticated
  using (
    private.is_platform_admin()
    or client_id = private.current_client_id()
    and (
      required_access = 'starter'
      or exists (
        select 1
        from public.client_package_access cpa
        join public.packages p on p.id = cpa.package_id
        where cpa.client_id = reports.client_id
          and p.level = 'growth'
      )
    )
  );

drop policy if exists "reports admin writable" on public.reports;
create policy "reports admin insert" on public.reports
  for insert
  to authenticated
  with check (private.is_platform_admin());
create policy "reports admin update" on public.reports
  for update
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());
create policy "reports admin delete" on public.reports
  for delete
  to authenticated
  using (private.is_platform_admin());

drop policy if exists "appointments own or admin" on public.appointments;
create policy "appointments own or admin" on public.appointments
  for all
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin())
  with check (profile_id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "billing own or admin" on public.billing_events;
create policy "billing own or admin" on public.billing_events
  for select
  to authenticated
  using (client_id = private.current_client_id() or private.is_platform_admin());

drop policy if exists "notifications own or admin" on public.notifications;
create policy "notifications own or admin" on public.notifications
  for all
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin())
  with check (profile_id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "push tokens own or admin" on public.push_tokens;
create policy "push tokens own or admin" on public.push_tokens
  for all
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin())
  with check (profile_id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "report files readable by owner or admin" on storage.objects;
create policy "report files readable by owner or admin" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'reports'
    and (
      private.is_platform_admin()
      or exists (
        select 1
        from public.reports r
        join public.clients c on c.id = r.client_id
        where r.storage_path = storage.objects.name
          and c.profile_id = (select auth.uid())
      )
    )
  );

drop policy if exists "report files admin insert" on storage.objects;
create policy "report files admin insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'reports'
    and private.is_platform_admin()
  );

drop policy if exists "report files admin update" on storage.objects;
create policy "report files admin update" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'reports'
    and private.is_platform_admin()
  )
  with check (
    bucket_id = 'reports'
    and private.is_platform_admin()
  );

drop policy if exists "report files admin delete" on storage.objects;
create policy "report files admin delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'reports'
    and private.is_platform_admin()
  );

create index if not exists appointments_profile_id_idx on public.appointments (profile_id);
create index if not exists audit_requests_profile_id_idx on public.audit_requests (profile_id);
create index if not exists billing_events_client_id_idx on public.billing_events (client_id);
create index if not exists client_package_access_assigned_by_idx on public.client_package_access (assigned_by);
create index if not exists client_package_access_package_id_idx on public.client_package_access (package_id);
create index if not exists notifications_profile_id_idx on public.notifications (profile_id);
create index if not exists push_tokens_profile_id_idx on public.push_tokens (profile_id);
create index if not exists reports_category_id_idx on public.reports (category_id);
create index if not exists reports_client_id_idx on public.reports (client_id);
