# Architectural Decisions

Status: Production

Last updated: 2026-07-13

## ADR 001: BusinessSnapshot Exists

`BusinessSnapshot` exists to reconcile the raw Supabase rows into one app-level contract that both the dashboard and mobile app can consume.

Why:

- prevents duplicated visibility and package logic
- keeps dashboard and mobile aligned
- gives future automation a stable read model

## ADR 002: Packages Are Canonical

The canonical ids are `core`, `elite`, and `agent_workflow_24_7`.

Why:

- stable ids are safer than presentation labels
- they survive copy changes and pricing changes
- they make policy and docs easier to keep in sync

## ADR 003: Package Aliases Exist

`Reveal`, `Evolve`, `Ascend`, `197`, `297`, and `397` remain accepted for compatibility.

Why:

- legacy records still exist
- older operator language still appears in the repo and in the field
- read compatibility reduces migration risk

## ADR 004: The Agent Factory Exists As A Separate Concept

The Agent Factory is documented as a future operations capability instead of being collapsed into the portal UI.

Why:

- provisioning and execution are operational concerns
- separating them keeps the customer portal simpler
- it avoids mixing current UI with future autonomy

## ADR 005: Agents Are Multi-Tenant

Future AI agents must respect tenant and role boundaries.

Why:

- the product serves multiple customers
- one customer must not see another customer’s data
- operational tools need explicit permission boundaries

## ADR 006: Customers Do Not Receive Downloadable Agents

Customers get portal access and service outcomes, not installable private agents.

Why:

- lowers distribution and support risk
- preserves Main Street Media operational control
- keeps secret prompts, tools, and policies private

## ADR 007: Documentation Is Part Of The Product

The knowledge base is a first-class source of truth.

Why:

- architectural memory should not live only in prompts
- implementation and documentation must evolve together
- future work should be validated against a versioned record

## ADR 008: Current Tenancy Is User-Centric, Not Workspace-Centric

The current portal uses `auth.uid()`-anchored rows and RLS for customer isolation.

Why:

- this matches the current V1 portal shape
- it is sufficient for a single owner account model
- it keeps the current code and policies simple

Implication:

- AGOS-style multi-user workspaces will require a dedicated workspace membership model, workspace-scoped RLS, and server-side artifact isolation before agent provisioning can be fully live.
