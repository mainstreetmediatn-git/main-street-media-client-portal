# Implementation Notes

## Current V1 Shape

- `dashboard/` is the Next.js customer/admin portal.
- `mobile/` is the Flutter customer companion app.
- Both clients use the same Supabase Auth project and the same paid-pilot schema.
- Customers can sign up, request visibility audits, view their profile/package state, and read assigned reports.
- Package assignment and report assignment remain manual Supabase admin operations for V1.

## Supabase

Run all migrations in `supabase/migrations/` in order.

The active V1 tables are:

- `profiles`
- `audit_requests`
- `reports`
- `customer_reports`

RLS is enabled on each active table. Admin-only policy checks use `private.is_admin()` after `008_move_security_definer_helpers_private.sql`, and the auth signup trigger uses `private.handle_new_user()`.

## Manual Pilot Operations

Assign a package:

```sql
update public.profiles
set package_type = '197'
where email = 'customer@example.com';
```

Use `297` for Growth customers.

Make an admin:

```sql
update public.profiles
set role = 'admin'
where email = 'owner@example.com';
```

Assign a report:

```sql
insert into public.customer_reports (user_id, report_id)
values ('customer-user-id', 'report-id');
```

## Remaining Growth OS Work

- Build a full admin UI for package assignment, audit request status changes, report creation, and report assignment.
- Add Stripe subscriptions and billing webhooks.
- Add automated audit generation.
- Add email/SMS notifications.
- Add CRM and onboarding workflows.
