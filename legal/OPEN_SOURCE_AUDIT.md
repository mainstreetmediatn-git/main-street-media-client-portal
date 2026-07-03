# Main Street Growth OS Open Source Audit

Last reviewed: 2026-07-03

This is an engineering and commercial-readiness audit, not legal advice. Before copying third-party source into Main Street Growth OS, have counsel review the exact commit, file path, license text, and intended distribution model.

## Policy

Main Street Growth OS should remain a private, proprietary, Supabase-based SaaS application. Prefer MIT, Apache-2.0, BSD, and similarly permissive code for direct use. Do not copy AGPL, GPL, Sustainable Use, commercial, enterprise, cloud, premium, or EE code into the proprietary app unless Main Street Media Co. intentionally accepts the license obligations or signs a commercial agreement.

Do not copy trademarks, logos, icons, product names, screenshots, documentation text, sample copy, or branding from any audited project. Preserve copyright and license notices for every allowed third-party code use.

## Summary Decision Matrix

| Repo | License | Commercial use allowed? | Closed-source/private derivative allowed? | Source disclosure risk | Enterprise/EE/commercial areas | Attribution required? | Branding/trademark handling | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| payloadcms/payload | MIT | Yes | Yes, if MIT notice is preserved | Low for MIT-covered code | No obvious top-level EE carve-out found in reviewed repo | Yes, preserve MIT notice | Remove Payload names/logos unless nominative reference is needed | Possible direct code/reference candidate |
| danny-avila/LibreChat | MIT | Yes | Yes, if MIT notice is preserved | Low for MIT-covered code | None identified in reviewed license | Yes, preserve MIT notice | Remove LibreChat names/logos/assistant branding | Possible direct code/reference candidate |
| chatwoot/chatwoot | MIT core with enterprise carve-out | Yes for MIT core | Yes for MIT core only | Low for core; high if enterprise code is copied | `enterprise/` has separate license | Yes, preserve MIT notice | Remove Chatwoot names/logos/widget branding | Use core as possible reference; do not copy enterprise |
| activepieces/activepieces | MIT core with EE carve-out | Yes for MIT core | Yes for MIT core only | Low for core; high if EE code is copied | `packages/ee/`, `packages/server/api/src/app/ee` | Yes, preserve MIT notice | Remove Activepieces names/logos/integration branding | Use core as possible reference; do not copy EE |
| mautic/mautic | GPL-3.0-or-later | Yes under GPL terms | Not suitable for proprietary derivatives if distributed/conveyed | Medium/high if combined or distributed | No reviewed commercial directory; project has GPL dependency surface | Yes, GPL notices and source obligations | Mautic trademark must not be reused | Separate service only unless counsel approves |
| twentyhq/twenty | Mostly AGPL-3.0 plus Enterprise commercial files | Yes under AGPL/commercial terms | Not suitable for proprietary derivative; enterprise files require subscription | High for network SaaS modifications | Files marked `@license Enterprise` | Yes, AGPL/commercial notices | Remove Twenty names/logos/UI identity | Inspiration only or commercial license |
| metabase/metabase | AGPL core plus Metabase Commercial License in `enterprise/` | Yes under AGPL/commercial terms | Not suitable for proprietary derivative; enterprise requires commercial license | High for embedded/modified SaaS use | Top-level `enterprise/` | Yes, AGPL/commercial notices | Remove Metabase marks | Separate service only unless lawyer approves |
| formbricks/formbricks | AGPL core; MIT SDK/API packages; EE module carve-out | Yes depending on package | Only MIT packages are safe for proprietary direct use; AGPL app is not | High for app/core; low for MIT package-only use | `apps/web/modules/ee`; MIT packages under `packages/js`, `packages/android`, `packages/ios`, `packages/api` | Yes | Remove Formbricks names/logos/survey branding | Inspiration only for app; MIT SDK packages may be considered separately |
| knadh/listmonk | AGPL-3.0 | Yes under AGPL terms | Not suitable for proprietary derivative | High for modified network service | None identified in reviewed license | Yes, AGPL notices/source offer | Remove listmonk names/logos | Separate service only unless lawyer approves |
| frappe/crm | AGPL-3.0 | Yes under AGPL terms | Not suitable for proprietary derivative | High for modified network service | None identified in reviewed license | Yes, AGPL notices/source offer | Remove Frappe names/logos | Inspiration only or separate service unless lawyer approves |
| n8n-io/n8n | Sustainable Use License; EE files require enterprise license | Limited; internal business use allowed, offering as competing/commercial service restricted | Not suitable for proprietary copied derivative in commercial SaaS without review/license | Medium/high due non-OSI limitations and EE restrictions | `.ee.` files and `.ee` directories | Yes | Remove n8n names/logos/workflow branding | Inspiration only or commercial license |

