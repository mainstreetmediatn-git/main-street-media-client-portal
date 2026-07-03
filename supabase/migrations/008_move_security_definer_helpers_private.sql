create schema if not exists private;

revoke all on schema private from public;

create or replace function private.is_admin()
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

create or replace function private.handle_new_user()
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

revoke execute on function private.is_admin() from public, anon;
revoke execute on function private.handle_new_user() from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.handle_new_user() to supabase_auth_admin;

drop policy if exists "profiles read own or admin" on public.profiles;
drop policy if exists "profiles admin update" on public.profiles;
drop policy if exists "profiles admin delete" on public.profiles;
drop policy if exists "audit requests read own or admin" on public.audit_requests;
drop policy if exists "audit requests admin update" on public.audit_requests;
drop policy if exists "audit requests admin delete" on public.audit_requests;
drop policy if exists "reports read assigned package allowed or admin" on public.reports;
drop policy if exists "reports admin insert" on public.reports;
drop policy if exists "reports admin update" on public.reports;
drop policy if exists "reports admin delete" on public.reports;
drop policy if exists "customer reports read own or admin" on public.customer_reports;
drop policy if exists "customer reports admin insert" on public.customer_reports;
drop policy if exists "customer reports admin update" on public.customer_reports;
drop policy if exists "customer reports admin delete" on public.customer_reports;

create policy "profiles read own or admin"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or private.is_admin());

create policy "profiles admin update"
on public.profiles
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "profiles admin delete"
on public.profiles
for delete
to authenticated
using (private.is_admin());

create policy "audit requests read own or admin"
on public.audit_requests
for select
to authenticated
using (user_id = (select auth.uid()) or private.is_admin());

create policy "audit requests admin update"
on public.audit_requests
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "audit requests admin delete"
on public.audit_requests
for delete
to authenticated
using (private.is_admin());

create policy "reports read assigned package allowed or admin"
on public.reports
for select
to authenticated
using (
  private.is_admin()
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
with check (private.is_admin());

create policy "reports admin update"
on public.reports
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "reports admin delete"
on public.reports
for delete
to authenticated
using (private.is_admin());

create policy "customer reports read own or admin"
on public.customer_reports
for select
to authenticated
using (user_id = (select auth.uid()) or private.is_admin());

create policy "customer reports admin insert"
on public.customer_reports
for insert
to authenticated
with check (private.is_admin());

create policy "customer reports admin update"
on public.customer_reports
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "customer reports admin delete"
on public.customer_reports
for delete
to authenticated
using (private.is_admin());

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

drop function if exists public.handle_new_user();
drop function if exists public.is_admin();
