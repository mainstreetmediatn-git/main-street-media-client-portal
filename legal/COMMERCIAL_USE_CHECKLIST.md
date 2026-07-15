# Commercial Use Checklist

Status: Production

Last reviewed: 2026-07-03

Use this checklist before importing code, copying UI, adding a dependency, embedding a service, or basing a Main Street Growth OS feature on another repository.

## Default Decision Rules

- MIT/Apache/BSD: direct use may be allowed after notice review.
- LGPL: legal review required before use.
- GPL: do not copy into proprietary app; separate service only unless approved.
- AGPL: do not copy into proprietary SaaS; separate service only unless approved.
- Sustainable Use / Commons Clause / source-available / custom commercial: do not copy without legal review or commercial license.
- Enterprise, EE, commercial, premium, cloud paths: do not copy.
- Unknown license: do not use directly.

## Pre-Import Checklist

| Check | Required answer |
| --- | --- |
| Exact source repo URL recorded | Yes |
| Exact commit/tag recorded | Yes |
| Exact file paths recorded | Yes |
| License file reviewed from primary source | Yes |
| File-level license headers checked | Yes |
| Dependency licenses checked | Yes |
| No GPL/AGPL code copied into proprietary app | Yes |
| No EE/commercial/premium/cloud code copied | Yes |
| No trademarks, logos, docs, screenshots, or product copy copied | Yes |
| Notices added to `/legal/THIRD_PARTY_NOTICES.md` | Yes |
| Attribution added to `/legal/ATTRIBUTION.md` if needed | Yes |
| Security review completed | Yes |
| Counsel review completed for anything non-permissive | Yes or not applicable |

## Repo-Specific Checklist

### Allowed For Possible Direct Review

| Repo | Allowed scope | Blocked scope |
| --- | --- | --- |
| payloadcms/payload | MIT-covered source after notice review | Branding, docs, templates copied wholesale |
| danny-avila/LibreChat | MIT-covered source after notice review | Branding, docs, prompt/template copy without review |
| chatwoot/chatwoot | MIT core outside `enterprise/` | `enterprise/`, Chatwoot branding, widget assets |
| activepieces/activepieces | MIT core outside EE paths | `packages/ee/`, `packages/server/api/src/app/ee`, cloud/enterprise material |

### Separate Service Or Inspiration Only

| Repo | Safe pattern | Blocked pattern |
| --- | --- | --- |
| mautic/mautic | Separate GPL service with clear boundary | Copying GPL code into proprietary app |
| metabase/metabase | Separate AGPL/commercial BI service | Copying query/dashboard code into proprietary app |
| knadh/listmonk | Separate AGPL mailing service | Copying AGPL code or UI into proprietary app |
| twentyhq/twenty | Inspiration or licensed commercial use | Copying AGPL or enterprise files |
| formbricks/formbricks | Clean-room audit form; verify MIT packages individually | Copying AGPL app/core or EE module |
| frappe/crm | Inspiration or separate AGPL service | Copying AGPL code or UI into proprietary app |
| n8n-io/n8n | Inspiration or commercial license | Copying Sustainable Use or EE code into SaaS |

## Clean-Room Build Controls

1. Write a feature spec in Main Street Media Co. language before implementation.
2. Use one engineer to study competitor behavior and another to implement from the spec when practical.
3. Do not paste upstream code, schemas, tests, CSS, copy, icons, or screenshots into prompts or implementation files.
4. Use original database names, permissions, event names, workflows, and UI structure.
5. Keep implementation commits small and traceable.
6. Document any third-party ideas as behavior-level references, not code-level sources.
7. Run a final search for upstream product names before release.

## Feature-Specific Clean-Room Acceptance Criteria

### CRM Pipeline

- Uses proprietary Supabase tables and RLS.
- Supports contacts, companies, opportunities, stages, tasks, notes, assignment, and activity history.
- Does not copy Twenty, Frappe CRM, or other CRM source/schema/UI.

### Marketing Automation

- Uses Main Street event triggers, conditions, actions, delays, and logs.
- Avoids copying Mautic, n8n, Activepieces EE, or listmonk workflow implementations.
- Each automation run is auditable and reversible where practical.

### Support Inbox

- Supports conversations, messages, assignment, status, internal notes, canned responses, SLA fields, and attachments.
- Does not copy Chatwoot enterprise code, widget assets, or UI text.
- Keeps client data segmented by organization.

### Content Manager

- Uses our content types, media model, revisions, approval states, and publish flow.
- Payload may be referenced only under MIT rules.
- Product UI remains Main Street branded.

### AI Assistant

- Uses proprietary prompt templates, tool definitions, memory policy, and audit logs.
- LibreChat may be reviewed under MIT rules; copied code requires notice.
- Assistant access must respect Supabase authorization boundaries.

### Reporting Dashboard

- Uses our metrics, queries, chart components, saved views, and permissions.
- Metabase may be connected only as a separate service unless counsel approves more.
- No Metabase dashboard/query-builder code copied.

### Audit Request Form

- Uses original form schema, routing rules, submission workflow, and confirmation copy.
- Does not copy Formbricks app/core, survey templates, or EE code.
- Submissions create auditable records and tasks in Main Street Growth OS.

## Release Gate

Before commercial release, complete these gates:

- `/legal/THIRD_PARTY_NOTICES.md` is current.
- `/legal/ATTRIBUTION.md` is current.
- No copied AGPL/GPL/Sustainable Use/commercial code exists in proprietary app.
- No third-party logos, names, or docs are present in product UI.
- Dependency license report is archived.
- Counsel has reviewed any non-permissive dependency or service boundary.
