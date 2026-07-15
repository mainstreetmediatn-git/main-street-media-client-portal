"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BadgeDollarSign, CheckCircle2, ShieldAlert } from "lucide-react";
import { Shell } from "../../components/Shell";
import { canonicalPackageIds, packageDefinitions, type CanonicalPackageId } from "../../../shared/packageCatalog";
import { supabase } from "../../lib/supabase";
import { loadBusinessSnapshot } from "../../lib/businessSnapshot";
import { loadStripe } from "@stripe/stripe-js";

type BillingClientProps = {
  stripePublishableKey: string;
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
  stripePublishableKey,
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
  const [loadingState, setLoadingState] = useState<string>("Preparing checkout");
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
    setLoadingState("Creating secure Stripe checkout");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          customerName: localName,
          businessName: localBusinessName,
          leadId: localLeadId
        })
      });

      const payload = (await response.json().catch(() => null)) as { sessionId?: string; sessionUrl?: string; error?: string } | null;

      if (!response.ok || !payload?.sessionId || !payload.sessionUrl) {
        setError(payload?.error || "Unable to start Stripe Checkout.");
        return;
      }

      const stripe = await loadStripe(stripePublishableKey);
      if (!stripe) {
        setError("Stripe.js could not be initialized.");
        return;
      }

      window.location.assign(payload.sessionUrl);
      setSuccess("Redirecting to Stripe Checkout...");
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
    } finally {
      setSubmitting(false);
      setLoadingState("Ready");
    }
  }

  return (
      <Shell isAdmin={isAdmin}>
      <div className="header narrow-header">
        <div>
          <div className="eyebrow">Billing</div>
          <h1>Secure Stripe Checkout</h1>
          <p className="muted">
            Only the publishable key reaches the browser. Payment confirmation, customer updates, and follow-up
            creation happen after Stripe verifies the webhook.
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
              The selected package, customer name, business name, lead ID, Stripe customer ID, Stripe session ID,
              payment amount, and payment status are all persisted after webhook confirmation.
            </p>
            <button className="button button-large" disabled={submitting} onClick={handleCheckout} type="button">
              {submitting ? loadingState : "Continue to Stripe Checkout"} <ArrowRight size={18} aria-hidden />
            </button>
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
              <h2>Server-only Stripe secret handling</h2>
            </div>
            <BadgeDollarSign size={20} aria-hidden />
          </div>
          <ul className="billing-checklist">
            <li>Checkout Sessions are created on the server.</li>
            <li>Webhook signatures are verified before CRM updates.</li>
            <li>Existing Stripe customers are reused instead of duplicated.</li>
            <li>Failed or expired sessions are recorded without exposing the secret key.</li>
          </ul>
        </article>
      </section>
    </Shell>
  );
}
