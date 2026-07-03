drop policy if exists "audit own or admin" on public.audit_requests;

create policy "audit own or admin" on public.audit_requests
  for select
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin());

create policy "audit update own or admin" on public.audit_requests
  for update
  to authenticated
  using (profile_id = (select auth.uid()) or private.is_platform_admin())
  with check (profile_id = (select auth.uid()) or private.is_platform_admin());

create policy "audit delete admin" on public.audit_requests
  for delete
  to authenticated
  using (private.is_platform_admin());

drop policy if exists "public audit request intake" on public.audit_requests;

create policy "public audit request intake" on public.audit_requests
  for insert
  to anon, authenticated
  with check (
    email <> ''
    and business_name <> ''
    and (
      private.is_platform_admin()
      or profile_id is null
      or profile_id = (select auth.uid())
    )
  );
