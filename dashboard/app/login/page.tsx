"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase environment variables are missing.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand brand-dark" href="/">
          <span className="brand-mark">MS</span>
          <span>
            <strong>Main Street Media Co.</strong>
            <small>Impossible to Ignore</small>
          </span>
        </Link>
        <div>
          <div className="eyebrow">Customer login</div>
          <h1>Your Local Visibility Dashboard</h1>
          <p className="muted">See where your business stands and what to fix next.</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button button-large" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"} <ArrowRight size={18} aria-hidden />
          </button>
        </form>
        <p className="muted">
          Need access? <Link className="inline-link" href="/signup">Request your visibility audit.</Link>
        </p>
      </section>
    </main>
  );
}

