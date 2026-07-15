import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canAccessPackage,
  canonicalPackageIds,
  getPackageDefinition,
  normalizePackageType,
  packageLabel,
  packagePriceLabel,
  packageDefinitions,
  type CanonicalPackageId,
  type PackageType
} from "./packages";
import {
  BUSINESS_SNAPSHOT_VERSION,
  BUSINESS_SNAPSHOT_ORIGIN_KIND,
  BUSINESS_SNAPSHOT_EVENT_TYPES,
  BUSINESS_SNAPSHOT_SCORE_DIMENSIONS,
  type BusinessSnapshotEvent,
  type BusinessSnapshotEventType,
  type BusinessSnapshotOrigin,
  type BusinessSnapshotProvenance,
  type BusinessSnapshotRecordProvenance,
  type BusinessSnapshotScoreDimension,
  type BusinessSnapshotScoreDimensionResult,
  type BusinessSnapshotScoreSignal,
  type BusinessSnapshotScorecard,
  type BusinessSnapshotVersion,
  type BusinessSnapshotSourceTable
} from "./businessSnapshotContracts";

export type BusinessSnapshotProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  business_name: string | null;
  phone: string | null;
  package_type: PackageType;
  role: "customer" | "admin";
  created_at?: string;
  updated_at?: string;
};

export type BusinessSnapshotAuditRequestRow = {
  id: string;
  user_id: string;
  business_name: string;
  website: string | null;
  phone: string | null;
  email: string;
  business_category: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
};

export type BusinessSnapshotReportRow = {
  id: string;
  title: string;
  report_type: ReportType;
  description: string | null;
  file_url: string | null;
  content: string | null;
  visibility_package_required: PackageType;
  created_at: string;
  updated_at?: string;
};

export type BusinessSnapshotCustomerReportRow = {
  id: string;
  user_id: string;
  report_id: string;
  assigned_at: string;
  created_at: string;
  reports: BusinessSnapshotReportRow | BusinessSnapshotReportRow[] | null;
};

export type BusinessSnapshotPackage = {
  canonicalId: CanonicalPackageId | null;
  sourceValue: PackageType;
  label: string;
  priceLabel: string;
  rank: 1 | 2 | 3 | null;
  description: string | null;
};

export type BusinessSnapshotProfile = {
  id: string;
  fullName: string | null;
  email: string | null;
  businessName: string | null;
  phone: string | null;
  role: "customer" | "admin";
  package: BusinessSnapshotPackage;
  provenance: BusinessSnapshotRecordProvenance;
  createdAt?: string;
  updatedAt?: string;
};

export type BusinessSnapshotAuditRequest = {
  id: string;
  userId: string;
  businessName: string;
  website: string | null;
  phone: string | null;
  email: string;
  businessCategory: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  provenance: BusinessSnapshotRecordProvenance;
};

export type BusinessSnapshotReport = {
  id: string;
  title: string;
  reportType: ReportType;
  description: string | null;
  fileUrl: string | null;
  content: string | null;
  requiredPackage: BusinessSnapshotPackage;
  createdAt: string;
  updatedAt?: string;
  assignedAt?: string;
  provenance: BusinessSnapshotRecordProvenance;
};

export type BusinessSnapshotSummary = {
  latestAuditStatusLabel: string;
  packageLabel: string;
  packagePriceLabel: string;
  assignedReportCount: number;
  visibleReportCount: number;
};

export type BusinessSnapshot = {
  version: BusinessSnapshotVersion;
  provenance: BusinessSnapshotProvenance;
  profile: BusinessSnapshotProfile;
  auditRequests: BusinessSnapshotAuditRequest[];
  latestAuditRequest: BusinessSnapshotAuditRequest | null;
  catalogReports: BusinessSnapshotReport[];
  reports: BusinessSnapshotReport[];
  visibleReports: BusinessSnapshotReport[];
  summary: BusinessSnapshotSummary;
  events: BusinessSnapshotEvent[];
  scorecard: BusinessSnapshotScorecard;
};

export type ReportType =
  | "visibility_audit"
  | "google_business_profile"
  | "local_seo"
  | "website_conversion"
  | "reputation_review"
  | "custom";

function buildBusinessSnapshotOrigin(): BusinessSnapshotOrigin {
  const tables: BusinessSnapshotSourceTable[] = ["profiles", "audit_requests", "customer_reports", "reports"];
  return {
    kind: BUSINESS_SNAPSHOT_ORIGIN_KIND,
    tables
  };
}

