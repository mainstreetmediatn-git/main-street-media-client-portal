"use client";

import { FormEvent, useEffect, useState } from "react";
import { Compass, ExternalLink, LoaderCircle, Search } from "lucide-react";
import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";

type SearchResult = { title?: string; url?: string; description?: string; markdown?: string; metadata?: { title?: string; description?: string } };
type ViewState = "idle" | "loading" | "success" | "empty" | "timeout" | "rate_limit" | "failure" | "unavailable";

function titleFor(result: SearchResult) {
  return result.title || result.metadata?.title || result.url || "Untitled result";
}

export default function DiscoverPage() {
  return <AuthGuard>{({ profile }) => <DiscoverContent isAdmin={profile?.role === "admin"} />}</AuthGuard>;
}

function DiscoverContent({ isAdmin }: { isAdmin: boolean }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<ViewState>("idle");
  const [message, setMessage] = useState("Search the web for businesses, services, or local opportunities.");
  const [health, setHealth] = useState("Checking connection…");

  useEffect(() => {
    fetch("/api/firecrawl/health")
      .then((response) => response.json())
      .then((data) => setHealth(data.status || "Connection status unavailable."))
      .catch(() => setHealth("Connection status unavailable."));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setState("loading");
    setMessage("Searching Firecrawl for live web results…");
    setResults([]);

    try {
      const response = await fetch("/api/firecrawl/business-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location })
      });
      const data = await response.json();
      if (!response.ok) {
        const nextState = data.code === "timeout" || data.code === "rate_limit" || data.code === "unavailable" ? data.code : "failure";
        setState(nextState);
        setMessage(data.error || "Search failed.");
        return;
      }
      const nextResults = Array.isArray(data.results) ? data.results : [];
      setResults(nextResults);
      setState(nextResults.length ? "success" : "empty");
      setMessage(nextResults.length ? `${nextResults.length} live Firecrawl result${nextResults.length === 1 ? "" : "s"} found.` : "No live results matched this search.");
    } catch {
      setState("failure");
      setMessage("The request could not be completed. Check your connection and try again.");
    }
  }

  return (
    <Shell isAdmin={isAdmin}>
      <header className="header narrow-header">
        <div>
          <div className="eyebrow">Discover</div>
          <h1>Find the local market.</h1>
          <p className="muted">Live web search powered by Firecrawl. Results are never replaced with demo data.</p>
        </div>
      </header>

      <section className="glass-panel firecrawl-panel">
        <div className="firecrawl-panel-head"><Compass size={20} aria-hidden /><span className="status-pill">{health}</span></div>
        <form className="form firecrawl-form" onSubmit={submit}>
          <div className="two-column">
            <label>What are you looking for?<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. family dentists" maxLength={300} required /></label>
            <label>Location (optional)<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Memphis, TN" maxLength={120} /></label>
          </div>
          <button className="button" type="submit" disabled={state === "loading"}>{state === "loading" ? <><LoaderCircle className="spin" size={17} /> Searching</> : <><Search size={17} /> Search live data</>}</button>
        </form>
      </section>

      <section className="section" aria-live="polite">
        <div className={`firecrawl-state ${state}`}><strong>{state === "loading" ? "Loading live data" : state === "success" ? "Real Firecrawl data" : state === "empty" ? "No data available" : state === "idle" ? "Ready" : "Data unavailable"}</strong><span>{message}</span></div>
        {results.length ? <div className="firecrawl-results">{results.map((result, index) => <article className="glass-panel result-card" key={`${result.url ?? "result"}-${index}`}><div><span className="data-source">Real data · Firecrawl</span><h3>{titleFor(result)}</h3><p>{result.description || result.metadata?.description || result.markdown?.slice(0, 220) || "No description was provided by the source."}</p></div>{result.url ? <a className="button button-secondary" href={result.url} target="_blank" rel="noreferrer">Open <ExternalLink size={15} /></a> : null}</article>)}</div> : null}
      </section>
    </Shell>
  );
}
