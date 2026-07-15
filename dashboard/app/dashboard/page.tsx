"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  ChartColumnBig,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Globe,
  MapPinned,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp
} from "lucide-react";
import { AuthGuard } from "../../components/AuthGuard";
import { Shell } from "../../components/Shell";
import { supabase } from "../../lib/supabase";
import {
  canAccessPackage,
  getBusinessDisplayName,
  packageLabel,
  reportCatalog,
  type BusinessSnapshot,
  type Profile
} from "../../lib/portal";
import { loadBusinessSnapshot } from "../../lib/businessSnapshot";
import { scoutPrompts, sharedTimeline, visibilityChannels } from "../../lib/portalNarrative";

const documents = [
  { title: "Visibility Audit", meta: "Executive-ready", accent: "gold" },
  { title: "What-If Package", meta: "Interactive strategy", accent: "glass" },
  { title: "Invoices", meta: "Billing archive", accent: "glass" },
  { title: "Contracts", meta: "Secure access", accent: "glass" },
  { title: "Analytics", meta: "Live data", accent: "gold" },
  { title: "Call Reports", meta: "Lead activity", accent: "glass" }
];

const feed = [
  "We just fixed a broken schema on your homepage.",
  "Google indexed the new service page.",
  "Three new reviews were responded to.",
  "Two local citations are now aligned.",
  "A competitor lost rank for a core keyword."
];

const roadmap = [
  { phase: "Phase 1", status: "Complete", detail: "Portal shell, authentication, and report access." },
  { phase: "Phase 2", status: "In Progress", detail: "Visibility command center, AI briefing, and docs." },
  { phase: "Phase 3", status: "Upcoming", detail: "Automation, mobile polish, and Canva-generated assets." }
];

const dashboardKpis = [
  { label: "Visibility Score", value: 87, suffix: "", trend: "+14 this month" },
  { label: "Google Ranking", value: 4, suffix: "th", trend: "Up 7 spots" },
  { label: "Leads Generated", value: 42, suffix: "", trend: "+18%" },
  { label: "Reviews", value: 4.8, suffix: "★", trend: "3 new this week", decimals: 1 }
];

export default function DashboardPage() {
  return (
    <AuthGuard>
      {({ profile }) => <DashboardContent profile={profile} />}
    </AuthGuard>
  );
}

