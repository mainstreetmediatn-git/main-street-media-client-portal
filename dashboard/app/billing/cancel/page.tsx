import Link from "next/link";
import { ChevronLeft, CircleX } from "lucide-react";

export default function CancelPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="eyebrow">Billing</div>
        <h1>Checkout canceled</h1>
        <div className="success-panel billing-cancel-panel">
          <CircleX size={40} aria-hidden />
          <p>No payment was captured. You can return to billing and restart checkout at any time.</p>
        </div>
        <Link className="button button-large" href="/billing">
          <ChevronLeft size={18} aria-hidden />
          Back to billing
        </Link>
      </section>
    </main>
  );
}
