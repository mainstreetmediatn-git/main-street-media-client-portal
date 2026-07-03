-- Run this from the Supabase SQL editor after the first admin user signs up.
-- Replace the email and name values before running.
--
-- This path is intentionally database-admin only. Do not expose this as an app
-- endpoint and do not run it with a browser/public API key.

do $$
declare
  admin_email text := 'owner@example.com';
  admin_name text := 'Main Street Media Admin';
  admin_user_id uuid;
begin
  select id
  into admin_user_id
  from auth.users
  where email = admin_email
  order by created_at asc
  limit 1;

  if admin_user_id is null then
    raise exception 'No auth.users row found for email %. Sign up first, then rerun this script.', admin_email;
  end if;

  insert into public.profiles (id, role, full_name, email)
  values (admin_user_id, 'platform_admin', admin_name, admin_email)
  on conflict (id) do update set
    role = 'platform_admin',
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();
end $$;

