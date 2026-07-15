import Link from "next/link";
import { ArrowRight, Bot, ChartColumnBig, Compass, Radar, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { scoutPrompts, sharedTimeline, visibilityChannels } from "../lib/portalNarrative";

const kpis = [
  { label: "Visibility Score", value: "87", trend: "↑ +14 this month" },
  { label: "Google Ranking", value: "#4", trend: "↑ Up 7 spots" },
  { label: "Leads Generated", value: "42", trend: "↑ 18%" },
  { label: "Reviews", value: "4.8★", trend: "↑ 3 new this week" }
];

const pillars = [
  {
    icon: Radar,
    title: "Visibility Command Center",
    copy: "See Google, Bing, Apple Maps, Yelp, Facebook, Nextdoor, and more in one calm premium surface."
  },
  {
    icon: Bot,
    title: "Meet Scout",
    copy: "Ask why rankings changed, which channels generated leads, and what should improve next."
  },
  {
    icon: ChartColumnBig,
    title: "Interactive What-If Simulator",
    copy: "Use sliders to show how reviews, authority, and page speed can unlock measurable growth."
  }
];

export default function Home() {
  return (
    <main className="landing premium-landing">
      <div className="landing-orb landing-orb-left" aria-hidden />
      <div className="landing-orb landing-orb-right" aria-hidden />

      <nav className="landing-nav premium-nav">
        <Link className="brand brand-dark" href="/">
          <span className="brand-mark brand-mark-gold">MS</span>
          <span>
            <strong>Main Street Media Co.</strong>
            <small>Digital headquarters for local visibility</small>
          </span>
        </Link>
        <div className="landing-actions">
          <Link className="text-link" href="/login">
            Log in
          </Link>
          <Link className="button" href="/signup">
            Request audit
          </Link>
        </div>
      </nav>

      <section className="hero hero-landing reveal">
        <div className="hero-copy hero-copy-premium">
          <div className="eyebrow">Client portal</div>
          <h1>Your business is becoming impossible to ignore.</h1>
          <p>
            Built like a premium banking app, but tuned for local growth. Every KPI, report, document, and recommendation
            lives in one polished headquarters with black, gold, and warm white clarity.
          </p>
          <div className="button-row">
            <Link className="button button-large" href="/signup">
              Start your portal <ArrowRight size={18} aria-hidden />
            </Link>
            <Link className="button button-secondary button-large" href="/login">
              Customer login
            </Link>
          </div>
          <div className="pill-row">
            <span className="status-pill">Premium scroll experience</span>
            <span className="status-pill">AI-ready</span>
            <span className="status-pill">Canvas-friendly reports</span>
          </div>
        </div>

        <div className="hero-panel glass-panel premium-preview">
          <div className="preview-header">
            <div>
              <span className="eyebrow">Monday briefing</span>
              <strong>Good Morning, John 👋</strong>
            </div>
            <span className="status-pill">Overall health: A−</span>
          </div>

          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <article className="kpi-card" key={kpi.label}>
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <em>{kpi.trend}</em>
              </article>
            ))}
          </div>

          <div className="briefing-card">
            <div className="briefing-card-head">
              <ShieldCheck size={18} aria-hidden />
              <span>Executive briefing preview</span>
            </div>
            <p>
              Your Google visibility increased by 6%. Two competitors lost rankings. Three new reviews were published.
              Scout found two optimization opportunities expected to lift traffic by roughly 12%.
            </p>
          </div>
        </div>
      </section>

      <section className="section feature-strip reveal">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article className="feature-card glass-panel" key={pillar.title}>
              <Icon size={22} aria-hidden />
              <h2>{pillar.title}</h2>
              <p className="muted">{pillar.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="section reveal" id="timeline">
        <div className="section-heading premium-heading">
          <div>
            <div className="eyebrow">Activity timeline</div>
            <h2>Clients see what happened, not just what is missing.</h2>
          </div>
          <TimerReset size={20} aria-hidden />
        </div>
        <div className="timeline-grid">
          {Object.entries(sharedTimeline).map(([label, items]) => (
            <article className="timeline-card glass-panel" key={label}>
              <span className="timeline-label">{label}</span>
              <ul>
                {items.map((item) => (
                  <li key={item}>
                    <span className="timeline-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section dashboard-preview reveal" id="system">
        <article className="system-card glass-panel">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Visibility control</div>
              <h2>All channels in one place.</h2>
            </div>
            <Compass size={20} aria-hidden />
          </div>
          <div className="channel-tiles">
            {visibilityChannels.map((channel, index) => (
              <div className="channel-card" key={channel.label}>
                <span>{channel.label}</span>
                <strong className={index < 4 ? "channel-good" : index < 6 ? "channel-warn" : "channel-risk"}>
                  {index < 4 ? "Green" : index < 6 ? "Yellow" : "Red"}
                </strong>
              </div>
            ))}
          </div>
        </article>

        <article className="system-card glass-panel">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Scout</div>
              <h2>Bottom-right AI assistant.</h2>
            </div>
            <Sparkles size={20} aria-hidden />
          </div>
          <div className="assistant-preview">
            {scoutPrompts.map((prompt) => (
              <p key={prompt}>{prompt}</p>
            ))}
          </div>
        </article>
      </section>

      <section className="section cta-band reveal">
        <div>
          <div className="eyebrow">Phase 1 build order</div>
          <h2>Design the shell once, then unlock the full client experience.</h2>
        </div>
        <Link className="button button-large" href="/signup">
          Request access <ArrowRight size={18} aria-hidden />
        </Link>
      </section>
    </main>
  );
}
