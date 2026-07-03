# Main Street Media Co. Customer Portal

Helping Great Local Businesses Become Impossible to Ignore.

## Description

V1 Paid Pilot customer portal for Main Street Media Co. customers and audit prospects. Customers can create an account, request a visibility audit, view their business profile, and access assigned reports according to their manually assigned package.

This is built as a minimum sellable product for real $197 and $297 customers, with a database structure that can evolve into the Main Street Media Growth OS.

## Tech Stack

- Next.js 15 App Router in `dashboard/`
- React 19
- TypeScript
- Plain CSS design system
- Supabase Auth, Postgres, and Row Level Security
- Lucide React icons
- Flutter mobile scaffold retained in `mobile/`

## Features

- Home / landing page
- Sign up and login
- Logout and auth state handling
- Protected customer routes
- Customer dashboard
- Visibility audit request form
- Assigned reports page
- Package-aware report access for `$197` and `$297`
- Locked Growth report messaging
- Account/profile page
- Admin-role protected operations foundation
- Supabase SQL setup with tables, relationships, indexes, triggers, and RLS policies

## Environment Variables

Use frontend-safe Supabase values only. Do not put a service role key in the frontend.

Create `dashboard/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
```

The same placeholder names are shown in `.env.example` and `dashboard/.env.example`.

## Local Setup

```bash
cd dashboard
npm install
cp .env.example .env.local
npm run dev
```

Then open the local Next.js URL shown in the terminal.

## Supabase Setup

1. Create a Supabase project.
2. Copy the values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` into `dashboard/.env.local`.
3. Run the V1 SQL in `supabase/migrations/006_v1_paid_pilot_schema.sql` in the Supabase SQL editor, or use the Supabase CLI:

```bash
supabase db push
```

4. In Supabase Auth settings, configure the site URL and redirect URLs for your local and deployed app.
5. Sign up through the app.
6. Manually assign a package in Supabase:

```sql
update public.profiles
set package_type = '197'
where email = 'customer@example.com';
```

Use `297` for Growth customers.

7. To make an admin user:

```sql
update public.profiles
set role = 'admin'
where email = 'owner@example.com';
```

## Database Tables

- `profiles`: customer/admin account profile, business details, package assignment, role
- `audit_requests`: user-owned visibility audit requests
- `reports`: report metadata, content, file URL, report type, required package
- `customer_reports`: assigned reports for each customer

## RLS and Security Notes

- The frontend uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Service role keys must never be exposed in browser code.
- Row Level Security is enabled for all V1 tables.
- Customers can read only their own profile.
- Customers can create and read only their own audit requests.
- Customers can read only reports assigned to them.
- `$197` customers can read assigned reports that require package `197`.
- `$297` customers can read assigned reports that require package `197` or `297`.
- Admin users are the only users allowed to update packages, audit statuses, reports, and report assignments.
- Customers do not choose packages inside the app. Package assignment is manual in Supabase for this V1.

## Deployment Notes

- Deploy the `dashboard/` app to Vercel, Netlify, or another Next.js-compatible host.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deployment environment.
- Do not deploy `.env.local`.
- Keep Supabase RLS enabled in production.
- Configure Supabase Auth redirect URLs to include the deployed domain.

## Future Roadmap: Main Street Media Growth OS

- Full admin dashboard
- Stripe subscriptions
- Automated audit generation
- Report upload and assignment workflow
- Email and SMS notifications
- CRM integration
- Lead tracking
- Client onboarding workflow
- Upgrade prompts from `$197` to `$297`
- AI-generated audit insights
