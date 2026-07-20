import "server-only";

import { createServerSupabase } from "./serverSupabase";

export async function requireFirecrawlUser() {
  const supabase = await createServerSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase.auth.getUser();
  return !error && Boolean(data.user);
}
