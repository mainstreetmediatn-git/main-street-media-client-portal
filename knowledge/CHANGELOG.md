# Changelog

Status: Production

Last updated: 2026-07-13

## 2026-07-13

- Centralized architectural knowledge into `knowledge/`.
- Established `BusinessSnapshot` as the canonical cross-client business-state model.
- Canonicalized package ids to `core`, `elite`, and `agent_workflow_24_7`.
- Preserved compatibility aliases for older records and operator wording.
- Added the orchestrator skeleton for future Growth OS work.
- Documented the future roadmap as separate from the production portal.
- Added a report-access policy fix that uses package rank ordering instead of a single legacy numeric comparison.
- Added regression coverage for canonical package and report-policy consistency.
- Added a non-executing Growth OS lifecycle and workflow model in `shared/growthOsModel.ts`.
- Added `knowledge/DOMAIN_MODEL.md` and `knowledge/WORKFLOWS.md` to define the post-sale operating backbone.
- Extended the knowledge index to cover the new domain and workflow documents.

## 2026-07-13 Security Boundary Review

- Documented that the current tenancy model is still user-centric rather than workspace-centric.
- Documented that the private schema is a namespace, not a complete access boundary.
- Documented that future AGOS agent provisioning will need workspace membership and server-side artifact isolation.

## Current Rule

- Any future architectural change must update these knowledge documents before the change is considered complete.
