"use client";

import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";
import { canonicalPackageIds, packageDefinitions } from "../../lib/portal";
import Link from "next/link";

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      {({ profile }) => (
        <Shell isAdmin={profile?.role === "admin"}>
          <div className="header">
            <div>
              <div className="eyebrow">Admin foundation</div>
              <h1>Manual operations hub</h1>
              <p className="muted">Use Supabase for package assignment and report assignment during the paid pilot.</p>
            </div>
          </div>

          <section className="grid">
            <div className="card">
              <h2>Billing Engine</h2>
              <p className="muted">Review protected payment outcomes, receipts, refunds, and recovery work.</p>
              <Link className="button" href="/admin/billing">Open billing dashboard</Link>
            </div>
            <div className="card">
              <h2>Assign packages</h2>
              <p className="muted">
                `BusinessSnapshot` canonicalizes package state to {canonicalPackageIds.join(", ")}. Legacy values
                `Reveal`, `Evolve`, `Ascend`, `197`, `297`, and `397` still normalize correctly for reads only.
              </p>
            </div>
            <div className="card">
              <h2>Create reports</h2>
              <p className="muted">
                Insert report metadata into `reports`, then connect it to a user through `customer_reports`. Report
                access is derived from the canonical snapshot model.
              </p>
            </div>
            <div className="card">
              <h2>Review audits</h2>
              <p className="muted">
                Audit requests live in `audit_requests` with status tracking for new, pending, in_review, completed,
                or archived.
              </p>
            </div>
          </section>

          <section className="grid">
            {canonicalPackageIds.map((id) => (
              <div className="card" key={id}>
                <h3>{packageDefinitions[id].label}</h3>
                <p className="muted">{packageDefinitions[id].description}</p>
              </div>
            ))}
          </section>
        </Shell>
      )}
    </AuthGuard>
  );
}
