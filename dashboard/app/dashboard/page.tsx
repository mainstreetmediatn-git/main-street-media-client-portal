"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";
import { supabase } from "../../lib/supabase";
import {
  canAccessPackage,
  normalizeReport,
  packageLabel,
  reportCatalog,
  type AuditRequest,
  type CustomerReportRow,
  type Profile,
  type Report
} from "../../lib/portal";

export default function DashboardPage() {
  return (
    <AuthGuard>
      {({ profile }) => <DashboardContent profile={profile} />}
    </AuthGuard>
  );
}

function DashboardContent({ profile }: { profile: Profile | null }) {
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const packageType = profile?.package_type ?? null;

  useEffect(() => {
    async function loadPortalData() {
      const [{ data: audits }, { data: assignedReports }] = await Promise.all([
        supabase.from("audit_requests").select("*").order("created_at", { ascending: false }).limit(5),
        supabase
          .from("customer_reports")
          .select("id,user_id,report_id,assigned_at,created_at,reports(*)")
          .order("assigned_at", { ascending: false })
      ]);

      setAuditRequests((audits as AuditRequest[] | null) ?? []);
      const normalized = ((assignedReports as CustomerReportRow[] | null) ?? [])
        .map(normalizeReport)
        .filter((report): report is Report => Boolean(report));
      setReports(normalized);
    }

    loadPortalData();
  }, []);

  const visibleReports = useMemo(
    () => reports.filter((report) => canAccessPackage(packageType, report.visibility_package_required)),
    [packageType, reports]
  );
  const latestStatus = auditRequests[0]?.status ?? "No request submitted";

  return (
    <Shell isAdmin={profile?.role === "admin"}>
      <div className="header">
        <div>
          <div className="eyebrow">Your Local Visibility Dashboard</div>
          <h1>See where your business stands and what to fix next.</h1>
          <p className="muted">Helping Great Local Businesses Become Impossible to Ignore.</p>
        </div>
        <Link className="button" href="/request-audit">
          Request audit <ArrowRight size={17} aria-hidden />
        </Link>
      </div>

      <section className="grid">
        <div className="card metric-card">
          <span className="muted">Business</span>
          <strong>{profile?.business_name || "Business pending"}</strong>
        </div>
        <div className="card metric-card">
          <span className="muted">Package</span>
          <strong>{packageLabel(packageType)}</strong>
        </div>
        <div className="card metric-card">
          <span className="muted">Audit status</span>
          <strong className="capitalize">{latestStatus.replaceAll("_", " ")}</strong>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Reports Assigned to Your Business</h2>
            <p className="muted">Assigned reports appear here after Main Street Media Co. completes your audit work.</p>
          </div>
          <Link className="inline-link" href="/reports">View all reports</Link>
        </div>
        <div className="report-list">
          {visibleReports.length ? (
            visibleReports.slice(0, 3).map((report) => (
              <article className="report-card" key={report.id}>
                <Sparkles size={18} aria-hidden />
                <div>
                  <h3>{report.title}</h3>
                  <p>{report.description || "Report assigned by Main Street Media Co."}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No unlocked reports yet</h3>
              <p className="muted">Submit an audit request or check back after your first report is assigned.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Package Access</h2>
        <div className="catalog-grid">
          {reportCatalog.map((item) => {
            const unlocked = canAccessPackage(packageType, item.requiredPackage);
            return (
              <article className={unlocked ? "catalog-item" : "catalog-item locked"} key={item.type}>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </div>
                <span className={unlocked ? "status-pill" : "lock-pill"}>
                  {unlocked ? "Included" : <><Lock size={14} aria-hidden /> Growth</>}
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}
