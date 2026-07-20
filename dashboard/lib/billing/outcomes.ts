import type { NormalizedPaymentOutcome, PaymentOutcome, ProcessorPaymentResponse } from "./types";

const messages: Record<PaymentOutcome, Pick<NormalizedPaymentOutcome, "publicMessage" | "internalMessage" | "retryEligible">> = {
  AUTHORIZED: {
    publicMessage: "Payment approved. Your purchase has been confirmed.",
    internalMessage: "Processor approved the payment or authorization.",
    retryEligible: false
  },
  DECLINED: {
    publicMessage: "Your payment could not be approved. Please try another payment method or contact your card issuer.",
    internalMessage: "Issuer declined the payment without a safely classifiable reason.",
    retryEligible: false
  },
  REQUIRES_AUTHENTICATION: {
    publicMessage: "Your bank requires an additional security check. Complete the verification to continue.",
    internalMessage: "Customer action is required before the processor can confirm payment.",
    retryEligible: false
  },
  INSUFFICIENT_FUNDS: {
    publicMessage: "This payment method does not have enough available funds. Please use another payment method.",
    internalMessage: "Issuer reported insufficient funds. Subscription recovery policy may schedule a controlled retry.",
    retryEligible: true
  },
  INCORRECT_CVC: {
    publicMessage: "The card security code could not be verified. Please check it and try again.",
    internalMessage: "Card security-code verification failed. No CVC value is retained.",
    retryEligible: false
  },
  EXPIRED_CARD: {
    publicMessage: "This card has expired. Please use a different payment method.",
    internalMessage: "The stored payment method requires replacement before another attempt.",
    retryEligible: false
  },
  PROCESSING_ERROR: {
    publicMessage: "We could not complete the payment because of a temporary technical issue. You have not been charged again. Please try again shortly.",
    internalMessage: "Processor response was missing, malformed, or could not be safely classified. Reconcile by idempotency key before retrying.",
    retryEligible: true
  }
};

const codeMap: Record<string, PaymentOutcome> = {
  insufficient_funds: "INSUFFICIENT_FUNDS",
  incorrect_cvc: "INCORRECT_CVC",
  expired_card: "EXPIRED_CARD",
  authentication_required: "REQUIRES_AUTHENTICATION",
  card_declined: "DECLINED",
  do_not_honor: "DECLINED",
  generic_decline: "DECLINED"
};

export function normalizePaymentOutcome(response: ProcessorPaymentResponse | null | undefined): NormalizedPaymentOutcome {
  const status = response?.status?.toLowerCase();
  const processorCode = response?.last_payment_error?.decline_code ?? response?.last_payment_error?.code ?? response?.decline_code ?? response?.code ?? null;
  let outcome: PaymentOutcome = "PROCESSING_ERROR";

  if (status === "succeeded" || status === "paid" || status === "authorized") outcome = "AUTHORIZED";
  else if (status === "requires_action" || status === "requires_confirmation" || status === "requires_source_action") outcome = "REQUIRES_AUTHENTICATION";
  else if (status === "failed" || status === "canceled" || status === "requires_payment_method") outcome = processorCode ? codeMap[processorCode.toLowerCase()] ?? "DECLINED" : "DECLINED";
  else if (processorCode) outcome = codeMap[processorCode.toLowerCase()] ?? "PROCESSING_ERROR";

  return {
    outcome,
    processorCode,
    processorTransactionId: response?.id ?? null,
    processorRequestId: response?.request_id ?? null,
    ...messages[outcome]
  };
}