## Repo Notes

### Payload CMS

Payload is MIT licensed in the reviewed GitHub repository. MIT permits commercial use, modification, distribution, sublicensing, and private/closed-source derivatives when copyright and permission notices are preserved.

Decision: acceptable as a direct dependency or reference candidate. If code is copied, copy only MIT-covered source and retain notices in `THIRD_PARTY_NOTICES.md`. Do not copy Payload trademarks, official templates wholesale, documentation prose, or branded imagery.

### LibreChat

LibreChat's reviewed license is MIT. MIT-covered code can be used commercially and in closed-source derivative works with notice preservation.

Decision: acceptable as a reference candidate for AI assistant patterns. Prefer using behavior and architecture ideas over source copying. If copying any code, record file paths, commit SHA, copyright line, and MIT notice.

### Chatwoot

Chatwoot's root license grants MIT Expat terms outside restricted directories and explicitly carves out `enterprise/` under a separate enterprise license.

Decision: core can be studied and selectively referenced. Do not copy anything from `enterprise/`, enterprise-only docs, paid-feature gates, logos, inbox branding, or widget assets. A support inbox in Main Street Growth OS should be built clean-room against our own Supabase schema.

### Activepieces

Activepieces uses MIT Expat for content outside named EE paths. The reviewed license excludes `packages/ee/` and `packages/server/api/src/app/ee` from MIT.

Decision: core can be studied as a workflow/reference candidate. Do not copy EE paths, connector branding, paid-feature logic, or hosted-cloud material. For Main Street Growth OS, build a narrow automation runner around our events, integrations, and Supabase jobs.

### Mautic

Mautic is GPL-3.0-or-later. Commercial use is allowed under GPL terms, but direct copying into a proprietary app is not compatible with keeping the derivative closed when the covered work is conveyed/distributed.

Decision: use only as a separate service or operational benchmark unless counsel approves a specific integration. Do not copy PHP code, campaign-builder UI, email templates, documentation, or trademarked names.

### Twenty

Twenty is mostly AGPL-3.0, with separately marked Enterprise files under a commercial license. AGPL is specifically designed for network server software and can require source availability to network users for modified covered works.

Decision: inspiration only unless we obtain a commercial license or perform a documented clean-room rewrite. Do not copy source, schema, UI, object model, icons, or enterprise-marked files.

### Metabase

Metabase states that code outside top-level `enterprise/` is AGPL and code inside `enterprise/` is under the Metabase Commercial License unless otherwise noted.

Decision: use as a separate reporting service only, or buy/approve a commercial license. Do not embed or copy query builder, dashboard, visualization, or enterprise code into the proprietary app.

### Formbricks

Formbricks uses AGPL for most app code, has an EE carve-out under `apps/web/modules/ee`, and identifies some packages as MIT. The app itself should be treated as AGPL-restricted for direct proprietary reuse.

Decision: use mainly as inspiration for survey/audit request behavior. Only consider MIT packages after per-package license verification. Do not copy app screens, survey builder code, templates, copy, or EE modules.

### listmonk

listmonk is AGPL-3.0. Commercial use is allowed under AGPL terms, but direct proprietary derivative use is not aligned with Main Street Growth OS's closed-source goal.

