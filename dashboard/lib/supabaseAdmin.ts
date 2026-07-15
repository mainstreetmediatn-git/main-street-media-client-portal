import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerConfig } from "./env";

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServerConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
