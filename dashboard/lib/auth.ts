"use client";

import type { Provider } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const oauthProviders: Array<{ id: Provider; label: string }> = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" }
];

export function getDashboardRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/dashboard`;
}

export async function signInWithOAuth(provider: Provider) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getDashboardRedirectUrl()
    }
  });
}
