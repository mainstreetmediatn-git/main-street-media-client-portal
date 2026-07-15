# Change Log

Status: Archive

## 2026-07-13

- Established `BusinessSnapshot` as the canonical portal model.
- Added `dashboard/lib/businessSnapshot.ts` for snapshot normalization and loading.
- Added `dashboard/lib/orchestrator.ts` as the Growth OS orchestrator skeleton.
- Mirrored the snapshot model in Flutter at `mobile/lib/models/business_snapshot.dart`.
- Removed inline package access and report normalization logic from the dashboard and mobile screens.
- Added a Supabase migration that accepts canonical package ids alongside legacy aliases.
- Synchronized the architecture and implementation docs with the reconciled model.
- Clarified the docs that the event-driven intelligence layer is still scaffolded, and Phase VI remains roadmap work.

## Notes

- New Growth OS agent implementation should wait until the validation pass has been completed successfully.
