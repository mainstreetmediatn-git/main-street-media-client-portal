import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../lib/serverSupabase";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import {
  assertStripePackageId,
  buildCheckoutIdempotencyKey,
  buildCheckoutMetadata,
  createStripeServerClient,
  findOrCreateStripeCustomer,
  getStripePackage
} from "../../../../lib/stripe";
import { normalizePackageType } from "../../../../../shared/packageCatalog";

export async function POST(request: Request) {
  try {
    const serverSupabase = await createServerSupabase();
    if (!serverSupabase) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const { data: userData, error: userError } = await serverSupabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | {
          packageId?: string;
          customerName?: string;
          businessName?: string;
          leadId?: string;
        }
      | null;

    const packageId = normalizePackageType(body?.packageId ?? null);
    if (!packageId) {
      return NextResponse.json({ error: "Select a valid package before checkout." }, { status: 400 });
    }

    assertStripePackageId(packageId);
    const billingPackage = getStripePackage(packageId);
    if (!billingPackage) {
      return NextResponse.json({ error: "Selected package is not available for billing." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const { data: latestAuditRequest } = await supabaseAdmin
      .from("audit_requests")
      .select("id")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const identity = {
      profileId: userData.user.id,
      customerName: (body?.customerName || profile.full_name || userData.user.user_metadata?.full_name || "").trim(),
      businessName: (body?.businessName || profile.business_name || userData.user.user_metadata?.business_name || "").trim(),
      email: (profile.email || userData.user.email || "").trim(),
      leadId: (body?.leadId || latestAuditRequest?.id || userData.user.id).trim(),
      selectedPackage: packageId
    };

    if (!identity.email || !identity.customerName || !identity.businessName) {
      return NextResponse.json(
        { error: "Customer name, business name, and email are required before checkout." },
        { status: 400 }
      );
    }

    const stripe = createStripeServerClient();
    const existingCustomer = await findOrCreateStripeCustomer(stripe, identity, profile.stripe_customer_id);
    const checkoutKey = buildCheckoutIdempotencyKey(identity);
    const metadata = buildCheckoutMetadata(identity);
    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const successUrl = new URL("/billing/success?session_id={CHECKOUT_SESSION_ID}", origin).toString();
    const cancelUrl = new URL("/billing/cancel?session_id={CHECKOUT_SESSION_ID}", origin).toString();

    const existingBillingEvent = await supabaseAdmin
      .from("billing_events")
      .select("id,stripe_checkout_session_id,payment_status")
      .eq("checkout_idempotency_key", checkoutKey)
      .maybeSingle();

    if (existingBillingEvent.data?.stripe_checkout_session_id) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(existingBillingEvent.data.stripe_checkout_session_id);
        if (existingSession.status === "open") {
          return NextResponse.json({
            sessionId: existingSession.id,
            sessionUrl: existingSession.url
          });
        }
      } catch {
        // Create a fresh checkout session below if the previous one cannot be reused.
      }
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        customer: existingCustomer.id,
        client_reference_id: identity.profileId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        billing_address_collection: "required",
        allow_promotion_codes: false,
        automatic_tax: {
          enabled: false
        },
        metadata,
        subscription_data: {
          metadata
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: billingPackage.currency,
              product_data: {
                name: `${billingPackage.label} Package`,
                description: billingPackage.description,
                metadata: {
                  selected_package: billingPackage.id
                }
              },
              recurring: {
                interval: billingPackage.interval
              },
              unit_amount: billingPackage.amountCents
            }
          }
        ]
      },
      {
        idempotencyKey: checkoutKey
      }
    );

    const persistedPayload = {
      profile_id: identity.profileId,
      customer_name: identity.customerName,
      business_name: identity.businessName,
      selected_package: identity.selectedPackage,
      lead_id: identity.leadId,
      stripe_customer_id: existingCustomer.id,
      stripe_checkout_session_id: session.id,
      amount_cents: billingPackage.amountCents,
      currency: billingPackage.currency,
      payment_status: "pending"
    };

    await supabaseAdmin.from("billing_events").upsert(
      {
        checkout_idempotency_key: checkoutKey,
        profile_id: identity.profileId,
        lead_id: identity.leadId,
        selected_package: identity.selectedPackage,
        customer_name: identity.customerName,
        business_name: identity.businessName,
        customer_email: identity.email,
        stripe_customer_id: existingCustomer.id,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: null,
        stripe_subscription_id: null,
        amount_cents: billingPackage.amountCents,
        currency: billingPackage.currency,
        payment_status: "pending",
        payload: persistedPayload
      },
      { onConflict: "checkout_idempotency_key" }
    );

    return NextResponse.json({ sessionId: session.id, sessionUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Stripe checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
