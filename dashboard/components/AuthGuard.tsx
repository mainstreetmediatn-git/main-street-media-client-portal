"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Profile } from "../lib/portal";

type AuthState = {
  user: User;
  profile: Profile | null;
};

export function AuthGuard({
  children,
  requireAdmin = false
}: {
  children: (state: AuthState) => ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (requireAdmin && profile?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setState({ user, profile: (profile as Profile | null) ?? null });
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace("/login");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [requireAdmin, router]);

  if (loading) {
    return (
      <div className="center-screen">
        <div className="loading-card">
          <div className="eyebrow">Main Street Media Co.</div>
          <h1>Loading your portal</h1>
          <p className="muted">Preparing your local visibility dashboard.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-screen">
        <div className="loading-card">
          <div className="eyebrow">Configuration</div>
          <h1>Portal setup needed</h1>
          <p className="muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!state) return null;
  return <>{children(state)}</>;
}

