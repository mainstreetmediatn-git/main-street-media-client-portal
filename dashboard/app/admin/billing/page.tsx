import { redirect } from "next/navigation";
import { Shell } from "../../../components/Shell";
import { createServerSupabase } from "../../../lib/serverSupabase";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

type PaymentRow = {
  id: string;
  outcome: string;
  status: string;
  amount_cents: number;
  currency: string;
  provider_payment_id: string | null;
  authorization_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; business_name: string | null; email: string | null } | null;
};

export default async function AdminBillingPage() {
  const auth = await createServerSupabase();
  const { data: userData } = await auth?.auth.getUser() ?? { data: { user: null } };
  if (!userData.user) redirect("/login");

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (!profile || !["staff", "billing_manager", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: payments } = await admin
    .from("billing_payments")
    .select("id,outcome,status,amount_cents,currency,provider_payment_id,authorization_at,created_at,profiles(full_name,business_name,email)")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (payments ?? []) as unknown as PaymentRow[];
  const authorizedTotal = rows.filter((row) => row.outcome === "AUTHORIZED").reduce((total, row) => total + row.amount_cents, 0);

  return (
    <Shell isAdmin>
      <div className="header">
        <div>
          <div className="eyebrow">Internal billing</div>
          <h1>MAIN STREET MEDIA BILLING ENGINE</h1>
          <p className="muted">Authorized staff view. Processor codes and reconciliation records remain restricted to the billing ledger.</p>
        </div>
      </div>
      <section className="grid">
        <article className="card"><h2>Authorized volume</h2><p className="metric">${(authorizedTotal / 100).toFixed(2)}</p></article>
        <article className="card"><h2>Recent payments</h2><p className="metric">{rows.length}</p></article>
        <article className="card"><h2>Recovery queue</h2><p className="metric">{rows.filter((row) => ["INSUFFICIENT_FUNDS", "PROCESSING_ERROR"].includes(row.outcome)).length}</p></article>
      </section>
      <section className="section card">
        <h2>Payment activity</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Outcome</th><th>Customer</th><th>Package payment</th><th>Authorization reference</th><th>Time</th></tr></thead>
            <tbody>
              {rows.map((row) => <tr key={row.id}>
                <td><span className={`status-pill ${row.outcome === "AUTHORIZED" ? "success" : ""}`}>{row.outcome}</span></td>
                <td>{row.profiles?.business_name || row.profiles?.full_name || row.profiles?.email || "Unknown"}</td>
                <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency.toUpperCase() }).format(row.amount_cents / 100)}</td>
                <td>{row.provider_payment_id || "Pending"}</td>
                <td>{new Date(row.authorization_at || row.created_at).toLocaleString()}</td>
              </tr>)}
              {!rows.length ? <tr><td colSpan={5}>No billing ledger entries yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
