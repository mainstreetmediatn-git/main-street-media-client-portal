"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";
import { oauthProviders, signInWithOAuth } from "../../lib/auth";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    businessName: "",
    phone: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase environment variables are missing.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          business_name: form.businessName,
          phone: form.phone
        }
      }
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: form.fullName,
          email: form.email,
          business_name: form.businessName,
          phone: form.phone,
          role: "customer"
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }

    setLoading(false);
    setSuccess("Account created. Check your email if confirmation is enabled, then log in to request your audit.");
    setTimeout(() => router.push("/login"), 1400);
  }

  async function handleOAuth(provider: Provider) {
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase environment variables are missing.");
      return;
    }

    setLoading(true);
    const { error: oauthError } = await signInWithOAuth(provider);
    setLoading(false);

    if (oauthError) setError(oauthError.message);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel wide">
        <Link className="brand brand-dark" href="/">
          <span className="brand-mark">MS</span>
          <span>
            <strong>Main Street Media Co.</strong>
            <small>Helping Great Local Businesses Become Impossible to Ignore.</small>
          </span>
        </Link>
        <div>
          <div className="eyebrow">Request access</div>
          <h1>Start your visibility audit</h1>
          <p className="muted">
            Create your portal account. Main Street Media Co. will manually assign your canonical package after
            purchase.
          </p>
        </div>
        <form className="form two-column" onSubmit={handleSubmit}>
          <label>
            Full name
            <input required value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
          </label>
          <label>
            Business name
            <input required value={form.businessName} onChange={(event) => updateField("businessName", event.target.value)} />
          </label>
          <label>
            Email
            <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label className="full-span">
            Password
            <input required minLength={8} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          </label>
          {error ? <p className="form-error full-span">{error}</p> : null}
          {success ? <p className="form-success full-span">{success}</p> : null}
          <button className="button button-large full-span" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"} <ArrowRight size={18} aria-hidden />
          </button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <div className="oauth-actions">
          {oauthProviders.map((provider) => (
            <button
              className="button button-secondary button-large"
              disabled={loading}
              key={provider.id}
              onClick={() => handleOAuth(provider.id)}
              type="button"
            >
              Continue with {provider.label}
            </button>
          ))}
        </div>
        <p className="muted">
          Already have an account? <Link className="inline-link" href="/login">Log in.</Link>
        </p>
      </section>
    </main>
  );
}
