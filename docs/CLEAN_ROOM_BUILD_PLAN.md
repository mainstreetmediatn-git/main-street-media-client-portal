# Main Street Growth OS Clean-Room Build Plan

Last reviewed: 2026-07-03

This plan defines original Main Street Growth OS product behavior. It must not be implemented by copying source code, schemas, UI text, documentation, screenshots, icons, logos, layouts, or branded product concepts from upstream projects.

## Clean-Room Rules

- Write implementation from Main Street Media Co. requirements, not upstream source.
- Use proprietary Supabase tables, policies, functions, and audit logs.
- Use original field names, interaction patterns, screen copy, and visual design.
- Do not copy GPL, AGPL, Sustainable Use, EE, enterprise, premium, cloud, or commercial-license code.
- Do not copy trademarks, logos, icons, screenshots, documentation text, sample data, or templates.
- Record any approved third-party code in `legal/THIRD_PARTY_NOTICES.md` before release.

## CRM Pipeline

The CRM pipeline should help Main Street Media Co. track local business relationships from first contact through active client growth work.

Required behavior:

- Store organizations, people, opportunities, pipeline stages, owners, values, expected close dates, and source channels.
- Show a pipeline board and list view with filters for owner, stage, package fit, city, lead source, and next action date.
- Allow staff to move opportunities between stages and record the reason for important stage changes.
- Attach notes, calls, emails, meetings, files, audit requests, reports, and tasks to the relevant organization or opportunity.
- Track next action, priority, stale-deal warnings, and last-touch date.
- Support client-safe visibility rules so customers never see internal sales notes.
- Keep an immutable activity timeline for material changes.

## Marketing Automation

Marketing automation should coordinate simple, accountable follow-up without becoming a general-purpose workflow clone.

Required behavior:

- Support triggers from form submissions, audit requests, lead stage changes, report publication, support status changes, and scheduled dates.
- Support conditions based on package type, lead source, client status, tags, owner, and recent activity.
- Support actions for creating tasks, sending approved emails, notifying staff, updating tags, scheduling reminders, and creating follow-up records.
- Include delays, stop conditions, retry handling, and execution logs.
- Require preview and approval for customer-facing messages before an automation is activated.
- Provide a simple automation history showing what ran, when it ran, and what changed.
- Keep automation permissions admin-only for V1.

## Support Inbox

The support inbox should centralize client questions, audit follow-ups, and fulfillment requests.

Required behavior:

- Store conversations, messages, participants, attachments, status, priority, owner, due date, and internal notes.
- Ingest requests from portal forms first, with email ingestion as a later expansion.
- Support assignment, status changes, private notes, customer-visible replies, canned response drafts, and file attachments.
- Show queues for unassigned, open, waiting on customer, waiting on team, overdue, and closed.
- Link conversations to clients, audit requests, reports, and CRM opportunities when relevant.
- Keep all internal notes hidden from customers.
- Log status changes, assignment changes, and outbound replies.

## Content Manager

The content manager should let staff manage marketing and client-facing content without exposing operational internals.

Required behavior:

- Support pages, posts, landing pages, media, reusable content blocks, SEO metadata, publication status, and scheduled publish dates.
- Support draft, review, approved, published, archived, and rejected states.
- Keep revision history and allow staff to compare or restore prior versions.
- Allow media upload with title, alt text, caption, owner, and usage notes.
- Provide role-based permissions for authors, reviewers, admins, and read-only users.
- Support preview links for review without publishing.
- Keep content structure tailored to Main Street service packages and customer portal needs.

## AI Assistant

The AI assistant should help staff and customers understand account status, draft work, and move requests forward while respecting permissions.

Required behavior:

- Answer questions using only records the current user is allowed to access.
- Summarize client profiles, audit requests, reports, support threads, and pipeline activity.
- Draft customer replies, audit summaries, task plans, and follow-up recommendations for staff review.
- Provide citations or record links for factual claims when possible.
- Require explicit staff approval before sending external messages or changing business records.
- Log prompts, tool actions, approvals, and generated outputs according to retention policy.
- Keep system prompts, retrieval rules, tools, and safety checks proprietary.

## Reporting Dashboard

The reporting dashboard should show business performance and client fulfillment health without embedding restricted analytics code.

Required behavior:

- Show metrics for leads, audits requested, audits completed, pipeline value, package mix, report delivery, support volume, response time, and overdue work.
- Support date range, package, owner, client, source, and status filters.
- Provide saved internal views for owner dashboard, fulfillment dashboard, sales dashboard, and executive summary.
- Allow export of approved report summaries where appropriate.
- Keep query definitions, chart components, and visual design original.
- Respect row-level permissions for staff and customers.
- Record when sensitive reports are generated or exported.

## Audit Request Form

The audit request form should turn prospects and customers into structured work requests.

Required behavior:

- Collect business identity, website, service area, goals, pain points, contact details, current marketing channels, and optional files.
- Support conditional questions based on customer type, selected service, and request category.
- Validate required fields and normalize URLs, phone numbers, and email addresses where practical.
- Route submissions to the right queue, owner, and package workflow.
- Create linked records for audit request, support conversation, CRM activity, and follow-up task.
- Send original Main Street confirmation messaging after submission.
- Keep a complete status history from submitted to reviewed, in progress, delivered, and closed.

## Release Checks

- No upstream code, schema, UI text, screenshots, icons, logos, or layouts were copied.
- Any permissive third-party code has notices recorded before release.
- Any non-permissive tool is isolated as a separate service or approved by counsel.
- Product screens and messages use Main Street Media Co. naming and voice.
- Supabase RLS and audit logging are reviewed for every feature before production use.
