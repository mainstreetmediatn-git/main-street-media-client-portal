"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText, Lock } from "lucide-react";
import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";
import { supabase } from "../../lib/supabase";
import {
  canAccessPackage,
  normalizeReport,
  packageLabel,
  reportCatalog,
  type CustomerReportRow,
  type Profile,
  type Report
} from "../../lib/portal";

export default function ReportsPage() {
  return (
    <AuthGuard>
      {({ profile }) => <ReportsContent profile={profile} />}
    </AuthGuard>
  );
}

function ReportsContent({ profile }: { profile: Profile | null }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const packageType = profile?.package_type ?? null;

  useEffect(() => {
    async function loadReports() {
      const { data } = await supabase
        .from("customer_reports")
        .select("id,user_id,report_id,assigned_at,created_at,reports(*)")
        .order("assigned_at", { ascending: false });

      const normalized = ((data as CustomerReportRow[] | null) ?? [])
        .map(normalizeReport)
        .filter((report): report is Report => Boolean(report));
      setReports(normalized);
      setLoading(false);
    }

    loadReports();
  }, []);

  return (
    <Shell isAdmin={profile?.role === "admin"}>
      <div className="header">
        <div>
          <div className="eyebrow">Reports</div>
          <h1>Reports Assigned to Your Business</h1>
          <p className="muted">Your current package: {packageLabel(packageType)}.</p>
        </div>
      </div>

      <section className="report-stack">
        {loading ? <div className="card">Loading reports...</div> : null}
        {!loading && !reports.length ? (
          <div className="empty-state card">
            <FileText size={28} aria-hidden />
            <h2>No reports assigned yet</h2>
            <p className="muted">Your reports will appear here after Main Street Media Co. assigns them to your account.</p>
          </div>
        ) : null}
        {reports.map((report) => {
          const unlocked = canAccessPackage(packageType, report.visibility_package_required);
          return (
            <article className={unlocked ? "report-detail card" : "report-detail card locked-report"} key={report.id}>
              <div className="report-detail-header">
                <div>
                  <span className="status-pill">{report.visibility_package_required === "197" ? "$197 Visibility" : "$297 Growth"}</span>
                  <h2>{report.title}</h2>
                  <p className="muted">{report.description || "Assigned report from Main Street Media Co."}</p>
                </div>
                {!unlocked ? <Lock size={22} aria-hidden /> : <FileText size={22} aria-hidden />}
              </div>
              {unlocked ? (
                <>
                  {report.content ? <div className="report-content">{report.content}</div> : null}
                  {report.file_url ? (
                    <a className="button button-secondary" href={report.file_url} target="_blank" rel="noreferrer">
                      Open report <ExternalLink size={16} aria-hidden />
                    </a>
                  ) : null}
                </>
              ) : (
                <div className="locked-message">
                  This report is available on the Growth package. Contact Main Street Media Co. to unlock it.
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="section">
        <h2>Report Types</h2>
        <div className="catalog-grid">
          {reportCatalog.map((item) => (
            <article className={canAccessPackage(packageType, item.requiredPackage) ? "catalog-item" : "catalog-item locked"} key={item.type}>
              <div>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </div>
              <span className={canAccessPackage(packageType, item.requiredPackage) ? "status-pill" : "lock-pill"}>
                {canAccessPackage(packageType, item.requiredPackage) ? "Included" : "Growth"}
              </span>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