function createRecordProvenance(table: BusinessSnapshotSourceTable, id: string, loadedAt: string, relation?: string | null) {
  return {
    table,
    id,
    loadedAt,
    relation: relation ?? null
  };
}

function normalizeStatusLabel(status: string | undefined) {
  return status?.replaceAll("_", " ") ?? "No request submitted";
}

function scoreProfileCompleteness(profile: BusinessSnapshotProfile): BusinessSnapshotScoreDimensionResult {
  const signals: BusinessSnapshotScoreSignal[] = [
    {
      key: "full_name",
      label: "Full name",
      score: profile.fullName ? 25 : 0,
      maxScore: 25,
      weight: 1,
      rationale: profile.fullName ? "Profile owner name is present." : "Profile owner name is missing."
    },
    {
      key: "email",
      label: "Email",
      score: profile.email ? 25 : 0,
      maxScore: 25,
      weight: 1,
      rationale: profile.email ? "A contact email is available." : "No contact email has been captured."
    },
    {
      key: "business_name",
      label: "Business name",
      score: profile.businessName ? 25 : 0,
      maxScore: 25,
      weight: 1,
      rationale: profile.businessName ? "The business name is set." : "The business name still needs to be filled in."
    },
    {
      key: "phone",
      label: "Phone",
      score: profile.phone ? 25 : 0,
      maxScore: 25,
      weight: 1,
      rationale: profile.phone ? "The phone number is present." : "No phone number is available."
    }
  ];

  const score = signals.reduce((sum, signal) => sum + signal.score, 0);
  return {
    dimension: BUSINESS_SNAPSHOT_SCORE_DIMENSIONS[0],
    label: "Profile completeness",
    score,
    maxScore: 100,
    signals
  };
}

function scoreAuditActivity(auditRequests: BusinessSnapshotAuditRequest[]): BusinessSnapshotScoreDimensionResult {
  const latestAuditRequest = auditRequests[0] ?? null;
  const normalizedStatus = latestAuditRequest?.status.toLowerCase() ?? "";
  const statusScoreMap: Record<string, number> = {
    completed: 100,
    complete: 100,
    approved: 100,
    resolved: 100,
    in_review: 75,
    under_review: 75,
    assigned: 60,
    submitted: 45,
    pending: 35,
    open: 35,
    blocked: 20,
    rejected: 10
  };

  const score = latestAuditRequest ? statusScoreMap[normalizedStatus] ?? 50 : 0;
  const signals: BusinessSnapshotScoreSignal[] = [
    {
      key: "latest_status",
      label: "Latest request status",
      score,
      maxScore: 100,
      weight: 2,
      rationale: latestAuditRequest
        ? `Latest audit request is ${normalizeStatusLabel(latestAuditRequest.status)}.`
        : "No audit request has been submitted yet."
    },
    {
      key: "request_history",
      label: "Request history",
      score: Math.min(auditRequests.length * 15, 30),
      maxScore: 30,
      weight: 1,
      rationale:
        auditRequests.length > 1
          ? `${auditRequests.length} audit requests are on file.`
          : auditRequests.length === 1
            ? "One audit request is on file."
            : "No audit request history exists."
    }
  ];

  return {
    dimension: BUSINESS_SNAPSHOT_SCORE_DIMENSIONS[1],
    label: "Audit activity",
    score: Math.round((signals[0].score * 2 + signals[1].score) / 3),
    maxScore: 100,
    signals
  };
}

function scoreReportAccess(snapshot: BusinessSnapshot): BusinessSnapshotScoreDimensionResult {
  const totalReports = snapshot.reports.length;
  const visibleReports = snapshot.visibleReports.length;
  const ratioScore = totalReports > 0 ? Math.round((visibleReports / totalReports) * 100) : 0;
  const signals: BusinessSnapshotScoreSignal[] = [
    {
      key: "visible_reports",
      label: "Visible reports",
      score: ratioScore,
      maxScore: 100,
      weight: 2,
      rationale:
        totalReports > 0
          ? `${visibleReports} of ${totalReports} assigned reports are visible to the current package.`
          : "No assigned reports are available yet."
    },
    {
      key: "assigned_reports",
      label: "Assigned report count",
      score: Math.min(totalReports * 10, 40),
      maxScore: 40,
      weight: 1,
      rationale:
        totalReports > 0
          ? `${totalReports} report(s) are attached to the snapshot.`
          : "No reports have been attached to the snapshot."
    }
  ];

  return {
    dimension: BUSINESS_SNAPSHOT_SCORE_DIMENSIONS[2],
    label: "Report access",
    score: Math.round((signals[0].score * 2 + signals[1].score) / 3),
    maxScore: 100,
    signals
  };
}

