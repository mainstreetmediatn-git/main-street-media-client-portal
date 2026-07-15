# Customer Lifecycle

Status: Production

Last updated: 2026-07-13

## Lifecycle

Lead -> Audit -> Proposal -> Payment -> Customer Creation -> Project Creation -> Task Generation -> Agent Provisioning -> Implementation -> QA -> Launch -> Recurring Services -> Renewal

## Current Implementation

The repository currently implements the early and mid lifecycle steps:

- lead capture via signup and landing pages
- audit request submission
- manual package assignment
- customer portal creation
- report assignment and delivery
- internal guidance for downstream operations

The later lifecycle steps are documented here but are not live automations yet.

## Sequence Diagram

```mermaid
sequenceDiagram
  participant L as Lead
  participant A as Audit
  participant S as Sales/Proposal
  participant P as Payment
  participant C as Customer Record
  participant Pr as Project
  participant T as Tasks
  participant Ag as Agents
  participant Q as QA
  participant Lp as Launch
  participant R as Renewal

  L->>A: Submit signup or audit request
  A->>S: Review opportunity and prepare proposal
  S->>P: Collect payment
  P->>C: Create or activate customer
  C->>Pr: Provision project
  Pr->>T: Generate tasks
  T->>Ag: Provision agents
  Ag->>Q: Implement work
  Q->>Lp: Approve launch
  Lp->>R: Enter recurring service cycle
  R->>S: Renewal or expansion
```

## Production

- Lead capture and portal signup exist.
- Audit request intake exists.
- Customer records are represented in Supabase.
- Reports can be assigned after setup.

## MVP

- Manual sales handoff.
- Manual package assignment.
- Manual report delivery.

## In Progress

- Proposal automation.
- Payment-triggered provisioning.
- Task and agent orchestration.

## Roadmap

- Automated implementation pipelines.
- Ongoing recurring services and renewal intelligence.

## Dependencies

- Supabase Auth and profile rows
- audit request and report tables
- package model and BusinessSnapshot

## Known Limitations

- No live payment automation.
- No project provisioning service.
- No task queue or agent executor.
