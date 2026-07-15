import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/serverSupabase";
import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";
import { getStripePublicKey } from "../../lib/stripe";
import { BillingClient } from "./BillingClient";

export default async function BillingPage() {
  let stripePublishableKey = "";

  try {
    stripePublishableKey = getStripePublicKey();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe billing is unavailable.";
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="eyebrow">Billing</div>
          <h1>Billing setup needed</h1>
          <p className="muted">{message}</p>
        </section>
      </main>
    );
  }

  const serverSupabase = await createServerSupabase();

  if (!serverSupabase) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="eyebrow">Billing</div>
          <h1>Stripe is not configured</h1>
          <p className="muted">
            Set STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and SUPABASE_SERVICE_ROLE_KEY.
          </p>
        </section>
      </main>
    );
  }

  const { data: sessionData } = await serverSupabase.auth.getUser();
  const user = sessionData.user;
  if (!user) {
    redirect("/login");
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let profileError: string | null = null;
  let profile: {
    email?: string | null;
    full_name?: string | null;
    business_name?: string | null;
    stripe_lead_id?: string | null;
    selected_package?: string | null;
    package_type?: string | null;
    payment_status?: string | null;
    customer_status?: string | null;
    role?: string | null;
  } | null = null;

  try {
    const result = await supabaseAdmin.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (result.error) {
      profileError = result.error.message;
    } else {
      profile = result.data;
    }
  } catch (error) {
    profileError = error instanceof Error ? error.message : "Stripe billing is unavailable.";
  }

  if (profileError) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="eyebrow">Billing</div>
          <h1>Billing setup needed</h1>
          <p className="muted">{profileError}</p>
        </section>
      </main>
    );
  }

  return (
    <BillingClient
      stripePublishableKey={stripePublishableKey}
      userId={user.id}
      userEmail={(profile?.email || user.email || "").trim()}
      customerName={(profile?.full_name || "").trim()}
      businessName={(profile?.business_name || "").trim()}
      leadId={(profile?.stripe_lead_id || "").trim()}
      currentPackage={(profile?.selected_package || profile?.package_type || null) as string | null}
      paymentStatus={(profile?.payment_status || null) as string | null}
      customerStatus={(profile?.customer_status || null) as string | null}
      isAdmin={profile?.role === "admin"}
    />
  );
}
