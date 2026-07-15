# API Contracts

Status: Production

Last updated: 2026-07-13

## Public Application Interfaces

This project does not expose a large bespoke HTTP API today.
The main contracts are:

- Supabase Auth
- Supabase tables and RLS policies
- Next.js server/client routes
- Flutter app calls to Supabase

## Supabase Contracts

### Tables

- `profiles`
- `audit_requests`
- `reports`
- `customer_reports`
- `business_snapshots`
- `domain_events`

### Key Reads

- profile lookup by `id`
- audit requests by `user_id`
- reports by `created_at`
- customer reports by `user_id` with nested `reports(*)`

### Key Writes

- signup profile upsert
- audit request insert
- admin report assignment
- admin package updates

## Route Contracts

- `/` landing page
- `/login`
- `/signup`
- `/dashboard`
- `/account`
- `/reports`
- `/request-audit`
- `/admin`
- `/internal/call-sheet`

## Client Contracts

- Dashboard uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Mobile uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `mobile/.env`.
- The mobile redirect URI is `com.mainstreetmedia.portal://login-callback`.

## Production

- Current routes exist and are wired.
- Current Supabase tables and RLS policies are live in migrations.

## MVP

- Authenticated account creation and login.
- Audit request submission.
- Package-aware report reads.

## In Progress

- Stronger internal service contracts.
- More explicit admin workflows.

## Roadmap

- Dedicated backend APIs for orchestration, tasking, and automation.
- Webhook endpoints for payments and downstream events.

## Known Limitations

- The repo still relies on direct Supabase access for core portal operations.
- No generalized internal REST API exists yet.
- No webhook contract is live for payments or agent execution.
