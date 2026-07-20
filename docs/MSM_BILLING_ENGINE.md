# MAIN STREET MEDIA BILLING ENGINE

The billing engine owns the MSM customer experience while using an approved payment processor only for hosted payment collection, tokenization, authentication, and settlement.

## Security boundary

- Never accept a card number, CVC/CVV, PIN, magnetic-stripe data, bank-login credential, or hosted-field payload in an MSM API route.
- Use the processor-hosted checkout and customer portal URLs returned by `POST /api/billing/checkout` and `POST /api/billing/portal`.
- Configure Stripe to deliver signed events to `POST /api/billing/webhook/stripe`. The previous `/api/stripe/webhook` route is a compatibility alias to the same protected handler.
- Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and Supabase variables only in server-side environment configuration. Do not create `NEXT_PUBLIC_` versions of secret values.
- The webhook stores only normalized outcomes and safe processor identifiers. It never stores a raw processor event or raw payment credentials.

## Required provider events

Subscribe the production endpoint to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`. The endpoint verifies the signature from the unmodified request body before it writes any ledger or CRM data.

## Payment lifecycle

1. The authenticated customer begins an MSM-branded checkout. The server creates an idempotent hosted checkout session.
2. The processor collects card or optional ACH details and handles any 3DS challenge.
3. A signed webhook normalizes the processor response to one of the seven MSM outcomes.
4. `AUTHORIZED` creates a receipt, updates the invoice/payment ledger, and idempotently activates the customer package and CRM state.
5. Failures remain unfulfilled. `PROCESSING_ERROR` is marked for reconciliation before any retry; `INSUFFICIENT_FUNDS` is eligible only for the processor's approved subscription-recovery schedule; card-security and expired-card outcomes require a new hosted payment-method entry.

## Roles and access

- `customer` can read only their invoices, safe payment status, receipts, subscriptions, payment plans, and refunds.
- `staff`, `billing_manager`, and `admin` can view the MSM billing dashboard.
- Processor codes, request IDs, retry dates, and reconciliation notes live in `billing_payment_attempts`, which is visible only to billing staff.
- Server routes use the Supabase service role only after authenticating the user or verifying the signed webhook.

## Deployment order

1. Review and apply `supabase/migrations/20260720063016_msm_billing_engine.sql` to the intended Supabase project.
2. Add the server-only variables to the hosting provider.
3. Create the Stripe webhook endpoint and copy its signing secret to `STRIPE_WEBHOOK_SECRET`.
4. Configure the processor's subscription retry schedule; do not add an MSM card-retry loop.
5. Run a processor test-mode payment and confirm one payment, one receipt, one fulfillment, and one audit record are created.
