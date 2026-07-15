import { readFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { Shell } from "../../../components/Shell";
import { createServerSupabase } from "../../../lib/serverSupabase";
import { callSheetSections, packageWorkflowCards } from "../../../lib/workflowArtifacts";

export const dynamic = "force-dynamic";

export default async function CallSheetPage() {
  const supabase = await createServerSupabase();

  if (!supabase) {
    redirect("/login");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    redirect("/login?next=/internal/call-sheet");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const callSheetPath = path.join(process.cwd(), "internal", "main-street-media-call-sheet.html");
  const callSheetHtml = await readFile(callSheetPath, "utf8");

  return (
    <Shell isAdmin>
      <div className="header narrow-header">
        <div>
          <div className="eyebrow">Internal</div>
          <h1>Main Street Media call sheet</h1>
          <p className="muted">
            This surface is server-protected and rendered only for authenticated admins. The embedded HTML keeps the
            operator briefing separate from the public dashboard and documents canonical package ids first.
          </p>
        </div>
      </div>

      <section className="grid call-sheet-summary">
        {packageWorkflowCards.map((pkg) => (
          <article className="card" key={pkg.id}>
            <div className="eyebrow">{pkg.id}</div>
            <h2>{pkg.label}</h2>
            <p className="muted">{pkg.description}</p>
            <p className="muted">Aliases: {pkg.aliases.join(", ")}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="section-heading premium-heading">
          <div>
            <div className="eyebrow">Workflow notes</div>
            <h2>Canonical package routing and handoff rules.</h2>
          </div>
        </div>

        <div className="call-sheet-notes">
          {callSheetSections.map((section) => (
            <article className="card" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading premium-heading">
          <div>
            <div className="eyebrow">Source artifact</div>
            <h2>Embedded call sheet HTML.</h2>
          </div>
        </div>
        <div className="card call-sheet-frame-card">
          <iframe
            className="call-sheet-frame"
            srcDoc={callSheetHtml}
            title="Main Street Media call sheet"
            sandbox=""
          />
        </div>
      </section>
    </Shell>
  );
}
