export const paymentOutcomes = [
  "AUTHORIZED",
  "DECLINED",
  "REQUIRES_AUTHENTICATION",
  "INSUFFICIENT_FUNDS",
  "INCORRECT_CVC",
  "EXPIRED_CARD",
  "PROCESSING_ERROR"
] as const;

export type PaymentOutcome = (typeof paymentOutcomes)[number];

export type BillingRole = "customer" | "staff" | "billing_manager" | "admin";
export type BillingPurchaseType = "one_time" | "deposit" | "subscription" | "payment_plan";
export type BillingPaymentMethod = "card" | "us_bank_account";

export type ProcessorPaymentResponse = {
  status?: string | null;
  outcome?: string | null;
  decline_code?: string | null;
  code?: string | null;
  last_payment_error?: {
    code?: string | null;
    decline_code?: string | null;
    type?: string | null;
  } | null;
  id?: string | null;
  request_id?: string | null;
};

export type NormalizedPaymentOutcome = {
  outcome: PaymentOutcome;
  publicMessage: string;
  internalMessage: string;
  processorCode: string | null;
  processorTransactionId: string | null;
  processorRequestId: string | null;
  retryEligible: boolean;
};

export type HostedCheckoutRequest = {
  profileId: string;
  email: string;
  customerName: string;
  businessName: string;
  packageId: string;
  purchaseType: BillingPurchaseType;
  paymentMethods: BillingPaymentMethod[];
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
};

export type HostedCheckoutSession = {
  provider: "stripe";
  id: string;
  url: string;
  customerId: string | null;
};
