# Agents

Status: In Progress

Last updated: 2026-07-13

## Current State

The repository contains an orchestrator skeleton, not a live agent runtime.

Current scaffold:

- `dashboard/lib/orchestrator.ts`
- operator briefing content in `dashboard/internal/main-street-media-call-sheet.html`

## Existing Agent Roles

The current scaffold names these future roles:

- intake
- visibility
- fulfillment
- review
- ops
- writer

## Current Behavior

- Agents are described as stages and notes, not executable workers.
- All future agents must read from `BusinessSnapshot`.
- The skeleton exists to keep planned work organized around a reconciled source of truth.

## Operating Rules

- Do not attach live agent execution until validation is complete.
- Do not let agents read raw table rows when a snapshot exists.
- Keep prompts, approvals, and execution trails in version-controlled documentation.
- Preserve tenant boundaries across any future multi-agent system.

## Production

- Operator call-sheet content exists.
- The repository documents handoff order and stage boundaries.
- Documentation already describes the expected agent roster.

## MVP

- Manual operator guidance.
- Snapshot-first planning.
- Human review before any outward-facing action.

## In Progress

- Agent roster definition.
- Stage transitions from reconcile to archive.
- Prompt and approval logging.

## Roadmap

- Multi-tenant Agent Factory.
- Customer-safe autonomous workflows.
- Agent execution logs and approval workflows.

## Dependencies

- `BusinessSnapshot`
- package catalog
- Supabase auth context
- future operations dashboard

## Known Limitations

- No production agent executor.
- No job queue or retry subsystem.
- No customer-facing agent downloads or installable local agents.
