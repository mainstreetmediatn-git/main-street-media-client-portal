# Package Model

Status: Production

Last updated: 2026-07-13

## Canonical Packages

The canonical ids are:

- `core`
- `elite`
- `agent_workflow_24_7`

These ids are used in code, docs, and policy.

## Legacy Aliases

Compatibility aliases remain readable for older records and operator wording:

- `Reveal` -> `core`
- `197` -> `core`
- `Evolve` -> `elite`
- `297` -> `elite`
- `Ascend` -> `agent_workflow_24_7`
- `397` -> `agent_workflow_24_7`

## Access Hierarchy

Rank order:

1. `core`
2. `elite`
3. `agent_workflow_24_7`

Higher ranks can access lower-rank content when the policy permits.

## Current Implementation

- Canonicalization lives in `shared/packageCatalog.ts`.
- Dashboard helpers re-export the shared catalog.
- Flutter mirrors the same mapping in `mobile/lib/models/business_snapshot.dart`.
- Supabase migrations preserve compatibility and read behavior.

## Interfaces

- `normalizePackageType()`
- `packageLabel()`
- `packagePriceLabel()`
- `canAccessPackage()`

## Production

- Canonical package ids are live.
- Legacy aliases still read correctly.
- Report access and UI labels use the canonical model.

## MVP

- Manual package assignment in Supabase.
- Package-aware report visibility.

## In Progress

- Clean migration of all historical rows to canonical ids.
- Better operator tooling for package changes.

## Roadmap

- Payment-backed package changes.
- Package-aware automation routing.
- Revenue intelligence built on package state.

## Known Limitations

- Customers do not self-select or purchase packages in-app.
- Legacy values may still exist in older rows.
- Some surfaces still display legacy aliases for clarity.
