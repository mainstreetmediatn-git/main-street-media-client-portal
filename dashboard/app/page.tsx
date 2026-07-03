import Link from "next/link";
import { ArrowRight, BarChart3, FileText, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link className="brand brand-dark" href="/">
          <span className="brand-mark">MS</span>
          <span>
            <strong>Main Street Media Co.</strong>
            <small>Helping Great Local Businesses Become Impossible to Ignore.</small>
          </span>
        </Link>
        <div className="landing-actions">
          <Link className="text-link" href="/login">Log in</Link>
          <Link className="button" href="/signup">Request audit</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Local visibility portal</div>
          <h1>Main Street Media Co.</h1>
          <p>
            A premium client portal for local businesses to request visibility audits, review assigned reports,
            and understand what to fix next.
          </p>
          <div className="button-row">
            <Link className="button button-large" href="/signup">
              Request your audit <ArrowRight size={18} aria-hidden />
            </Link>
            <Link className="button button-secondary button-large" href="/login">Customer login</Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="Portal preview">
          <div className="preview-header">
            <span>Your Local Visibility Dashboard</span>
            <span className="status-pill">Paid Pilot V1</span>
          </div>
          <div className="preview-grid">
            <div><strong>Audit status</strong><span>Pending review</span></div>
            <div><strong>Package</strong><span>$297 Growth</span></div>
            <div><strong>Reports</strong><span>5 assigned</span></div>
          </div>
          <div className="preview-list">
            <span><ShieldCheck size={17} /> Visibility Audit</span>
            <span><BarChart3 size={17} /> Google Business Profile Report</span>
            <span><FileText size={17} /> Website / Conversion Report</span>
          </div>
        </div>
      </section>

      <section className="feature-band">
        <article>
          <h2>Built for real customer value</h2>
          <p>Customers can request audits, see assigned reports, and understand package access without choosing packages inside the app.</p>
        </article>
        <article>
          <h2>Secure by default</h2>
          <p>Supabase Auth, user-owned queries, package gating, and RLS-ready SQL keep customer data separated.</p>
        </article>
        <article>
          <h2>Ready to grow</h2>
          <p>The structure supports admin management, Stripe, automated audits, notifications, and the future Growth OS.</p>
        </article>
      </section>
    </main>
  );
}

