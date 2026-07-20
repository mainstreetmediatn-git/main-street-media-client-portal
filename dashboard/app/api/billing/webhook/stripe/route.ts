import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "../../../../../lib/supabaseAdmin";
import { fulfillAuthorizedPayment } from "../../../../../lib/billing/fulfillment";
import { normalizePaymentOutcome } from "../../../../../lib/billing/outcomes";
import { createStripeServerClient } from "../../../../../lib/stripe";
import { getStripeServerConfig } from "../../../../../lib/env";

export const runtime = "nodejs";

function getId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

export async function POST(request: Request) {
  let event: Stripe.Event;
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
    event = createStripeServerClient().webhooks.constructEvent(await request.text(), signature, getStripeServerConfig().webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  try {
    if (!event.type.startsWith("checkout.session.")) return NextResponse.json({ received: true });
    const session = event.data.object as Stripe.Checkout.Session;
    const profileId = session.client_reference_id || session.metadata?.profile_id;
    const packageId = session.metadata?.package_id;
    if (!profileId || !packageId) return NextResponse.json({ error: "Checkout is missing MSM references." }, { status: 400 });

    const paymentId = getId(session.payment_intent) || `checkout:${session.id}`;
    let processorResponse: { status?: string; id?: string; request_id?: string; last_payment_error?: { code?: string | null; decline_code?: string | null } | null } = {
      status: event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded" ? "succeeded" : "failed",
      id: paymentId
    };
    if (getId(session.payment_intent)) {
      const intent = await createStripeServerClient().paymentIntents.retrieve(getId(session.payment_intent)!);
      processorResponse = {
        status: intent.status,
        id: intent.id,
        request_id: intent.lastResponse?.requestId,
        last_payment_error: intent.last_payment_error ? { code: intent.last_payment_error.code, decline_code: intent.last_payment_error.decline_code } : null
      };
    }
    const normalized = normalizePaymentOutcome(processorResponse);
    const admin = createSupabaseAdminClient();
    const amountCents = session.amount_total ?? 0;
    const paymentStatus = normalized.outcome === "AUTHORIZED" ? "paid" : normalized.outcome === "REQUIRES_AUTHENTICATION" ? "pending" : "failed";
    const { data: payment, error: paymentError } = await admin
      .from("billing_payments")
      .upsert(
        {
          profile_id: profileId,
          provider: "stripe",
          provider_payment_id: paymentId,
          idempotency_key: `stripe:${paymentId}`,
          purchase_type: session.metadata?.purchase_type || "subscription",
          payment_method_type: session.payment_method_types?.includes("us_bank_account") ? "us_bank_account" : "card",
          outcome: normalized.outcome,
          status: paymentStatus,
          amount_cents: amountCents,
          currency: session.currency || "usd",
          authorization_at: normalized.outcome === "AUTHORIZED" ? new Date().toISOString() : null,
          captured_at: normalized.outcome === "AUTHORIZED" ? new Date().toISOString() : null,
          public_message: normalized.publicMessage
        },
        { onConflict: "provider_payment_id" }
      )
      .select("id")
      .single();
    if (paymentError || !payment) throw paymentError || new Error("Payment ledger record was not created.");

    await admin.from("billing_payment_attempts").upsert(
      {
        payment_id: payment.id,
        provider_event_id: event.id,
        processor_code: normalized.processorCode,
        processor_request_id: normalized.processorRequestId,
        internal_message: normalized.internalMessage,
        reconciliation_status: normalized.outcome === "PROCESSING_ERROR" ? "pending" : "confirmed"
      },
      { onConflict: "provider_event_id" }
    );

    if (normalized.outcome === "AUTHORIZED") {
      await admin.from("billing_receipts").upsert(
        { profile_id: profileId, payment_id: payment.id, receipt_number: `MSM-${payment.id.slice(-8).toUpperCase()}`, amount_cents: amountCents, currency: session.currency || "usd" },
        { onConflict: "payment_id" }
      );
      await fulfillAuthorizedPayment({ supabase: admin, paymentId: payment.id, profileId, packageId, amountCents, currency: session.currency || "usd", providerPaymentId: getId(session.payment_intent) });
    }

    await admin.from("billing_audit_logs").insert({ profile_id: profileId, action: "payment_outcome_recorded", resource_type: "billing_payment", resource_id: payment.id, request_id: event.id, metadata: { outcome: normalized.outcome, provider: "stripe" } });
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed; reconciliation is required." }, { status: 500 });
  }
}
