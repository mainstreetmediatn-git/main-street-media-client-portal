# Main Street Media Co. Customer Portal

Status: Production

Helping Great Local Businesses Become Impossible to Ignore.

## Description

V1 Paid Pilot customer portal for Main Street Media Co. customers and audit prospects. Customers can create an account, request a visibility audit, view their business profile, and access assigned reports according to their manually assigned package.

This is built as a minimum sellable product for customers assigned to the canonical `core` and `elite` packages, with a canonical `BusinessSnapshot` model that feeds the planned Main Street Media Growth OS intelligence layer.

## Tech Stack

- Next.js 15 App Router in `dashboard/`
- React 19
- TypeScript
- Plain CSS design system
- Supabase Auth, Postgres, and Row Level Security
- Stripe Checkout for secure billing and CRM payment confirmation
- Lucide React icons
- Flutter mobile app in `mobile/`

## Legal Source Of Truth

Legal policy lives in `legal/` and is the only authoritative source for licensing and commercial-use rules.

- [Open Source Audit](legal/OPEN_SOURCE_AUDIT.md)
- [Commercial Use Checklist](legal/COMMERCIAL_USE_CHECKLIST.md)
- [Third-Party Notices](legal/THIRD_PARTY_NOTICES.md)
- [Attribution](legal/ATTRIBUTION.md)

The legal files document the LGPL review policy, the Formbricks MIT exception, and the commercial checklist in one place. This README does not duplicate policy.

## Features

- Home / landing page
- Sign up and login
- Logout and auth state handling
- Protected customer routes
- Customer dashboard
- Visibility audit request form
- Assigned reports page
- Package-aware report access for canonical `core` / `elite` / `agent_workflow_24_7` ids and legacy `197` / `297` / `397` aliases
- Locked Growth report messaging
- Account/profile page
- Admin-role protected manual-ops foundation
- Secure Stripe Checkout billing page with webhook-confirmed CRM updates
- Mobile login/signup, live dashboard, audit request, and assigned report views
- Supabase SQL setup with tables, relationships, indexes, triggers, and RLS policies
- Canonical `BusinessSnapshot` reconciliation across dashboard and mobile clients

## Environment Variables

Use frontend-safe Supabase values only. Do not put a service role key in the frontend.

Create `dashboard/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_PUBLISHABLE_KEY=pk_live_or_test_public_key
STRIPE_SECRET_KEY=sk_live_or_test_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
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
2. Copy the values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` into `dashboard/.env.local`.
3. Run the Supabase migrations in `supabase/migrations/` in order, or use the Supabase CLI:

```bash
supabase db push
```

4. In Supabase Auth settings, configure the site URL and redirect URLs for your local and deployed app.
5. Sign up through the app.
6. Manually assign a package in Supabase:

```sql
update public.profiles
set package_type = 'core'
where email = 'customer@example.com';
```

Use `elite` for Growth customers. Legacy `197` and `297` values remain accepted for compatibility, but canonical writes should use `core` and `elite`.

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
- `billing_events`: Stripe checkout session and verified webhook ledger
- `customer_follow_ups`: queued follow-up workflow entries created after verified payment events

## RLS and Security Notes

- The frontend uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Service role keys and Stripe secret keys must never be exposed in browser code.
- Row Level Security is enabled for all V1 tables.
- Security definer helper functions are kept in a private schema after migration `008_move_security_definer_helpers_private.sql`.
- Customers can read only their own profile.
- Customers can create and read only their own audit requests.
- Customers can read only reports assigned to them.
- `core` customers can read assigned reports that require `core`.
- `elite` customers can read assigned reports that require `core` or `elite`.
- Admin users are the only users allowed to update packages, audit statuses, reports, and report assignments.
- Customers choose a package in the Stripe Checkout billing flow, while admins can still override package state manually in Supabase.
- Stripe Checkout sessions are created server-side only, customer reuse is handled before checkout, and CRM updates are applied only after a verified webhook event.

## Deployment Notes

- Deploy the `dashboard/` app to Vercel, Netlify, or another Next.js-compatible host.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deployment environment.
- Set `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` in the deployment environment.
- Do not deploy `.env.local`.
- Keep Supabase RLS enabled in production.
- Configure Supabase Auth redirect URLs to include the deployed domain.
- Configure Stripe webhook delivery for the deployed `/api/stripe/webhook` endpoint.

## Future Roadmap: Main Street Media Growth OS

- Full admin dashboard
- Automated audit generation
- Report upload and assignment workflow
- Email and SMS notifications
- CRM integration
- Lead tracking
- Client onboarding workflow
- Upgrade prompts from canonical `core` to `elite` package assignments
- AI-generated audit insights

## Architecture Notes

- Read [the knowledge index](knowledge/README.md) for the canonical documentation set.
- Read [Architecture](knowledge/ARCHITECTURE.md) for the current system layout and boundaries.
- Read [BusinessSnapshot](knowledge/BUSINESS_SNAPSHOT.md) for the shared business-state contract.
- Read [Roadmap](knowledge/ROADMAP.md) for future phases and planned systems.
