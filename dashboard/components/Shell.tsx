"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessageSquare,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";
import { supabase } from "../lib/supabase";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/request-audit", label: "Request Audit", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/account", label: "Account", icon: Settings }
];

const commandNav = [
  { href: "/dashboard#overview", label: "Overview", icon: Sparkles },
  { href: "/dashboard#visibility", label: "Visibility", icon: Radar },
  { href: "/dashboard#seo", label: "SEO", icon: Search },
  { href: "/dashboard#google-business", label: "Google Business", icon: MapPinned },
  { href: "/dashboard#reviews", label: "Reviews", icon: Star },
  { href: "/dashboard#documents", label: "Documents", icon: FolderOpen },
  { href: "/dashboard#messages", label: "Messages", icon: MessageSquare },
  { href: "/billing", label: "Billing", icon: CreditCard }
];

export function Shell({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hash, setHash] = useState("");

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  function isActive(href: string) {
    const [hrefPath, hrefHash] = href.split("#");

    if (hrefHash) {
      if (hrefPath !== pathname) return false;
      const currentHash = hash || "#overview";
      return currentHash === `#${hrefHash}` || (pathname === "/dashboard" && !hash && hrefHash === "overview");
    }

    return hrefPath === pathname;
  }

  return (
    <div className="shell">
      <aside className="sidebar glass-panel">
        <Link className="brand brand-dark brand-sidebar" href="/dashboard">
          <span className="brand-mark brand-mark-gold">MS</span>
          <span>
            <strong>Main Street Media Co.</strong>
            <small>Digital headquarters</small>
          </span>
        </Link>

        <div className="sidebar-card">
          <span className="sidebar-label">Executive Briefing</span>
          <strong>Visibility is up 6.2% this week.</strong>
          <p>Scout flagged two opportunities worth pursuing before Monday’s report is sent.</p>
        </div>

        <div className="sidebar-group">
          <span className="sidebar-label">Portal</span>
          <nav className="nav" aria-label="Portal navigation">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} className={active ? "active" : ""} href={item.href}>
                  <Icon size={18} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin ? (
              <Link className={isActive("/admin") ? "active" : ""} href="/admin">
                <ShieldCheck size={18} aria-hidden />
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="sidebar-group">
          <span className="sidebar-label">Command Center</span>
          <nav className="nav nav-compact" aria-label="Command center navigation">
            {commandNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} className={active ? "active" : ""} href={item.href}>
                  <Icon size={18} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdmin ? (
          <div className="sidebar-group">
            <span className="sidebar-label">Internal</span>
            <nav className="nav nav-compact" aria-label="Internal navigation">
              <Link className={isActive("/internal/call-sheet") ? "active" : ""} href="/internal/call-sheet">
                <FileText size={18} aria-hidden />
                Call Sheet
              </Link>
            </nav>
          </div>
        ) : null}

        <button className="nav-action" type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden />
          Log out
        </button>
      </aside>

      <main className="main">{children}</main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} className={isActive(item.href) ? "active" : ""} href={item.href}>
              <Icon size={18} aria-hidden />
              {item.label}
            </Link>
          );
        })}
        <button className="mobile-nav-action" type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden />
          Log out
        </button>
      </nav>
    </div>
  );
}
