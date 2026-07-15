import "server-only";

import Stripe from "stripe";
import { canonicalPackageIds, getPackageDefinition, normalizePackageType, type CanonicalPackageId } from "../../shared/packageCatalog";
import { getStripeServerConfig, requireEnv } from "./env";

export type StripeBillingPackage = {
  id: CanonicalPackageId;
  label: string;
  description: string;
  amountCents: number;
  currency: "usd";
  interval: "month";
};

export type CheckoutIdentity = {
  profileId: string;
  customerName: string;
  businessName: string;
  email: string;
  leadId: string;
  selectedPackage: CanonicalPackageId;
};

export const stripeBillingPackages: Record<CanonicalPackageId, StripeBillingPackage> = {
  core: {
    id: "core",
    label: "Core",
    description: getPackageDefinition("core")?.description ?? "Core visibility package",
    amountCents: 19700,
    currency: "usd",
    interval: "month"
  },
  elite: {
    id: "elite",
    label: "Elite",
    description: getPackageDefinition("elite")?.description ?? "Elite growth package",
    amountCents: 29700,
    currency: "usd",
    interval: "month"
  },
  agent_workflow_24_7: {
    id: "agent_workflow_24_7",
    label: "Agent Workflow 24/7",
    description: getPackageDefinition("agent_workflow_24_7")?.description ?? "Agent workflow package",
    amountCents: 39700,
    currency: "usd",
    interval: "month"
  }
};

export function getStripePublicKey() {
  return requireEnv("STRIPE_PUBLISHABLE_KEY");
}

export function createStripeServerClient() {
  return new Stripe(getStripeServerConfig().secretKey);
}

export function normalizeStripePackageId(packageId: string | null | undefined): CanonicalPackageId | null {
  return normalizePackageType(packageId ?? null);
}

export function getStripePackage(packageId: string | null | undefined) {
  const normalized = normalizeStripePackageId(packageId);
  return normalized ? stripeBillingPackages[normalized] : null;
}

export function buildCheckoutIdempotencyKey(identity: CheckoutIdentity) {
  return [identity.profileId, identity.leadId, identity.selectedPackage, identity.email.toLowerCase()].join(":");
}

export function buildCheckoutMetadata(identity: CheckoutIdentity) {
  return {
    profile_id: identity.profileId,
    customer_name: identity.customerName,
    business_name: identity.businessName,
    selected_package: identity.selectedPackage,
    lead_id: identity.leadId
  };
}

function escapeStripeSearchValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

async function findCustomerBySearch(stripe: Stripe, query: string) {
  try {
    const result = await stripe.customers.search({
      query,
      limit: 1
    });

    return result.data[0] ?? null;
  } catch {
    return null;
  }
}

export async function findOrCreateStripeCustomer(
  stripe: Stripe,
  identity: CheckoutIdentity,
  existingCustomerId?: string | null
) {
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!("deleted" in customer && customer.deleted)) {
        return customer as Stripe.Customer;
      }
    } catch {
      // Fall through to metadata/email lookup.
    }
  }

  const metadata = buildCheckoutMetadata(identity);
  const searchQueries = [
    `metadata['profile_id']:'${escapeStripeSearchValue(identity.profileId)}'`,
    `metadata['lead_id']:'${escapeStripeSearchValue(identity.leadId)}'`,
    `email:'${escapeStripeSearchValue(identity.email)}'`
  ];

  for (const query of searchQueries) {
    const customer = await findCustomerBySearch(stripe, query);
    if (customer) {
      return customer as Stripe.Customer;
    }
  }

  const listResult = await stripe.customers.list({
    email: identity.email,
    limit: 10
  });

  const reusableCustomer = listResult.data.find((customer) => {
    const profileMatch = customer.metadata?.profile_id === identity.profileId;
    const leadMatch = customer.metadata?.lead_id === identity.leadId;
    return profileMatch || leadMatch;
  });

  if (reusableCustomer) {
    return reusableCustomer as Stripe.Customer;
  }

  return (await stripe.customers.create({
    email: identity.email,
    name: identity.customerName || undefined,
    metadata: {
      ...metadata
    }
  })) as Stripe.Customer;
}

export function assertStripePackageId(packageId: string | null | undefined): asserts packageId is CanonicalPackageId {
  if (!packageId || !canonicalPackageIds.includes(packageId as CanonicalPackageId)) {
    throw new Error("Unsupported package selection.");
  }
}
