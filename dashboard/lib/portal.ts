export type PackageType = "197" | "297" | null;

export type Profile = {
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

export type AuditRequest = {
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

export type Report = {
  id: string;
  title: string;
  report_type: ReportType;
  description: string | null;
  file_url: string | null;
  content: string | null;
  visibility_package_required: "197" | "297";
  created_at: string;
  updated_at?: string;
};

export type CustomerReportRow = {
  id: string;
  user_id: string;
  report_id: string;
  assigned_at: string;
  created_at: string;
  reports: Report | Report[] | null;
};

export type ReportType =
  | "visibility_audit"
  | "google_business_profile"
  | "local_seo"
  | "website_conversion"
  | "reputation_review"
  | "custom";

export const reportCatalog: Array<{
  type: ReportType;
  label: string;
  requiredPackage: "197" | "297";
  description: string;
}> = [
  {
    type: "visibility_audit",
    label: "Visibility Audit",
    requiredPackage: "197",
    description: "Your snapshot of local visibility gaps and near-term wins."
  },
  {
    type: "google_business_profile",
    label: "Google Business Profile Report",
    requiredPackage: "197",
    description: "How your GBP presence is helping or holding back local discovery."
  },
  {
    type: "local_seo",
    label: "Local SEO Report",
    requiredPackage: "297",
    description: "Local rankings, location signals, citations, and search opportunity."
  },
  {
    type: "website_conversion",
    label: "Website / Conversion Report",
    requiredPackage: "297",
    description: "Website clarity, trust, lead capture, and conversion recommendations."
  },
  {
    type: "reputation_review",
    label: "Reputation / Review Report",
    requiredPackage: "297",
    description: "Review growth, response quality, rating signals, and reputation risk."
  },
  {
    type: "custom",
    label: "Additional Assigned Reports",
    requiredPackage: "297",
    description: "Special reports assigned by Main Street Media Co."
  }
];

export function canAccessPackage(profilePackage: PackageType, required: "197" | "297") {
  if (required === "197") return profilePackage === "197" || profilePackage === "297";
  return profilePackage === "297";
}

export function packageLabel(packageType: PackageType) {
  if (packageType === "197") return "$197 Visibility";
  if (packageType === "297") return "$297 Growth";
  return "Pending Assignment";
}

export function normalizeReport(row: CustomerReportRow): Report | null {
  if (Array.isArray(row.reports)) return row.reports[0] ?? null;
  return row.reports;
}

