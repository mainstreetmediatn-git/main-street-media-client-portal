# Main Street Media Knowledge Base

Status: Production

Last updated: 2026-07-13

This directory is the canonical source of architectural truth for the repository.
If code changes the platform shape, these documents must change with it.

## Source Of Truth

- Production implementation lives in `dashboard/`, `mobile/`, `shared/`, and `supabase/`.
- Roadmap material must stay clearly marked as future work.
- Prompts, operational runbooks, package rules, and lifecycle behavior belong here instead of in scattered comments or ad hoc prompt text.

## Documentation Index

| Document | Purpose | Status |
| --- | --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System layout, layers, dependencies, and current boundaries | Production |
| [BUSINESS_SNAPSHOT.md](./BUSINESS_SNAPSHOT.md) | Canonical business-state contract shared by dashboard and mobile | Production |
| [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) | Domain entities, relationships, and lifecycle objects | In Progress |
| [AGENTS.md](./AGENTS.md) | Current agent scaffold, operating rules, and future agent roles | In Progress |
| [OPERATIONS.md](./OPERATIONS.md) | Operational workflows, manual controls, and planned automation surfaces | In Progress |
| [CUSTOMER_LIFECYCLE.md](./CUSTOMER_LIFECYCLE.md) | End-to-end lifecycle from lead to renewal | Production |
| [PACKAGE_MODEL.md](./PACKAGE_MODEL.md) | Canonical package ids, aliases, pricing labels, and access rules | Production |
| [DATA_FLOW.md](./DATA_FLOW.md) | How data moves through auth, Supabase, snapshot loading, and UI surfaces | Production |
| [WORKFLOWS.md](./WORKFLOWS.md) | Lifecycle and package workflow templates | In Progress |
| [API_CONTRACTS.md](./API_CONTRACTS.md) | Supabase table contracts, auth assumptions, and application-facing interfaces | Production |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Runtime, environment, release, and verification guidance | Production |
| [DECISIONS.md](./DECISIONS.md) | Architectural decision log | Production |
| [ROADMAP.md](./ROADMAP.md) | Phase VI through Phase X future-state plan | Roadmap |
| [PROMPT_LIBRARY.md](./PROMPT_LIBRARY.md) | Curated prompt and briefing strings used across the repo | In Progress |
| [CHANGELOG.md](./CHANGELOG.md) | Repository architecture change log | Production |

## Status Bands

- Production: already implemented and validated in the current repository.
- MVP: the current shipped paid-pilot slice.
- In Progress: scaffolded or partially wired, but not a live runtime.
- Roadmap: future systems only.

## Cross-Document Rules

- Do not describe roadmap items as shipped.
- Use canonical package ids `core`, `elite`, and `agent_workflow_24_7`.
- Treat `Reveal`, `Evolve`, `Ascend`, `197`, `297`, and `397` as compatibility aliases only.
- Keep `BusinessSnapshot` as the shared business-state model for dashboard and mobile.
- Update the knowledge base before implementation is considered complete.
