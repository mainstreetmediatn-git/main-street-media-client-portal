import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../lib/serverSupabase";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { getBillingProvider } from "../../../../lib/billing/stripeProvider";
import type { BillingPaymentMethod, BillingPurchaseType } from "../../../../lib/billing/types";
import { normalizePackageType } from "../../../../../shared/packageCatalog";

const purchaseTypes = new Set<BillingPurchaseType>(["one_time", "deposit", "subscription", "payment_plan"]);
const paymentMethods = new Set<BillingPaymentMethod>(["card", "us_bank_account"]);

export async function POST(request: Request) {
  try {
    const auth = await createServerSupabase();
    const { data: userData } = await auth?.auth.getUser() ?? { data: { user: null } };
    if (!userData.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json().catch(() => null) as { packageId?: string; purchaseType?: BillingPurchaseType; paymentMethods?: BillingPaymentMethod[] } | null;
    const packageId = normalizePackageType(body?.packageId ?? null);
    const purchaseType = body?.purchaseType ?? "subscription";
    const methods = body?.paymentMethods?.filter((method) => paymentMethods.has(method)) ?? ["card"];
    if (!packageId || !purchaseTypes.has(purchaseType) || methods.length === 0) {
      return NextResponse.json({ error: "Select a valid package and payment option." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.from("profiles").select("email,full_name,business_name").eq("id", userData.user.id).maybeSingle();
    const email = profile?.email || userData.user.email;
    if (!email || !profile?.full_name || !profile.business_name) {
      return NextResponse.json({ error: "Update your account name and business name before checkout." }, { status: 400 });
    }

    const idempotencyKey = crypto.randomUUID();
    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const session = await getBillingProvider().createHostedCheckout({
      profileId: userData.user.id,
      email,
      customerName: profile.full_name,
      businessName: profile.business_name,
      packageId,
      purchaseType,
      paymentMethods: methods,
      successUrl: new URL("/billing/success?session_id={CHECKOUT_SESSION_ID}", origin).toString(),
      cancelUrl: new URL("/billing/cancel", origin).toString(),
      idempotencyKey
    });
    await admin.from("billing_audit_logs").insert({ profile_id: userData.user.id, action: "hosted_checkout_created", resource_type: "checkout", request_id: idempotencyKey, metadata: { provider: session.provider, purchase_type: purchaseType, package_id: packageId } });
    return NextResponse.json({ checkoutUrl: session.url });
  } catch {
    return NextResponse.json({ error: "We could not start secure checkout. Please try again shortly." }, { status: 503 });
  }
}