function scorePackageAlignment(profile: BusinessSnapshotProfile): BusinessSnapshotScoreDimensionResult {
  const canonical = profile.package.canonicalId;
  const signals: BusinessSnapshotScoreSignal[] = [
    {
      key: "canonical_package",
      label: "Canonical package",
      score: canonical ? 100 : 30,
      maxScore: 100,
      weight: 2,
      rationale: canonical
        ? `Package ${canonical} is normalized to a canonical id.`
        : "The package still uses a pending or legacy value."
    },
    {
      key: "package_rank",
      label: "Package rank",
      score: profile.package.rank ? profile.package.rank * 30 + 10 : 0,
      maxScore: 100,
      weight: 1,
      rationale: profile.package.rank
        ? `Package rank ${profile.package.rank} is available for access decisions.`
        : "No package rank is available."
    }
  ];

  return {
    dimension: BUSINESS_SNAPSHOT_SCORE_DIMENSIONS[3],
    label: "Package alignment",
    score: Math.round((signals[0].score * 2 + signals[1].score) / 3),
    maxScore: 100,
    signals
  };
}

export function buildBusinessSnapshotScorecard(snapshot: BusinessSnapshot): BusinessSnapshotScorecard {
  const dimensions = [
    scoreProfileCompleteness(snapshot.profile),
    scoreAuditActivity(snapshot.auditRequests),
    scoreReportAccess(snapshot),
    scorePackageAlignment(snapshot.profile)
  ];

  const signals = dimensions.flatMap((dimension) => dimension.signals);
  const overallScore = Math.round(dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length);
  const maxScore = dimensions.reduce((sum, dimension) => sum + dimension.maxScore, 0);
  const label =
    overallScore >= 85 ? "Healthy" : overallScore >= 65 ? "Steady" : overallScore >= 40 ? "Needs attention" : "At risk";

  return {
    version: BUSINESS_SNAPSHOT_VERSION,
    generatedAt: snapshot.provenance.builtAt,
    overallScore,
    maxScore,
    label,
    dimensions,
    signals
  };
}

export function buildBusinessSnapshotEvents(snapshot: BusinessSnapshot): BusinessSnapshotEvent[] {
  const { provenance, version, profile, auditRequests, catalogReports, reports, scorecard } = snapshot;

  return [
    {
      id: `${profile.id}:business_snapshot.built:1`,
      type: BUSINESS_SNAPSHOT_EVENT_TYPES[0],
      sequence: 1,
      at: provenance.builtAt,
      snapshotVersion: version,
      subjectId: profile.id,
      origin: provenance.origin,
      payload: {
        auditRequestCount: auditRequests.length,
        catalogReportCount: catalogReports.length,
        reportCount: reports.length,
        visibleReportCount: snapshot.visibleReports.length,
        score: scorecard.overallScore,
        scoreLabel: scorecard.label
      }
    },
    {
      id: `${profile.id}:business_snapshot.reconciled:2`,
      type: BUSINESS_SNAPSHOT_EVENT_TYPES[1],
      sequence: 2,
      at: provenance.builtAt,
      snapshotVersion: version,
      subjectId: profile.id,
      origin: provenance.origin,
      payload: {
        packageLabel: snapshot.summary.packageLabel,
        latestAuditStatusLabel: snapshot.summary.latestAuditStatusLabel,
        catalogReportCount: catalogReports.length
      }
    },
    {
      id: `${profile.id}:business_snapshot.audit_requests.normalized:3`,
      type: BUSINESS_SNAPSHOT_EVENT_TYPES[3],
      sequence: 3,
      at: provenance.builtAt,
      snapshotVersion: version,
      subjectId: profile.id,
      origin: provenance.origin,
      payload: {
        count: auditRequests.length,
        latestAuditRequestId: snapshot.latestAuditRequest?.id ?? null
      }
    },
    {
      id: `${profile.id}:business_snapshot.reports.normalized:4`,
      type: BUSINESS_SNAPSHOT_EVENT_TYPES[4],
      sequence: 4,
      at: provenance.builtAt,
      snapshotVersion: version,
      subjectId: profile.id,
      origin: provenance.origin,
      payload: {
        count: reports.length,
        visibleCount: snapshot.visibleReports.length
      }
    },
    {
      id: `${profile.id}:business_snapshot.scorecard.computed:5`,
      type: BUSINESS_SNAPSHOT_EVENT_TYPES[2],
      sequence: 5,
      at: provenance.builtAt,
      snapshotVersion: version,
      subjectId: profile.id,
      origin: provenance.origin,
      payload: {
        overallScore: scorecard.overallScore,
        maxScore: scorecard.maxScore,
        label: scorecard.label
      }
    }
  ];
}

