"use client";

import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";

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
              <h2>Assign packages</h2>
              <p className="muted">Update `profiles.package_type` to `197` or `297`. Customers do not select packages inside the app.</p>
            </div>
            <div className="card">
              <h2>Create reports</h2>
              <p className="muted">Insert report metadata into `reports`, then connect it to a user through `customer_reports`.</p>
            </div>
            <div className="card">
              <h2>Review audits</h2>
              <p className="muted">Audit requests live in `audit_requests` with status tracking for new, pending, in_review, completed, or archived.</p>
            </div>
          </section>
        </Shell>
      )}
    </AuthGuard>
  );
}

