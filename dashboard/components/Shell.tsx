"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, ClipboardList, FileText, LogOut, Settings, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/request-audit", label: "Request Audit", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/account", label: "Account", icon: Settings }
];

export function Shell({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">MS</span>
          <span>
            <strong>Main Street Media Co.</strong>
            <small>Impossible to Ignore</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Portal navigation">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} className={active ? "active" : ""} href={item.href}>
                <Icon size={18} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link className={pathname === "/admin" ? "active" : ""} href="/admin">
              <ShieldCheck size={18} aria-hidden />
              Admin
            </Link>
          ) : null}
        </nav>
        <button className="nav-action" type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden />
          Log out
        </button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

