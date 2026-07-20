import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function fulfillAuthorizedPayment(input: {
  supabase: SupabaseClient;
  paymentId: string;
  profileId: string;
  packageId: string;
  amountCents: number;
  currency: string;
  providerPaymentId: string | null;
}) {
  const { error: fulfillmentError } = await input.supabase.from("billing_fulfillments").upsert(
    {
      payment_id: input.paymentId,
      profile_id: input.profileId,
      package_id: input.packageId,
      crm_status: "activated",
      activated_at: new Date().toISOString()
    },
    { onConflict: "payment_id", ignoreDuplicates: true }
  );
  if (fulfillmentError) throw fulfillmentError;

  const now = new Date().toISOString();
  const { error: profileError } = await input.supabase
    .from("profiles")
    .update({
      customer_status: "Paid",
      payment_status: "paid",
      selected_package: input.packageId,
      payment_amount_cents: input.amountCents,
      payment_currency: input.currency,
      stripe_payment_intent_id: input.providerPaymentId,
      paid_at: now,
      payment_synced_at: now
    })
    .eq("id", input.profileId);
  if (profileError) throw profileError;

  await input.supabase.from("billing_audit_logs").insert({
    profile_id: input.profileId,
    action: "service_activated",
    resource_type: "billing_payment",
    resource_id: input.paymentId,
    metadata: { package_id: input.packageId }
  });
}
