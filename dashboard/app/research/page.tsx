"use client";

import { FormEvent, useState } from "react";
import { BookOpenText, ExternalLink, LoaderCircle, Radar } from "lucide-react";
import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";

type Result = { title?: string; url?: string; description?: string; markdown?: string; metadata?: { title?: string; description?: string } };
type State = "idle" | "loading" | "success" | "empty" | "timeout" | "rate_limit" | "failure" | "unavailable";

export default function ResearchPage() {
  return <AuthGuard>{({ profile }) => <ResearchContent isAdmin={profile?.role === "admin"} />}</AuthGuard>;
}

function ResearchContent({ isAdmin }: { isAdmin: boolean }) {
  const [topic, setTopic] = useState("");
  const [website, setWebsite] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [websiteSummary, setWebsiteSummary] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("Enter a market question and optionally a public business website.");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!topic.trim()) return;
    setState("loading");
    setMessage("Researching live web sources…");
    setResults([]);
    setWebsiteSummary(null);
    try {
      const response = await fetch("/api/firecrawl/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, website }) });
      const data = await response.json();
      if (!response.ok) {
        setState(data.code === "timeout" || data.code === "rate_limit" || data.code === "unavailable" ? data.code : "failure");
        setMessage(data.error || "Research failed.");
        return;
      }
      const nextResults = Array.isArray(data.results) ? data.results : [];
      const markdown = typeof data.website?.markdown === "string" ? data.website.markdown : null;
      setResults(nextResults);
      setWebsiteSummary(markdown);
      setState(nextResults.length || markdown ? "success" : "empty");
      setMessage(nextResults.length || markdown ? "Live Firecrawl research is ready." : "No live data was returned for this question.");
    } catch {
      setState("failure");
      setMessage("The request could not be completed. Please try again.");
    }
  }

  return (
    <Shell isAdmin={isAdmin}>
      <header className="header narrow-header"><div><div className="eyebrow">Research</div><h1>Evidence before strategy.</h1><p className="muted">Research uses live Firecrawl results. Demo content is never substituted when a request is unavailable.</p></div></header>
      <section className="glass-panel firecrawl-panel">
        <div className="firecrawl-panel-head"><BookOpenText size={20} aria-hidden /><span className="data-source">Real-data workflow</span></div>
        <form className="form firecrawl-form" onSubmit={submit}>
          <label>Research question<input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. local SEO opportunities for dentists in Memphis" maxLength={300} required /></label>
          <label>Business website (optional)<input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" type="url" maxLength={2048} /></label>
          <button className="button" type="submit" disabled={state === "loading"}>{state === "loading" ? <><LoaderCircle className="spin" size={17} /> Researching</> : <><Radar size={17} /> Research live data</>}</button>
        </form>
      </section>
      <section className="section" aria-live="polite">
        <div className={`firecrawl-state ${state}`}><strong>{state === "success" ? "Real Firecrawl data" : state === "loading" ? "Loading live data" : state === "empty" ? "No data available" : state === "idle" ? "Ready" : "Data unavailable"}</strong><span>{message}</span></div>
        {websiteSummary ? <article className="glass-panel research-summary"><span className="data-source">Real data · Website scrape</span><h2>Website snapshot</h2><p>{websiteSummary.slice(0, 1_400)}</p></article> : null}
        {results.length ? <div className="firecrawl-results">{results.map((result, index) => <article className="glass-panel result-card" key={`${result.url ?? "result"}-${index}`}><div><span className="data-source">Real data · Firecrawl</span><h3>{result.title || result.metadata?.title || result.url || "Untitled result"}</h3><p>{result.description || result.metadata?.description || result.markdown?.slice(0, 220) || "No description was provided by the source."}</p></div>{result.url ? <a className="button button-secondary" href={result.url} target="_blank" rel="noreferrer">Open <ExternalLink size={15} /></a> : null}</article>)}</div> : null}
      </section>
    </Shell>
  );
}
