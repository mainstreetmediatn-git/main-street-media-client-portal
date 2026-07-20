// Backwards-compatible endpoint. Update the Stripe Dashboard to use
// /api/billing/webhook/stripe; both paths execute the same signed, redacted flow.
export { POST } from "../../billing/webhook/stripe/route";
export const runtime = "nodejs";
