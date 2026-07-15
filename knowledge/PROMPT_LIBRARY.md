# Prompt Library

Status: In Progress

Last updated: 2026-07-13

## Purpose

This file gathers prompt-like strings and briefing language that are currently scattered across the repository.
It is not a runtime prompt manager yet.

## Current Implementation

- Portal and landing-page prompts live in `dashboard/app/page.tsx` and `dashboard/app/dashboard/page.tsx`.
- Orchestrator guidance lives in `dashboard/lib/orchestrator.ts`.
- Scout prompts and timeline language live in `dashboard/lib/portalNarrative.ts`.
- Operator brief text lives in `dashboard/internal/main-street-media-call-sheet.html`.
- Mobile startup and error copy live in `mobile/lib/main.dart` and related screens.

## Architecture

- "This is a skeleton only. Do not attach live agent execution until the validation pass is green."
- "All future Growth OS agents should read from BusinessSnapshot instead of reaching into raw table rows."
- "Persist the decisions, prompts, and approvals into the change log."

## Portal

- "Your business is becoming impossible to ignore."
- "Good Morning, {name}."
- "Request audit"
- "View reports"
- "Start your portal"
- "Customer login"

## CRM

- "Turn optimization into a sales tool."
- "Lead capture"
- "Manual package assignment"
- "Manual report assignment"
- "Manual audit triage"

## Audit Engine

- "Why did my ranking change?"
- "How many leads came from Google?"
- "Show me this month's improvements."
- "What should we improve next?"
- "Explain this audit."

## AI Agents

- "Ask the AI assistant anything."
- "Meet Scout"
- "Bottom-right AI assistant."

## Operations

- "Reconcile business snapshot"
- "Plan the next action"
- "Assign operational work"
- "Verify generated output"
- "Archive the execution trail"

## Deployment

- "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the deployment environment."
- "Do not deploy .env.local."

## Infrastructure

- "Check device DNS, internet access, and SUPABASE_URL."
- "The app could not initialize Supabase."
- "The app could not resolve the Supabase hostname during startup."
- "Supabase environment variables are missing."

## Notes

- These strings are intentionally short and user-facing.
- Future prompt templates should be added here with their source files and category.
- If a prompt becomes operational logic, it belongs in code and in the knowledge base, not only in a UI string.

## Future Roadmap

- Centralize prompt templates into a versioned registry.
- Add category metadata and ownership to each template.
- Capture approval state for any prompt that can trigger customer-facing work.

## Interfaces

- Dashboard UI strings
- Mobile UI strings
- Operator call-sheet content
- Orchestrator skeleton notes

## Dependencies

- Next.js dashboard pages
- Flutter startup and screens
- BusinessSnapshot and package model

## Known Limitations

- This is a curated library, not an executable prompt system.
- Several strings are still embedded directly in UI code.
