"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";
import { supabase } from "../../lib/supabase";
import { getBusinessDisplayName, type BusinessSnapshot, type Profile } from "../../lib/portal";
import { loadBusinessSnapshot } from "../../lib/businessSnapshot";

export default function AccountPage() {
  return (
    <AuthGuard>
      {({ user, profile }) => (
        <AccountContent userId={user.id} profile={profile} />
      )}
    </AuthGuard>
  );
}

function AccountContent({ userId, profile }: { userId: string; profile: Profile | null }) {
  const [snapshot, setSnapshot] = useState<BusinessSnapshot | null>(null);

  useEffect(() => {
    async function loadAccountSnapshot() {
      const nextSnapshot = await loadBusinessSnapshot(supabase, userId);
      setSnapshot(nextSnapshot);
    }

    loadAccountSnapshot();
  }, [userId]);

  const resolvedProfile = snapshot?.profile;
  const displayName = getBusinessDisplayName(
    resolvedProfile ?? (profile ? { fullName: profile.full_name, businessName: profile.business_name } : null)
  );

  return (
    <Shell isAdmin={profile?.role === "admin"}>
      <div className="header narrow-header">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Business profile</h1>
          <p className="muted">Canonical package changes are handled manually by Main Street Media Co.</p>
        </div>
      </div>

      <section className="card profile-card">
        <dl>
          <div><dt>Name</dt><dd>{resolvedProfile?.fullName || profile?.full_name || "Not set"}</dd></div>
          <div><dt>Email</dt><dd>{resolvedProfile?.email || profile?.email || "Not set"}</dd></div>
          <div><dt>Business</dt><dd>{resolvedProfile?.businessName || profile?.business_name || "Not set"}</dd></div>
          <div><dt>Contact</dt><dd>{resolvedProfile?.phone || profile?.phone || "Not set"}</dd></div>
          <div><dt>Package</dt><dd>{snapshot?.summary.packageLabel ?? "Pending Assignment"}</dd></div>
          <div><dt>Role</dt><dd className="capitalize">{resolvedProfile?.role || profile?.role || "customer"}</dd></div>
          <div><dt>Display</dt><dd>{displayName}</dd></div>
        </dl>
      </section>
    </Shell>
  );
}