function DashboardContent({ profile }: { profile: Profile | null }) {
  const [snapshot, setSnapshot] = useState<BusinessSnapshot | null>(null);
  const [reviews, setReviews] = useState(20);

  useEffect(() => {
    async function loadPortalData() {
      if (!profile?.id) return;
      const nextSnapshot = await loadBusinessSnapshot(supabase, profile.id);
      setSnapshot(nextSnapshot);
    }

    loadPortalData();
  }, [profile?.id]);

  const packageType = snapshot?.profile.package.sourceValue ?? profile?.package_type ?? null;
  const visibleReports = snapshot?.visibleReports ?? [];
  const latestStatus = snapshot?.summary.latestAuditStatusLabel ?? "No request submitted";
  const visibilityGain = Math.min(34, Math.max(8, Math.round((reviews - 20) * 0.8 + 12)));
  const leadsGain = Math.max(6, Math.round((reviews - 20) * 0.5 + 18));
  const revenueGain = leadsGain * 700;
  const score = Math.min(99, 62 + Math.round((reviews - 20) * 0.35));
  const displayName = getBusinessDisplayName(
    snapshot?.profile ?? (profile ? { fullName: profile.full_name, businessName: profile.business_name } : null)
  );

  return (
    <Shell isAdmin={profile?.role === "admin"}>
      <section className="hero dashboard-hero reveal" id="overview">
        <div className="hero-copy hero-copy-premium">
          <div className="eyebrow">Digital headquarters</div>
          <h1>Good Morning, {displayName} 👋</h1>
          <p className="muted">
            Your business is becoming impossible to ignore. This week&apos;s briefing blends live visibility, reports,
            documents, and AI recommendations into one calm premium surface.
          </p>
          <div className="button-row">
            <Link className="button button-large" href="/request-audit">
              Request audit <ArrowRight size={18} aria-hidden />
            </Link>
            <Link className="button button-secondary button-large" href="/reports">
              View reports
            </Link>
          </div>
          <div className="pill-row">
            <span className="status-pill">Overall health: A−</span>
            <span className="status-pill">Weekly briefing ready</span>
            <span className="status-pill">Scout online</span>
          </div>
        </div>

        <div className="hero-panel glass-panel premium-preview">
          <div className="preview-header">
            <div>
              <span className="eyebrow">Executive briefing</span>
              <strong>This Week at Main Street Media</strong>
            </div>
            <span className="status-pill">Monday 60-second summary</span>
          </div>

          <div className="kpi-grid">
            {dashboardKpis.map((kpi) => (
              <StatCard key={kpi.label} {...kpi} />
            ))}
          </div>

          <div className="briefing-card">
            <div className="briefing-card-head">
              <ShieldCheck size={18} aria-hidden />
              <span>What changed</span>
            </div>
            <p className="briefing-status">Latest audit status: {latestStatus.replaceAll("_", " ")}</p>
            <ul className="briefing-list">
              <li>Your Google visibility increased by 6%.</li>
              <li>Two competitors lost rankings for key local terms.</li>
              <li>Three new reviews were published.</li>
              <li>Scout found two optimization opportunities expected to lift traffic by 12%.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section metric-band reveal" id="visibility">
        {[
          { title: "Visibility Score", value: score, tone: "gold", suffix: "%" },
          { title: "Google Rank", value: 4, tone: "glass", suffix: "th" },
          { title: "Leads", value: 42, tone: "glass", suffix: "" },
          { title: "Reviews", value: 4.8, tone: "gold", suffix: "★", decimals: 1 }
        ].map((item) => (
          <article className={`metric-tile ${item.tone}`} key={item.title}>
            <span>{item.title}</span>
            <strong>
              <CountUp value={item.value} decimals={item.decimals ?? 0} />
              {item.suffix}
            </strong>
          </article>
        ))}
      </section>

      <section className="section grid-2 reveal" id="seo">
        <article className="glass-panel command-card">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Visibility command center</div>
              <h2>Every channel, instantly visible.</h2>
            </div>
            <MapPinned size={20} aria-hidden />
          </div>
          <div className="channel-grid">
            {visibilityChannels.map((channel) => (
              <div className="channel-row" key={channel.label}>
                <div>
                  <strong>{channel.label}</strong>
                  <span className={`channel-pill ${channel.tone}`}>{channel.tone === "good" ? "Green" : channel.tone === "warn" ? "Yellow" : "Red"}</span>
                </div>
                <div className="channel-meter" aria-hidden>
                  <span style={{ width: `${channel.score}%` }} />
                </div>
                <em>{channel.score}%</em>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel command-card">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Scout</div>
              <h2>Ask the AI assistant anything.</h2>
            </div>
            <Bot size={20} aria-hidden />
          </div>
          <div className="assistant-preview">
            {scoutPrompts.map((prompt) => (
              <p key={prompt}>{prompt}</p>
            ))}
            <p>Explain this audit.</p>
          </div>
          <div className="assistant-response">
            <Sparkles size={16} aria-hidden />
            <span>Scout found a drop in review velocity and a new citation opportunity near downtown Memphis.</span>
          </div>
        </article>
      </section>

      <section className="section grid-2 reveal" id="timeline">
        <article className="glass-panel timeline-panel">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Activity timeline</div>
              <h2>Clients love seeing work.</h2>
            </div>
            <Clock3 size={20} aria-hidden />
          </div>
          <div className="timeline-grid">
            {Object.entries(sharedTimeline).map(([label, items]) => (
              <div className="timeline-card" key={label}>
                <span className="timeline-label">{label}</span>
                <ul>
                  {items.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={14} aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel whatif-panel">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">What-if simulator</div>
              <h2>Turn optimization into a sales tool.</h2>
            </div>
            <Target size={20} aria-hidden />
          </div>
          <label className="whatif-range">
            <span>Reviews</span>
            <strong>{reviews}</strong>
            <input
              max={100}
              min={10}
              type="range"
              value={reviews}
              onChange={(event) => setReviews(Number(event.target.value))}
            />
          </label>
          <div className="whatif-result">
            <div>
              <span>Potential visibility</span>
              <strong>+{visibilityGain}%</strong>
            </div>
            <div>
              <span>Estimated leads</span>
              <strong>+{leadsGain}/month</strong>
            </div>
            <div>
              <span>Revenue</span>
              <strong>+${revenueGain.toLocaleString()}</strong>
            </div>
          </div>
          <p className="muted">Move the slider to show how review growth changes visibility, leads, and revenue.</p>
        </article>
      </section>

      <section className="section reveal" id="google-business">
        <div className="section-heading premium-heading">
          <div>
            <div className="eyebrow">Google Business Profile</div>
            <h2>Live presence across the maps and directories that matter.</h2>
          </div>
          <Globe size={20} aria-hidden />
        </div>
        <div className="channel-grid">
          <article className="glass-panel status-panel">
            <strong>Google</strong>
            <span>98%</span>
          </article>
          <article className="glass-panel status-panel">
            <strong>Bing</strong>
            <span>82%</span>
          </article>
          <article className="glass-panel status-panel">
            <strong>Apple Maps</strong>
            <span>91%</span>
          </article>
          <article className="glass-panel status-panel">
            <strong>Facebook</strong>
            <span>69%</span>
          </article>
          <article className="glass-panel status-panel">
            <strong>Yelp</strong>
            <span>57%</span>
          </article>
          <article className="glass-panel status-panel">
            <strong>Nextdoor</strong>
            <span>43%</span>
          </article>
        </div>
      </section>

      <section className="section grid-2 reveal" id="reviews">
        <article className="glass-panel feed-panel">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Success feed</div>
              <h2>Feels like a product feed, not a PDF archive.</h2>
            </div>
            <FileText size={20} aria-hidden />
          </div>
          <div className="feed-list">
            {feed.map((item) => (
              <div className="feed-item" key={item}>
                <span className="feed-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel radar-panel">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Competitor radar</div>
              <h2>You vs. the field.</h2>
            </div>
            <Radar size={20} aria-hidden />
          </div>
          <RadarChart />
          <div className="radar-legend">
            <span><strong>You</strong> stronger on trust, reviews, and Google ranking.</span>
            <span><strong>Competitors</strong> still competing on backlinks and authority.</span>
          </div>
        </article>
      </section>

      <section className="section reveal" id="documents">
        <div className="section-heading premium-heading">
          <div>
            <div className="eyebrow">Documents</div>
            <h2>Beautiful cards instead of folders.</h2>
          </div>
          <FolderOpen size={20} aria-hidden />
        </div>
        <div className="document-grid">
          {documents.map((document) => (
            <article className={`document-card ${document.accent}`} key={document.title}>
              <div>
                <h3>{document.title}</h3>
                <p className="muted">{document.meta}</p>
              </div>
              <ArrowUpRight size={18} aria-hidden />
            </article>
          ))}
        </div>
      </section>

      <section className="section grid-2 reveal" id="analytics">
        <article className="glass-panel analytics-panel">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Live analytics</div>
              <h2>Everything together.</h2>
            </div>
            <TrendingUp size={20} aria-hidden />
          </div>
          <div className="analytics-list">
            {["Google Analytics", "Search Console", "GBP", "Phone Calls", "Forms", "Chat", "Revenue", "Appointments"].map((item) => (
              <div className="analytics-pill" key={item}>
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel roadmap-panel" id="roadmap">
          <div className="section-heading premium-heading">
            <div>
              <div className="eyebrow">Growth roadmap</div>
              <h2>Unlock milestones like a game, but keep it professional.</h2>
            </div>
            <ChartColumnBig size={20} aria-hidden />
          </div>
          <div className="roadmap-list">
            {roadmap.map((step) => (
              <div className="roadmap-item" key={step.phase}>
                <div>
                  <strong>{step.phase}</strong>
                  <p>{step.detail}</p>
                </div>
                <span className="status-pill">{step.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="section reveal" id="messages">
        <div className="section-heading premium-heading">
          <div>
            <div className="eyebrow">Reports</div>
            <h2>Reports Assigned to Your Business</h2>
          </div>
          <Link className="inline-link" href="/reports">
            View all reports
          </Link>
        </div>

        <div className="report-list">
          {visibleReports.length ? (
            visibleReports.slice(0, 3).map((report) => (
              <article className="report-card glass-panel" key={report.id}>
                <div>
                  <span className="status-pill">{report.requiredPackage.label}</span>
                  <h3>{report.title}</h3>
                  <p>{report.description || "Report assigned by Main Street Media Co."}</p>
                </div>
                <ArrowRight size={18} aria-hidden />
              </article>
            ))
          ) : (
            <div className="empty-state glass-panel">
              <h3>No unlocked reports yet</h3>
              <p className="muted">Submit an audit request or check back after your first report is assigned.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section reveal" id="billing">
        <div className="section-heading premium-heading">
          <div>
            <div className="eyebrow">Package access</div>
            <h2>Channel access stays clear.</h2>
          </div>
          <ShieldCheck size={20} aria-hidden />
        </div>
        <div className="billing-cta card">
          <div>
            <h3>Manage Stripe billing</h3>
            <p className="muted">Open the secure billing flow to select a package and complete payment in Stripe Checkout.</p>
          </div>
          <Link className="button button-secondary" href="/billing">
            Open billing
          </Link>
        </div>
        <div className="catalog-grid">
          {reportCatalog.map((item) => {
            const unlocked = canAccessPackage(packageType, item.requiredPackage);
            return (
              <article className={unlocked ? "catalog-item glass-panel" : "catalog-item glass-panel locked"} key={item.type}>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </div>
                <span className={unlocked ? "status-pill" : "lock-pill"}>{packageLabel(item.requiredPackage)}</span>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}

function StatCard({
  label,
  value,
  suffix,
  trend,
  decimals = 0
}: {
  label: string;
  value: number;
  suffix: string;
  trend: string;
  decimals?: number;
}) {
  return (
    <article className="kpi-card">
      <span>{label}</span>
      <strong>
        <CountUp value={value} decimals={decimals} />
        {suffix}
      </strong>
      <em>{trend}</em>
    </article>
  );
}

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = value * eased;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

function RadarChart() {
  const you = [
    { label: "SEO score", value: 88 },
    { label: "Reviews", value: 94 },
    { label: "Authority", value: 76 },
    { label: "Rank", value: 91 },
    { label: "Speed", value: 82 },
    { label: "Trust", value: 90 }
  ];
  const competitors = [
    { label: "SEO score", value: 67 },
    { label: "Reviews", value: 61 },
    { label: "Authority", value: 82 },
    { label: "Rank", value: 56 },
    { label: "Speed", value: 69 },
    { label: "Trust", value: 65 }
  ];

  const pointsFor = (values: number[]) => {
    const center = 120;
    const radius = 82;
    return values
      .map((value, index) => {
        const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
        const distance = radius * (value / 100);
        const x = center + Math.cos(angle) * distance;
        const y = center + Math.sin(angle) * distance;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="radar-chart-wrap">
      <svg viewBox="0 0 240 240" className="radar-chart" role="img" aria-label="Competitor radar comparison">
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon
            key={ring}
            points={pointsFor(new Array(6).fill(ring * 100))}
            className="radar-grid"
          />
        ))}
        <polygon points={pointsFor(competitors.map((item) => item.value))} className="radar-competitor" />
        <polygon points={pointsFor(you.map((item) => item.value))} className="radar-you" />
        {you.map((item, index) => {
          const angle = (Math.PI * 2 * index) / you.length - Math.PI / 2;
          const x = 120 + Math.cos(angle) * 98;
          const y = 120 + Math.sin(angle) * 98;
          return (
            <text key={item.label} x={x} y={y} className="radar-label">
              {item.label}
            </text>
          );
        })}
      </svg>
      <div className="radar-key">
        <span className="radar-key-item"><i className="radar-you-swatch" /> You</span>
        <span className="radar-key-item"><i className="radar-competitor-swatch" /> Competitor average</span>
      </div>
    </div>
  );
}
