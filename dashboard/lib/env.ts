import "server-only";

export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable ${name}. Set it in dashboard/.env.local and in the production environment.`);
  }

  return value;
}

export function getStripeServerConfig() {
  return {
    publishableKey: requireEnv("STRIPE_PUBLISHABLE_KEY"),
    secretKey: requireEnv("STRIPE_SECRET_KEY"),
    webhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET")
  };
}

export function getSupabaseServerConfig() {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  };
}
