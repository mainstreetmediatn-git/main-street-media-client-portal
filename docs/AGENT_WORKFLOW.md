# Main Street Media Portal Agent Workflow

Status: Production

This repo uses the same curated Codex build team as the public website. The agents are installed in `~/.codex/agents/` with `main-street-media-*` names.
The canonical business state for those agents is `BusinessSnapshot`.

## Portal Agent Order

1. Product Manager Agent defines the next paid-pilot slice and separates launch blockers from Growth OS backlog.
2. UI/UX Agent reviews `dashboard/app/page.tsx`, `dashboard/app/styles.css`, `dashboard/components/`, and `mobile/lib/main.dart` for mobile-first clarity, premium portal feel, empty states, and accessibility.
3. Backend Architect Agent reviews `supabase/migrations/`, `dashboard/lib/supabase.ts`, `dashboard/lib/businessSnapshot.ts`, and `dashboard/lib/orchestrator.ts` for auth, RLS, reporting, customer package access, and CRM readiness.
4. Security Engineer Agent checks `.env.example`, `dashboard/.env.example`, untracked local env files, Supabase policies, storage access, and dependency exposure.
5. Frontend Agent implements focused UI and state fixes in dashboard/mobile surfaces.
6. Marketing and Sales Agents shape audit request, upgrade prompts, outbound workflow, lead notes, and CRM pipeline language.
7. QA Agent runs lint/build/test checks and records release blockers.
8. Technical Writer Agent updates README, implementation docs, runbooks, operator checklists, and the change log.

## Commands

Dashboard:

```bash
cd /home/kalikali/main-street-media-client-portal/dashboard
npm run lint
npm run build
npm run dev
```

Mobile:

```bash
cd /home/kalikali/main-street-media-client-portal/mobile
flutter analyze
flutter test
```

Supabase:

```bash
cd /home/kalikali/main-street-media-client-portal
supabase db push
```

## Guardrails

- Do not commit or expose `dashboard/.env.local` or `mobile/.env`.
- Browser code may use only public Supabase URL and anon key.
- Service role keys belong only in server-side or Supabase-managed contexts.
- Keep paid pilot scope lean: account, audit request, profile, package-aware reports, admin assignment workflow.
- Treat CRM, Stripe, Gmail, Slack, and automated report generation as staged integrations unless explicitly in the current implementation slice.
- Use the canonical package ids from `shared/packageCatalog.ts`; legacy numeric aliases are compatibility only.
- Do not implement new Growth OS agents until the BusinessSnapshot validation pass is complete.
