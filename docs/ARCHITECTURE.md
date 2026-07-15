# Main Street Growth OS Architecture

Status: Production

Last updated: 2026-07-13

## Canonical Model

`BusinessSnapshot` is the canonical data model for the portal.

It is the reconciled view of:

- `profiles`
- `audit_requests`
- `reports`
- `customer_reports`

The canonical snapshot is implemented in:

- `dashboard/lib/businessSnapshot.ts`
- `mobile/lib/models/business_snapshot.dart`
- `shared/packageCatalog.ts`

The model normalizes legacy package values into canonical package ids:

- `core`
- `elite`
- `agent_workflow_24_7`

Legacy aliases such as `Reveal`, `Evolve`, `Ascend`, `197`, `297`, and `397` remain accepted for compatibility only.

## Source Of Truth Rules

- Dashboard and mobile code should read business state through `BusinessSnapshot`, not by re-implementing package or report logic in each screen.
- Package access checks should use the canonical package catalog in `shared/packageCatalog.ts`, not ad hoc string comparisons.
- Admin copy and operational docs should describe canonical ids, with legacy aliases called out only as compatibility notes.
- The raw Supabase tables remain the persistence layer. The snapshot is the app-level contract.

## Event-Driven Intelligence Layer

The repository contains the start of an event-driven intelligence layer, but not a live autonomous runtime.

`dashboard/lib/orchestrator.ts` is the current scaffold. It defines:

- the future agent roster
- the orchestration stages
- the verification and archive checkpoints

The intended flow is snapshot-first and event-driven: a change to the reconciled business state should eventually trigger planning, work assignment, verification, and audit logging. That runtime does not exist yet. Today the repo only ships the canonical snapshot contract and a non-executing orchestrator skeleton.

## Orchestrator Skeleton

`dashboard/lib/orchestrator.ts` contains the Growth OS orchestrator skeleton.

The skeleton is intentionally non-executing. New Growth OS agents should not be implemented until the validation pass is green and the canonical snapshot remains stable.

## Validation Boundary

Before introducing new Growth OS agents:

- verify the dashboard build and lint checks
- verify the mobile app analysis and tests
- confirm the schema migration accepts canonical package ids
- confirm the docs match the code paths

## Remaining Phase VI Gaps

Phase VI is still roadmap work. The repo does not yet ship the following:

- a live event bus or queue that reacts to business state changes
- agent execution, retries, or approval workflows
- customer-safe automation for audits, reports, notifications, or follow-up tasks
- admin tooling to manage agent output and operational handoff
- persisted execution history beyond the repo docs and change log
- the downstream CRM, support inbox, content manager, and AI assistant surfaces from the clean-room build plan
