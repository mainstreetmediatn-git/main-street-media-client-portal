"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BadgeDollarSign, CheckCircle2, ShieldAlert } from "lucide-react";
import { Shell } from "../../components/Shell";
import { canonicalPackageIds, packageDefinitions, type CanonicalPackageId } from "../../../shared/packageCatalog";
import { supabase } from "../../lib/supabase";
import { loadBusinessSnapshot } from "../../lib/businessSnapshot";

type BillingClientProps = {
  userId: string;
  userEmail: string;
  customerName: string;
  businessName: string;
  leadId: string;
  currentPackage: string | null;
  paymentStatus: string | null;
  customerStatus: string | null;
  isAdmin: boolean;
};

const packageOrder: CanonicalPackageId[] = [...canonicalPackageIds];

export function BillingClient({
  userId,
  userEmail,
  customerName,
  businessName,
  leadId,
  currentPackage,
  paymentStatus,
  customerStatus,
  isAdmin
}: BillingClientProps) {
  const [selectedPackage, setSelectedPackage] = useState<CanonicalPackageId>(
    (currentPackage && canonicalPackageIds.includes(currentPackage as CanonicalPackageId) ? (currentPackage as CanonicalPackageId) : "core")
  );
  const [localName, setLocalName] = useState(customerName);
  const [localBusinessName, setLocalBusinessName] = useState(businessName);
  const [localLeadId, setLocalLeadId] = useState(leadId || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<string>("Preparing secure checkout");
  const [snapshotStatus, setSnapshotStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function refreshSnapshot() {
      const snapshot = await loadBusinessSnapshot(supabase, userId);
      if (!mounted) return;
      setSnapshotStatus(snapshot?.summary.latestAuditStatusLabel ?? null);
      if (!localLeadId) {
        setLocalLeadId(snapshot?.latestAuditRequest?.id ?? userId);
      }
      if (!customerName) {
        setLocalName(snapshot?.profile.fullName || "");
      }
      if (!businessName) {
        setLocalBusinessName(snapshot?.profile.businessName || "");
      }
    }

    refreshSnapshot();
    return () => {
      mounted = false;
    };
  }, [businessName, customerName, localLeadId, userId]);

  async function handleCheckout() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setLoadingState("Creating secure checkout");

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          purchaseType: "subscription",
          paymentMethods: ["card", "us_bank_account"]
        })
      });

      const payload = (await response.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;

      if (!response.ok || !payload?.checkoutUrl) {
        setError(payload?.error || "Unable to start secure checkout.");
        return;
      }

      window.location.assign(payload.checkoutUrl);
      setSuccess("Redirecting to secure checkout...");
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
    } finally {
      setSubmitting(false);
      setLoadingState("Ready");
    }
  }

  async function handleManageBilling() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as { portalUrl?: string; error?: string } | null;
      if (!response.ok || !payload?.portalUrl) {
        setError(payload?.error || "The billing portal is unavailable.");
        return;
      }
      window.location.assign(payload.portalUrl);
    } catch {
      setError("The billing portal is temporarily unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <Shell isAdmin={isAdmin}>
      <div className="header narrow-header">
        <div>
          <div className="eyebrow">Billing</div>
          <h1>MAIN STREET MEDIA BILLING ENGINE</h1>
          <p className="muted">
            Secure, Main Street Media-branded billing. Card and bank details are entered only in approved hosted payment fields.
          </p>
        </div>
      </div>

      <section className="grid">
        <article className="card">
          <h2>Account status</h2>
          <dl className="billing-meta">
            <div>
              <dt>Customer</dt>
              <dd>{localName || "Not set"}</dd>
            </div>
            <div>
              <dt>Business</dt>
              <dd>{localBusinessName || "Not set"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{userEmail || "Not set"}</dd>
            </div>
            <div>
              <dt>Lead ID</dt>
              <dd>{localLeadId || "Derived from the latest audit request"}</dd>
            </div>
            <div>
              <dt>CRM status</dt>
              <dd>{customerStatus || "Lead"}</dd>
            </div>
            <div>
              <dt>Payment status</dt>
              <dd>{paymentStatus || "unpaid"}</dd>
            </div>
          </dl>
          {snapshotStatus ? <p className="muted">Latest audit request: {snapshotStatus}</p> : null}
        </article>

        <article className="card">
          <h2>Select a package</h2>
          <div className="billing-packages">
            {packageOrder.map((packageId) => {
              const definition = packageDefinitions[packageId];
              const isSelected = selectedPackage === packageId;
              return (
                <button
                  className={isSelected ? "billing-package selected" : "billing-package"}
                  key={packageId}
                    onClick={() => setSelectedPackage(packageId)}
                    type="button"
                  >
                  <div>
                    <strong>{definition.label}</strong>
                    <span>{definition.numericLabel}</span>
                  </div>
                  <p>{definition.description}</p>
                  <span className="status-pill">{isSelected ? "Selected" : "Choose"}</span>
                </button>
              );
            })}
          </div>

          <div className="billing-summary">
            <p>
              Your service activates only after a signed processor webhook confirms payment. We never receive or store card numbers or security codes.
            </p>
            <button className="button button-large" disabled={submitting} onClick={handleCheckout} type="button">
              {submitting ? loadingState : "Continue to secure checkout"} <ArrowRight size={18} aria-hidden />
            </button>
            {customerStatus === "Paid" ? <button className="button button-secondary" disabled={submitting} onClick={handleManageBilling} type="button">Manage payment method & invoices</button> : null}
            {error ? (
              <p className="form-error billing-error">
                <ShieldAlert size={16} aria-hidden />
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="form-success billing-success">
                <CheckCircle2 size={16} aria-hidden />
                {success}
              </p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="section">
        <article className="card">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Security</div>
              <h2>Protected payment handling</h2>
            </div>
            <BadgeDollarSign size={20} aria-hidden />
          </div>
          <ul className="billing-checklist">
            <li>Hosted payment collection keeps raw card and bank credentials out of MSM systems.</li>
            <li>Signed webhooks and idempotency controls confirm payments before CRM activation.</li>
            <li>Failed payments receive safe customer messages without exposing fraud or processor details.</li>
            <li>Receipts, refunds, subscriptions, and invoices are tracked in the MSM billing ledger.</li>
          </ul>
        </article>
      </section>
    </Shell>
  );
}
