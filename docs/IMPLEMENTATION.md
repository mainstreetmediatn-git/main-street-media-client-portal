# Current Implementation Inventory

Status: Production

Last updated: 2026-07-13

## What Exists Today

This document is the authoritative inventory of the repository as it exists now. It describes implemented surfaces only. Future systems belong in [`docs/CLEAN_ROOM_BUILD_PLAN.md`](./CLEAN_ROOM_BUILD_PLAN.md) and must not be described here as shipped.

## Dashboard

- Next.js 15 App Router lives in `dashboard/`.
- The dashboard ships a customer/admin portal with protected routes, account pages, report views, and internal admin surfaces.
- `dashboard/lib/businessSnapshot.ts` is the reconciled business-state loader and normalization layer.
- `dashboard/lib/orchestrator.ts` is scaffold only and does not execute autonomous work.
- Package definitions are centralized in `shared/packageCatalog.ts` and re-exported through `dashboard/lib/packages.ts`.

## Flutter

- Flutter companion app lives in `mobile/`.
- The app reads Supabase rows into `BusinessSnapshot` in `mobile/lib/models/business_snapshot.dart`.
- Mobile sign-in, dashboard, audit request, and reports screens exist.
- The mobile model mirrors the canonical package catalog and accepts legacy aliases for compatibility reads.

## Supabase

- Supabase hosts the persistence layer for the portal.
- Active V1 tables are `profiles`, `audit_requests`, `reports`, and `customer_reports`.
- RLS is enabled on the active tables.
- Security-definer helpers are kept private after migration `008_move_security_definer_helpers_private.sql`.
- Migration `009_business_snapshot_canonicalization.sql` accepts the canonical package ids plus legacy aliases for compatibility.

## Portal

- `BusinessSnapshot` is the canonical application contract for profile, audit request, report, and assignment state.
- The portal surface currently consists of the customer dashboard, account page, reports page, login flow, signup flow, and admin entry points.
- Internal operator briefing content exists in `dashboard/internal/main-street-media-call-sheet.html` and the server-protected call-sheet route.

## Reports

- Report catalog entries exist for visibility audit, Google Business Profile, local SEO, website/conversion, reputation/review, and additional assigned reports.
- Report access is package-aware and resolves through canonical ids.
- Assigned reports are visible through `customer_reports` and the reconciled snapshot contract.

## Authentication

- Supabase Auth is wired into both the dashboard and the mobile app.
- OAuth setup is documented in `docs/SUPABASE_OAUTH.md`.
- Browser code uses only public Supabase URL and anon key values.

## Audit Requests

- Customers can create visibility audit requests through the portal and mobile app flows.
- Audit requests are stored in `audit_requests`.
- Status tracking exists for request review and delivery flow states.

## Customer Reports

- Customer-to-report assignment is stored in `customer_reports`.
- The snapshot loader normalizes assigned reports into the user-visible report list.
- Package access gates determine which assigned reports are visible to each customer.

## Package Assignment

- Canonical package ids are `core`, `elite`, and `agent_workflow_24_7`.
- Legacy aliases `Reveal`, `Evolve`, `Ascend`, `197`, `297`, and `397` remain read-compatible only.
- Manual package assignment in Supabase remains the current operating model.
- A Stripe Checkout billing flow exists in `dashboard/app/billing/` with server-side session creation, webhook-confirmed CRM updates, and post-payment follow-up queueing.

## Admin Features

- Admin-only routes exist for manual operations.
- Current admin surfaces cover package assignment guidance, report assignment guidance, audit review guidance, and internal call-sheet access.
- No autonomous admin automation ships in the repository today.

## Supported Workflows

- Account creation and login
- Manual package assignment
- Stripe Checkout package purchase
- Visibility audit request submission
- Profile and business-state reconciliation
- Report assignment and report access
- Admin review of manual operations
- Mobile parity for dashboard, audit request, and report viewing

## Build Status

- Dashboard build and lint scripts exist under `dashboard/package.json`.
- Stable dashboard typecheck remains `tsc --noEmit -p tsconfig.lint.json`.
- Flutter analysis and test scripts exist under `mobile/`.
- This inventory does not claim that every build or device path was re-run in this turn.

## Validation Status

- The repo already contains contract tests for business snapshot canonicalization and package alias compatibility.
- Schema validation is represented in the Supabase migrations and dashboard/mobile snapshot loaders.
- Live runtime verification for Android install/launch remains host-dependent and is not part of the current inventory.
- Future feature validation belongs to the roadmap file, not this inventory.
