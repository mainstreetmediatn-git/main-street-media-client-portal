"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";
import { supabase } from "../../lib/supabase";

export default function RequestAuditPage() {
  return (
    <AuthGuard>
      {({ user, profile }) => <RequestAuditContent userId={user.id} isAdmin={profile?.role === "admin"} defaultEmail={profile?.email || user.email || ""} defaultBusiness={profile?.business_name || ""} defaultPhone={profile?.phone || ""} />}
    </AuthGuard>
  );
}

function RequestAuditContent({
  userId,
  isAdmin,
  defaultEmail,
  defaultBusiness,
  defaultPhone
}: {
  userId: string;
  isAdmin: boolean;
  defaultEmail: string;
  defaultBusiness: string;
  defaultPhone: string;
}) {
  const [form, setForm] = useState({
    business_name: defaultBusiness,
    website: "",
    phone: defaultPhone,
    email: defaultEmail,
    business_category: "",
    city: "",
    state: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const { error: insertError } = await supabase.from("audit_requests").insert({
      user_id: userId,
      ...form,
      status: "pending"
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setForm((current) => ({ ...current, website: "", business_category: "", city: "", state: "", notes: "" }));
  }

  return (
    <Shell isAdmin={isAdmin}>
      <div className="header narrow-header">
        <div>
          <div className="eyebrow">Visibility audit</div>
          <h1>Request a visibility audit</h1>
          <p className="muted">Tell us about the business so Main Street Media Co. can review the right local signals.</p>
        </div>
      </div>

      <section className="card form-card">
        {success ? (
          <div className="success-panel">
            <ClipboardCheck size={32} aria-hidden />
            <h2>Audit request received</h2>
            <p>Main Street Media Co. will review your business and assign reports to your portal when ready.</p>
          </div>
        ) : null}

        <form className="form two-column" onSubmit={handleSubmit}>
          <label>
            Business name
            <input required value={form.business_name} onChange={(event) => updateField("business_name", event.target.value)} />
          </label>
          <label>
            Website
            <input placeholder="https://example.com" value={form.website} onChange={(event) => updateField("website", event.target.value)} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label>
            Email
            <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label>
            Business category
            <input placeholder="Dentist, HVAC, restaurant..." value={form.business_category} onChange={(event) => updateField("business_category", event.target.value)} />
          </label>
          <div className="split-fields">
            <label>
              City
              <input value={form.city} onChange={(event) => updateField("city", event.target.value)} />
            </label>
            <label>
              State
              <input maxLength={2} value={form.state} onChange={(event) => updateField("state", event.target.value.toUpperCase())} />
            </label>
          </div>
          <label className="full-span">
            Notes
            <textarea rows={5} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
          </label>
          {error ? <p className="form-error full-span">{error}</p> : null}
          <button className="button button-large full-span" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit audit request"}
          </button>
        </form>
      </section>
    </Shell>
  );
}