export function toBusinessSnapshotPackage(packageType: PackageType): BusinessSnapshotPackage {
  const canonicalId = normalizePackageType(packageType);
  const definition = getPackageDefinition(packageType);

  return {
    canonicalId,
    sourceValue: packageType,
    label: packageLabel(packageType),
    priceLabel: packagePriceLabel(packageType),
    rank: definition?.rank ?? null,
    description: definition?.description ?? null
  };
}

export function toBusinessSnapshotProfile(
  row: BusinessSnapshotProfileRow,
  provenance?: BusinessSnapshotRecordProvenance
): BusinessSnapshotProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    businessName: row.business_name,
    phone: row.phone,
    role: row.role,
    package: toBusinessSnapshotPackage(row.package_type),
    provenance:
      provenance ??
      createRecordProvenance("profiles", row.id, row.updated_at ?? row.created_at ?? new Date().toISOString()),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toBusinessSnapshotAuditRequest(
  row: BusinessSnapshotAuditRequestRow,
  provenance?: BusinessSnapshotRecordProvenance
): BusinessSnapshotAuditRequest {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    website: row.website,
    phone: row.phone,
    email: row.email,
    businessCategory: row.business_category,
    city: row.city,
    state: row.state,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    provenance:
      provenance ??
      createRecordProvenance("audit_requests", row.id, row.updated_at ?? row.created_at ?? new Date().toISOString())
  };
}

export function toBusinessSnapshotReport(
  row: BusinessSnapshotReportRow,
  assignedAt?: string,
  provenance?: BusinessSnapshotRecordProvenance
): BusinessSnapshotReport {
  return {
    id: row.id,
    title: row.title,
    reportType: row.report_type,
    description: row.description,
    fileUrl: row.file_url,
    content: row.content,
    requiredPackage: toBusinessSnapshotPackage(row.visibility_package_required),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignedAt,
    provenance:
      provenance ?? createRecordProvenance("reports", row.id, row.updated_at ?? row.created_at ?? new Date().toISOString())
  };
}

export function normalizeAssignedReport(
  row: BusinessSnapshotCustomerReportRow,
  provenance?: BusinessSnapshotRecordProvenance
): BusinessSnapshotReport | null {
  const customerReportProvenance =
    provenance ?? createRecordProvenance("customer_reports", row.id, row.created_at, `report_id:${row.report_id}`);

  if (Array.isArray(row.reports)) {
    return row.reports[0]
      ? toBusinessSnapshotReport(
          row.reports[0],
          row.assigned_at,
          customerReportProvenance
        )
      : null;
  }
  if (!row.reports) return null;
  return toBusinessSnapshotReport(
    row.reports,
    row.assigned_at,
    customerReportProvenance
  );
}

