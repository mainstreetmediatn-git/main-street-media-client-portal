# Main Street Media Portal Architecture Report

Status: Production

Last updated: 2026-07-13

## Summary

The repository currently ships a V1 customer portal plus a canonical `BusinessSnapshot` contract that reconciles profile, audit request, report, and assignment state across dashboard and mobile clients.

The planned Growth OS intelligence layer is represented only by an orchestrator scaffold today. It is event-driven in design, but not yet a live runtime: there is no queue, no autonomous agent execution, and no production automation pipeline.

## What Is Canonical Today

`BusinessSnapshot` is the app-level contract for business state.

It normalizes:

- `profiles`
- `audit_requests`
- `reports`
- `customer_reports`

It also normalizes legacy package values into canonical ids:

- `core`
- `elite`
- `agent_workflow_24_7`

The dashboard and mobile apps should consume the snapshot rather than reconstructing package access or report visibility from raw tables. The package catalog is defined once in `shared/packageCatalog.ts` and mirrored only where the language runtime requires it.

## Intelligence Layer Direction

`dashboard/lib/orchestrator.ts` is the current orchestration scaffold.

It sketches the intended execution flow:

1. Reconcile the snapshot.
2. Plan the next action.
3. Assign operational work.
4. Execute the work.
5. Verify the output.
6. Archive the trail.

That sequence is the basis for the future event-driven intelligence layer, but only the skeleton is present now.

## Remaining Phase VI Gaps

Phase VI is still backlog work. The repo does not yet ship:

- a live event bus or queue
- an agent runtime with retries or approvals
- customer-safe automation for audits, reports, and notifications
- admin tooling for operational handoff
- execution logs beyond repo docs and the change log
- the broader CRM, support, content, and AI assistant modules in the clean-room build plan

## Current Boundary

The safe description of the repository today is:

- V1 portal is shipped.
- `BusinessSnapshot` is canonical.
- orchestration is scaffolded.
- Phase VI intelligence automation is planned, not live.
