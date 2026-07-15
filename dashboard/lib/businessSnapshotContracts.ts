export const BUSINESS_SNAPSHOT_VERSION = 1 as const;
export const BUSINESS_SNAPSHOT_ORIGIN_KIND = "supabase" as const;

export const BUSINESS_SNAPSHOT_EVENT_TYPES = [
  "business_snapshot.built",
  "business_snapshot.reconciled",
  "business_snapshot.scorecard.computed",
  "business_snapshot.audit_requests.normalized",
  "business_snapshot.reports.normalized"
] as const;

export const BUSINESS_SNAPSHOT_SCORE_DIMENSIONS = [
  "profile_completeness",
  "audit_activity",
  "report_access",
  "package_alignment"
] as const;

export type BusinessSnapshotVersion = typeof BUSINESS_SNAPSHOT_VERSION;

export type BusinessSnapshotSourceTable = "profiles" | "audit_requests" | "customer_reports" | "reports";

export type BusinessSnapshotOrigin = {
  kind: typeof BUSINESS_SNAPSHOT_ORIGIN_KIND;
  tables: readonly BusinessSnapshotSourceTable[];
};

export type BusinessSnapshotRecordProvenance = {
  table: BusinessSnapshotSourceTable;
  id: string;
  loadedAt: string;
  relation?: string | null;
};

export type BusinessSnapshotProvenance = {
  version: BusinessSnapshotVersion;
  builtAt: string;
  origin: BusinessSnapshotOrigin;
  profile: BusinessSnapshotRecordProvenance | null;
  auditRequests: BusinessSnapshotRecordProvenance[];
  reports: BusinessSnapshotRecordProvenance[];
  customerReports: BusinessSnapshotRecordProvenance[];
};

export type BusinessSnapshotEventType =
  (typeof BUSINESS_SNAPSHOT_EVENT_TYPES)[number];

export type BusinessSnapshotEvent = {
  id: string;
  type: BusinessSnapshotEventType;
  sequence: number;
  at: string;
  snapshotVersion: BusinessSnapshotVersion;
  subjectId: string;
  origin: BusinessSnapshotOrigin;
  payload: Record<string, unknown>;
};

export type BusinessSnapshotScoreDimension =
  (typeof BUSINESS_SNAPSHOT_SCORE_DIMENSIONS)[number];

export type BusinessSnapshotScoreSignal = {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  rationale: string;
};

export type BusinessSnapshotScoreDimensionResult = {
  dimension: BusinessSnapshotScoreDimension;
  label: string;
  score: number;
  maxScore: number;
  signals: BusinessSnapshotScoreSignal[];
};

export type BusinessSnapshotScorecard = {
  version: BusinessSnapshotVersion;
  generatedAt: string;
  overallScore: number;
  maxScore: number;
  label: string;
  dimensions: BusinessSnapshotScoreDimensionResult[];
  signals: BusinessSnapshotScoreSignal[];
};
