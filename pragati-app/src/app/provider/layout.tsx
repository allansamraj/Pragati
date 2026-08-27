"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { sessionService } from "@/lib/auth/sessionService";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import { RoleLocationHeader } from "@/components/layout/RoleLocationHeader";
import {
  LayoutDashboard, Pill, FlaskConical, Package,
  Share2, BarChart2, Settings, ChevronLeft,
  ChevronRight, Building2, Bell, AlertTriangle, ShieldCheck
} from "lucide-react";

const NAV = [
  { href: "/provider/dashboard",       icon: LayoutDashboard, label: "Overview" },
  { href: "/provider/medicines",       icon: Pill,            label: "Pharmacy Inventory" },
  { href: "/provider/diagnostics",     icon: FlaskConical,    label: "Diagnostics & Labs" },
  { href: "/provider/ai-consultation", icon: ShieldCheck,     label: "AI Consent Review" },
  { href: "/provider/referrals",       icon: Share2,          label: "Inter-Hospital Transfers" },
  { href: "/provider/reports",         icon: BarChart2,       label: "Stock & OPD Reports" },
  { href: "/provider/settings",        icon: Settings,        label: "Facility Settings" },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const session = sessionService.get();
    if (!session || session.role !== "provider") {
      router.replace("/login/provider");
      return;
    }
    setLoaded(true);
  }, [router]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside
        style={{ width: collapsed ? 64 : 240 }}
        className="fixed top-0 left-0 h-screen bg-surface border-r border-[rgba(124,45,45,0.09)] z-30 flex flex-col transition-all duration-200"
        aria-label="Pharmacy and Provider navigation"
      >
        <div className={cn("h-14 border-b border-[rgba(124,45,45,0.08)] flex items-center flex-shrink-0 px-4", collapsed && "justify-center")}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-7 h-7 bg-burgundy-700 rounded-[6px] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[13px] font-extrabold text-ink-primary tracking-tight leading-none block">PRAGATI</span>
                <span className="text-[9px] font-bold text-burgundy-700 tracking-wider uppercase leading-none block mt-0.5">PHARMACY &amp; FACILITY</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 rounded-[6px] hover:bg-blush flex items-center justify-center text-ink-tertiary hover:text-ink-primary transition-colors flex-shrink-0 cursor-pointer"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2.5 bg-blush/60 border border-[rgba(124,45,45,0.12)] rounded-[10px]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-burgundy-700 mb-0.5">Nandurbar District Civil Hospital</div>
            <div className="text-[12px] font-bold text-ink-primary">Central Pharmacy &amp; Labs</div>
            <div className="text-[9.5px] text-available-600 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-available-500 animate-pulse" /> Live Stock Monitoring
            </div>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-[8px] transition-all text-[13px] font-medium",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-burgundy-700 text-white font-bold shadow-xs"
                    : "text-ink-secondary hover:bg-blush hover:text-ink-primary"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-ink-tertiary")} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User profile dropdown in sidebar footer */}
        <div className="p-3 border-t border-[rgba(124,45,45,0.08)]">
          <ProfileDropdown />
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{ marginLeft: collapsed ? 64 : 240 }}
        className="flex-1 min-w-0 flex flex-col transition-all duration-200 bg-bg"
      >
        {/* Top Header */}
        <header className="h-14 border-b border-[rgba(124,45,45,0.08)] bg-surface/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <RoleLocationHeader role="provider" />

          <div className="flex items-center gap-3">
            <Link
              href="/provider/medicines"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 border border-amber-200 text-amber-800"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              2 Critical Medicine Alerts
            </Link>
            <Link
              href="/provider/medicines"
              className="px-3 py-1 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[11px] font-bold transition-colors shadow-2xs"
            >
              + Stock Inward
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-[1360px] w-full text-ink-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
