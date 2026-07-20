import type { HostedCheckoutRequest, HostedCheckoutSession } from "./types";

export interface BillingProvider {
  readonly name: "stripe";
  createHostedCheckout(input: HostedCheckoutRequest): Promise<HostedCheckoutSession>;
  createCustomerPortal(customerId: string, returnUrl: string): Promise<string>;
}
