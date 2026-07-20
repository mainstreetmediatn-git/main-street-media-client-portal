import "server-only";

import { createStripeServerClient, findOrCreateStripeCustomer, getStripePackage } from "../stripe";
import type { BillingProvider } from "./provider";
import type { HostedCheckoutRequest, HostedCheckoutSession } from "./types";

export class StripeBillingProvider implements BillingProvider {
  readonly name = "stripe" as const;

  async createHostedCheckout(input: HostedCheckoutRequest): Promise<HostedCheckoutSession> {
    const billingPackage = getStripePackage(input.packageId);
    if (!billingPackage) throw new Error("The selected package is not available for billing.");

    const stripe = createStripeServerClient();
    const customer = await findOrCreateStripeCustomer(stripe, {
      profileId: input.profileId,
      customerName: input.customerName,
      businessName: input.businessName,
      email: input.email,
      leadId: input.profileId,
      selectedPackage: billingPackage.id
    });
    const recurring = input.purchaseType === "subscription" || input.purchaseType === "payment_plan";
    const session = await stripe.checkout.sessions.create(
      {
        mode: recurring ? "subscription" : "payment",
        customer: customer.id,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        billing_address_collection: "required",
        payment_method_types: input.paymentMethods,
        metadata: {
          profile_id: input.profileId,
          package_id: input.packageId,
          purchase_type: input.purchaseType
        },
        subscription_data: recurring ? { metadata: { profile_id: input.profileId, package_id: input.packageId, purchase_type: input.purchaseType } } : undefined,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: billingPackage.currency,
            product_data: { name: `Main Street Media — ${billingPackage.label}` },
            unit_amount: billingPackage.amountCents,
            ...(recurring ? { recurring: { interval: billingPackage.interval } } : {})
          }
        }]
      },
      { idempotencyKey: input.idempotencyKey }
    );

    if (!session.url) throw new Error("The payment provider did not return a hosted checkout URL.");
    return { provider: "stripe", id: session.id, url: session.url, customerId: customer.id };
  }

  async createCustomerPortal(customerId: string, returnUrl: string) {
    const session = await createStripeServerClient().billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    return session.url;
  }
}

export function getBillingProvider(): BillingProvider {
  return new StripeBillingProvider();
}
