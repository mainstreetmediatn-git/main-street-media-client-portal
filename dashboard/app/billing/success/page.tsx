import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";
import { createStripeServerClient } from "../../../lib/stripe";

type SuccessProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sessionId = resolvedSearchParams?.session_id;

  if (!sessionId) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="eyebrow">Billing</div>
          <h1>Payment confirmed</h1>
          <p className="muted">Your payment was received. If the CRM sync is still processing, refresh in a moment.</p>
          <Link className="button button-large" href="/dashboard">
            <ChevronLeft size={18} aria-hidden />
            Return to dashboard
          </Link>
        </section>
      </main>
    );
  }

  let session: Stripe.Checkout.Session | null = null;
  let crmStatus = "Processing";
  let selectedPackage = "Pending";
  let customerName = "Customer";
  let businessName = "Business";

  try {
    session = await createStripeServerClient().checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"]
    });
  } catch {
    session = null;
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("customer_status,selected_package,full_name,business_name,payment_status,paid_at")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (profile) {
      crmStatus = profile.customer_status || "Paid";
      selectedPackage = profile.selected_package || selectedPackage;
      customerName = profile.full_name || customerName;
      businessName = profile.business_name || businessName;
    } else if (session?.metadata) {
      crmStatus = "Processing";
      selectedPackage = session.metadata.selected_package || selectedPackage;
      customerName = session.metadata.customer_name || customerName;
      businessName = session.metadata.business_name || businessName;
    }
  } catch {
    if (session?.metadata) {
      selectedPackage = session.metadata.selected_package || selectedPackage;
      customerName = session.metadata.customer_name || customerName;
      businessName = session.metadata.business_name || businessName;
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="eyebrow">Billing</div>
        <h1>Payment confirmed</h1>
        <div className="success-panel billing-success-panel">
          <CheckCircle2 size={40} aria-hidden />
          <p>Stripe Checkout completed for {businessName}. The CRM will show the payment after the verified webhook lands.</p>
        </div>
        <dl className="billing-meta">
          <div>
            <dt>Customer</dt>
            <dd>{customerName}</dd>
          </div>
          <div>
            <dt>Business</dt>
            <dd>{businessName}</dd>
          </div>
          <div>
            <dt>Package</dt>
            <dd>{selectedPackage}</dd>
          </div>
          <div>
            <dt>CRM status</dt>
            <dd>{crmStatus}</dd>
          </div>
          <div>
            <dt>Session</dt>
            <dd>{session?.id || sessionId}</dd>
          </div>
        </dl>
        <Link className="button button-large" href="/dashboard">
          <ChevronLeft size={18} aria-hidden />
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