export function buildBusinessSnapshot(input: {
  profile: BusinessSnapshotProfileRow | null;
  auditRequests?: BusinessSnapshotAuditRequestRow[];
  catalogReports?: BusinessSnapshotReportRow[];
  customerReports?: BusinessSnapshotCustomerReportRow[];
  loadedAt?: string;
}): BusinessSnapshot | null {
  if (!input.profile) return null;

  const builtAt = input.loadedAt ?? new Date().toISOString();
  const profileProvenance = createRecordProvenance("profiles", input.profile.id, input.profile.updated_at ?? input.profile.created_at ?? builtAt);
  const auditRequestProvenance = (input.auditRequests ?? []).map((row) =>
    createRecordProvenance("audit_requests", row.id, row.updated_at ?? row.created_at ?? builtAt)
  );
  const catalogReportProvenance = (input.catalogReports ?? []).map((row) =>
    createRecordProvenance("reports", row.id, row.updated_at ?? row.created_at ?? builtAt)
  );
  const customerReportProvenance = (input.customerReports ?? []).map((row) =>
    createRecordProvenance("customer_reports", row.id, row.created_at ?? builtAt, `report_id:${row.report_id}`)
  );

  const profile = toBusinessSnapshotProfile(input.profile, profileProvenance);
  const auditRequests = (input.auditRequests ?? [])
    .map((row, index) => toBusinessSnapshotAuditRequest(row, auditRequestProvenance[index]))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const catalogReports = (input.catalogReports ?? [])
    .map((row, index) => toBusinessSnapshotReport(row, undefined, catalogReportProvenance[index]))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const reports = (input.customerReports ?? [])
    .map((row, index) => normalizeAssignedReport(row, customerReportProvenance[index]))
    .filter((report): report is BusinessSnapshotReport => Boolean(report))
    .sort((left, right) => right.assignedAt?.localeCompare(left.assignedAt ?? "") ?? 0);

  const visibleReports = reports.filter((report) =>
    canAccessPackage(profile.package.sourceValue, report.requiredPackage.sourceValue)
  );

  const snapshotBase = {
    version: BUSINESS_SNAPSHOT_VERSION,
    provenance: {
      version: BUSINESS_SNAPSHOT_VERSION,
      builtAt,
      origin: buildBusinessSnapshotOrigin(),
      profile: profile.provenance,
      auditRequests: auditRequests.map((request) => request.provenance),
      reports: catalogReports.map((report) => report.provenance),
      customerReports: reports.map((report) => report.provenance)
    },
    profile,
    auditRequests,
    latestAuditRequest: auditRequests[0] ?? null,
    catalogReports,
    reports,
    visibleReports,
    summary: {
      latestAuditStatusLabel: normalizeStatusLabel(auditRequests[0]?.status),
      packageLabel: profile.package.label,
      packagePriceLabel: profile.package.priceLabel,
      assignedReportCount: reports.length,
      visibleReportCount: visibleReports.length
    }
  } satisfies Omit<BusinessSnapshot, "events" | "scorecard">;

  const snapshot = snapshotBase as BusinessSnapshot;
  const scorecard = buildBusinessSnapshotScorecard(snapshot);
  const events = buildBusinessSnapshotEvents({ ...snapshot, scorecard });

  return {
    ...snapshot,
    scorecard,
    events
  };
}

export async function loadBusinessSnapshot(
  client: SupabaseClient,
  userId: string
): Promise<BusinessSnapshot | null> {
  const loadedAt = new Date().toISOString();
  const [{ data: profile }, { data: auditRequests }, { data: catalogReports }, { data: customerReports }] =
    await Promise.all([
    client.from("profiles").select("*").eq("id", userId).maybeSingle(),
    client.from("audit_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    client.from("reports").select("*").order("created_at", { ascending: false }),
    client
      .from("customer_reports")
      .select("id,user_id,report_id,assigned_at,created_at,reports(*)")
      .eq("user_id", userId)
      .order("assigned_at", { ascending: false })
  ]);

  return buildBusinessSnapshot({
    profile: (profile as BusinessSnapshotProfileRow | null) ?? null,
    auditRequests: (auditRequests as BusinessSnapshotAuditRequestRow[] | null) ?? [],
    catalogReports: (catalogReports as BusinessSnapshotReportRow[] | null) ?? [],
    customerReports: (customerReports as BusinessSnapshotCustomerReportRow[] | null) ?? [],
    loadedAt
  });
}

export function getBusinessDisplayName(profile: Pick<BusinessSnapshotProfile, "fullName" | "businessName"> | null) {
  if (!profile) return "there";
  const firstName = profile.fullName?.split(" ").find(Boolean);
  const businessName = profile.businessName?.split(" ").find(Boolean);
  return firstName || businessName || "there";
}

export {
  canAccessPackage,
  canonicalPackageIds,
  getPackageDefinition,
  normalizePackageType,
  packageDefinitions,
  packageLabel,
  packagePriceLabel,
  BUSINESS_SNAPSHOT_VERSION,
  BUSINESS_SNAPSHOT_ORIGIN_KIND,
  BUSINESS_SNAPSHOT_EVENT_TYPES,
  BUSINESS_SNAPSHOT_SCORE_DIMENSIONS,
  type BusinessSnapshotVersion,
  type BusinessSnapshotOrigin,
  type BusinessSnapshotProvenance,
  type BusinessSnapshotRecordProvenance,
  type BusinessSnapshotEvent,
  type BusinessSnapshotEventType,
  type BusinessSnapshotScorecard,
  type BusinessSnapshotScoreDimension,
  type BusinessSnapshotScoreDimensionResult,
  type BusinessSnapshotScoreSignal,
  type BusinessSnapshotSourceTable
};
