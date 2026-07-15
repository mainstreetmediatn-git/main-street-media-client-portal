create or replace function private.package_access_rank(package_value text)
returns integer
language sql
immutable
security definer
set search_path = public
as $$
  select case
    when package_value is null then null
    when package_value in ('core', 'Reveal', '197') then 1
    when package_value in ('elite', 'Evolve', '297') then 2
    when package_value in ('agent_workflow_24_7', 'Ascend', '397') then 3
    else null
  end;
$$;

revoke execute on function private.package_access_rank(text) from public, anon;
grant execute on function private.package_access_rank(text) to authenticated;

drop policy if exists "reports read assigned package allowed or admin" on public.reports;
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
      and coalesce(private.package_access_rank(p.package_type), 0) >= coalesce(private.package_access_rank(reports.visibility_package_required), 0)
  )
);