Decision: use only as a separate email/newsletter service unless counsel approves. Do not copy Go code, schema, campaign UI, templates, or branding.

### Frappe CRM

Frappe CRM is AGPL-3.0 in the reviewed repository license. Commercial use is allowed under AGPL terms, but direct copying into a proprietary network SaaS is not aligned with keeping Main Street Growth OS closed-source.

Decision: inspiration only or separate service unless counsel approves a specific boundary. Do not copy source, schema, UI, docs, or Frappe branding.

### n8n

n8n is under the Sustainable Use License for non-EE code, with `.ee.` files and `.ee` directories requiring an enterprise license. The Sustainable Use License permits internal business use but is not a standard permissive open source license and restricts commercial redistribution/service use.

Decision: inspiration only or commercial license. Do not copy n8n workflow code, node implementations, UI, icons, docs, or EE files into Main Street Growth OS.

## Clean-Room Rebuild Plan

Clean-room work must describe the product behavior Main Street Growth OS needs without copying source, schemas, UI layouts, documentation text, or assets from restricted projects. Use our own Supabase tables, RLS, Edge Functions, queues, and UI language.

### CRM Pipeline

Build a proprietary pipeline with accounts, contacts, opportunities, stages, activities, tasks, notes, attachments, assignment, and audit history. The board view should support drag-and-drop stage movement, clear value/next-action fields, owner filters, and client-specific visibility. Use our own stage model, our own field names where practical, and our own interaction design.

### Marketing Automation

Build event-triggered workflows for lead capture, nurture sequences, reminders, form submissions, status changes, and email/SMS tasks. Start with a constrained rule model: trigger, conditions, actions, delay, stop conditions, and execution log. Avoid copying Mautic, Activepieces, n8n, or listmonk builders; write a simple Main Street-specific automation DSL and admin UI.

### Support Inbox

Build a multi-channel inbox for email, web form, and client portal requests. Core behavior: conversations, messages, participants, assignment, status, priority, SLA due time, internal notes, canned responses, attachments, and searchable history. Avoid Chatwoot widget/UI code and enterprise features; design the inbox around agency-client operations.

### Content Manager

Build a Supabase-backed content manager for pages, posts, media, SEO fields, campaign landing pages, approval states, revisions, and publishing. Payload may be used as a permissive reference candidate, but Main Street Growth OS should own its content schema and admin UX.

### AI Assistant

Build an assistant that can search authorized client records, summarize work, draft replies, generate task plans, and explain account status. Keep prompt templates, tool calls, retrieval rules, safety checks, and audit logs proprietary. LibreChat may inform general UX patterns, but do not copy its source unless the MIT notice trail is preserved.

### Reporting Dashboard

Build dashboards for leads, revenue pipeline, campaign performance, content output, support volume, response time, and client health. Use our own charts, query definitions, saved views, and permission model. Metabase can run as a separate service if needed, but do not copy its query builder or dashboard implementation.

### Audit Request Form

Build a branded intake form for website audits, marketing audits, content requests, and support requests. Behavior: conditional questions, file uploads, consent fields, client/company lookup, routing rules, confirmation email, and internal task creation. Do not copy Formbricks survey builder or templates; implement a narrow request form builder tailored to Main Street workflows.

## Source References Reviewed

- https://github.com/payloadcms/payload
- https://raw.githubusercontent.com/danny-avila/LibreChat/main/LICENSE
- https://raw.githubusercontent.com/chatwoot/chatwoot/develop/LICENSE
- https://raw.githubusercontent.com/activepieces/activepieces/main/LICENSE
- https://raw.githubusercontent.com/mautic/mautic/6.x/LICENSE.txt
- https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE
- https://raw.githubusercontent.com/metabase/metabase/master/LICENSE.txt
- https://raw.githubusercontent.com/formbricks/formbricks/main/LICENSE
- https://raw.githubusercontent.com/knadh/listmonk/master/LICENSE
- https://raw.githubusercontent.com/frappe/crm/main/LICENSE
- https://raw.githubusercontent.com/n8n-io/n8n/master/LICENSE.md
