# Third-Party Notices

Last reviewed: 2026-07-03

This file tracks third-party source code that Main Street Growth OS intentionally copies, modifies, distributes, bundles, or depends on in a way that requires notices. It is not a substitute for package-manager license reports.

## Current Status

No source code from the audited repositories has been approved for copying into Main Street Growth OS during this audit.

## Notice Rules

- MIT/BSD/Apache-style code: preserve copyright notices, license text, and disclaimer.
- GPL/AGPL code: do not copy into the proprietary app unless Main Street Media Co. intentionally accepts source-code obligations and counsel approves.
- Commercial/EE code: do not copy without a signed commercial license.
- Trademarked names, logos, icons, screenshots, docs, and product copy: do not copy into product UI or marketing.

## Approved Notice Register

| Component | Source repo | License | Version/commit | Files used | Required notice | Status |
| --- | --- | --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A | N/A | No copied code approved |

## Candidate Notice Templates

Use these only after a specific file or package is approved for inclusion.

### MIT Template

```text
This product includes code from [PROJECT], licensed under the MIT License.
Copyright (c) [YEAR] [OWNER]

The MIT License text and copyright notice are preserved as required.
```

### Apache-2.0 Template

```text
This product includes code from [PROJECT], licensed under the Apache License, Version 2.0.
Copyright (c) [YEAR] [OWNER]

The Apache-2.0 license text, NOTICE file if present, and required modification notices are preserved.
```

## Audited Repositories Not Approved For Copied Code

| Repo | Reason |
| --- | --- |
| mautic/mautic | GPL-3.0-or-later; use as separate service only unless approved |
| twentyhq/twenty | AGPL-3.0 plus commercial enterprise files |
| metabase/metabase | AGPL core plus commercial enterprise files |
| formbricks/formbricks app/core | AGPL core plus EE module carve-out |
| knadh/listmonk | AGPL-3.0 |
| frappe/crm | AGPL-3.0 |
| n8n-io/n8n | Sustainable Use License plus EE restrictions |

## Audited Repositories Eligible For Narrow Review

| Repo | Eligible scope | Required action before copying |
| --- | --- | --- |
| payloadcms/payload | MIT-covered source | Record exact files, commit SHA, copyright, and MIT text |
| danny-avila/LibreChat | MIT-covered source | Record exact files, commit SHA, copyright, and MIT text |
| chatwoot/chatwoot | MIT core outside `enterprise/` | Verify file is outside restricted path and preserve MIT notice |
| activepieces/activepieces | MIT core outside EE paths | Verify file is outside `packages/ee/` and `packages/server/api/src/app/ee` |
| formbricks/formbricks MIT packages | Only package-level MIT code | Verify package-local license before use |
