"use client";

import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";
import { packageLabel } from "../../lib/portal";

export default function AccountPage() {
  return (
    <AuthGuard>
      {({ user, profile }) => (
        <Shell isAdmin={profile?.role === "admin"}>
          <div className="header narrow-header">
            <div>
              <div className="eyebrow">Account</div>
              <h1>Business profile</h1>
              <p className="muted">Package changes are handled manually by Main Street Media Co.</p>
            </div>
          </div>

          <section className="card profile-card">
            <dl>
              <div><dt>Name</dt><dd>{profile?.full_name || "Not set"}</dd></div>
              <div><dt>Email</dt><dd>{profile?.email || user.email}</dd></div>
              <div><dt>Business</dt><dd>{profile?.business_name || "Not set"}</dd></div>
              <div><dt>Phone</dt><dd>{profile?.phone || "Not set"}</dd></div>
              <div><dt>Package</dt><dd>{packageLabel(profile?.package_type ?? null)}</dd></div>
              <div><dt>Role</dt><dd className="capitalize">{profile?.role || "customer"}</dd></div>
            </dl>
          </section>
        </Shell>
      )}
    </AuthGuard>
  );
}

