import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { createStripeServerClient } from "../../../../lib/stripe";
import { getStripeServerConfig } from "../../../../lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let event: Stripe.Event;

    try {
      const stripe = createStripeServerClient();
      const webhookSecret = getStripeServerConfig().webhookSecret;
      const signature = request.headers.get("stripe-signature");
      const rawBody = await request.text();

      if (!signature) {
        return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
      }

      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook verification failed.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const profileId = session.client_reference_id || session.metadata?.profile_id || null;
      const leadId = session.metadata?.lead_id || null;
      const selectedPackage = session.metadata?.selected_package || null;
      const customerName = session.metadata?.customer_name || session.customer_details?.name || null;
      const businessName = session.metadata?.business_name || null;
      const checkoutSessionId = session.id;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const amountCents = session.amount_total ?? null;
      const currency = session.currency ?? "usd";

      if (!profileId) {
        return NextResponse.json({ error: "Checkout session is missing a profile reference." }, { status: 400 });
      }

      const { data: existingBillingEvent } = await supabaseAdmin
        .from("billing_events")
        .select("id")
        .eq("stripe_event_id", event.id)
        .maybeSingle();

      const { data: billingEventRow, error: billingEventError } = existingBillingEvent
        ? await supabaseAdmin
            .from("billing_events")
            .update({
              stripe_event_id: event.id,
              stripe_event_type: event.type,
              stripe_customer_id: customerId,
              stripe_checkout_session_id: checkoutSessionId,
              stripe_payment_intent_id: paymentIntentId,
              stripe_subscription_id: subscriptionId,
              selected_package: selectedPackage,
              lead_id: leadId,
              amount_cents: amountCents,
              currency,
              payment_status: "paid",
              payload: event,
              processed_at: new Date().toISOString()
            })
            .eq("stripe_event_id", event.id)
            .select("id")
            .maybeSingle()
        : await supabaseAdmin
            .from("billing_events")
            .insert({
              profile_id: profileId,
              stripe_event_id: event.id,
              stripe_event_type: event.type,
              stripe_customer_id: customerId,
              stripe_checkout_session_id: checkoutSessionId,
              stripe_payment_intent_id: paymentIntentId,
              stripe_subscription_id: subscriptionId,
              selected_package: selectedPackage,
              lead_id: leadId,
              amount_cents: amountCents,
              currency,
              payment_status: "paid",
              payload: event,
              processed_at: new Date().toISOString()
            })
            .select("id")
            .maybeSingle();

      if (billingEventError) {
        return NextResponse.json({ error: billingEventError.message }, { status: 500 });
      }

      await supabaseAdmin
        .from("profiles")
        .update({
          customer_status: "Paid",
          payment_status: "paid",
          selected_package: selectedPackage,
          payment_amount_cents: amountCents,
          payment_currency: currency,
          stripe_customer_id: customerId,
          stripe_checkout_session_id: checkoutSessionId,
          stripe_payment_intent_id: paymentIntentId,
          stripe_subscription_id: subscriptionId,
          stripe_lead_id: leadId,
          paid_at: new Date().toISOString(),
          payment_synced_at: new Date().toISOString()
        })
        .eq("id", profileId);

      await supabaseAdmin.from("customer_follow_ups").upsert(
        {
          profile_id: profileId,
          billing_event_id: billingEventRow?.id ?? null,
          lead_id: leadId,
          customer_name: customerName,
          business_name: businessName,
          selected_package: selectedPackage,
          email: session.customer_details?.email || null,
          status: "queued",
          trigger_source: event.type,
          workflow_name: "paid_customer_follow_up",
          payload: event
        },
        {
          onConflict: "profile_id,lead_id,workflow_name"
        }
      );
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const profileId = session.client_reference_id || session.metadata?.profile_id || null;

      await supabaseAdmin
        .from("billing_events")
        .upsert(
          {
            profile_id: profileId,
            stripe_event_id: event.id,
            stripe_event_type: event.type,
            stripe_checkout_session_id: session.id,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
            selected_package: session.metadata?.selected_package || null,
            lead_id: session.metadata?.lead_id || null,
            amount_cents: session.amount_total ?? null,
            currency: session.currency ?? "usd",
            payment_status: "failed",
            payload: event,
            processed_at: new Date().toISOString()
          },
          { onConflict: "stripe_event_id" }
        )
        .select("id");

      if (profileId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            payment_status: "failed",
            payment_synced_at: new Date().toISOString()
          })
          .eq("id", profileId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
