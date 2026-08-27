"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { sessionService } from "@/lib/auth/sessionService";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import { RoleLocationHeader } from "@/components/layout/RoleLocationHeader";
import {
  LayoutDashboard, Map, Building2, Activity, Package,
  AlertTriangle, Share2, BarChart2, FileText, Settings,
  ChevronLeft, ChevronRight, Bell
} from "lucide-react";

import { useLocationContext } from "@/lib/context/LocationContext";

const NAV = [
  { href: "/government/dashboard",    icon: LayoutDashboard, label: "Overview" },
  { href: "/government/map",           icon: Map,             label: "Regional Health Map" },
  { href: "/government/facilities",    icon: Building2,       label: "Facilities" },
  { href: "/government/accessibility", icon: Activity,        label: "Accessibility" },
  { href: "/government/resources",     icon: Package,         label: "Resources" },
  { href: "/government/shortages",     icon: AlertTriangle,   label: "Shortages" },
  { href: "/government/referrals",     icon: Share2,          label: "Referrals" },
  { href: "/government/analytics",     icon: BarChart2,       label: "Analytics" },
  { href: "/government/reports",       icon: FileText,        label: "Reports" },
  { href: "/government/settings",      icon: Settings,        label: "Settings" },
];

export default function GovernmentLayout({ children }: { children: React.ReactNode }) {
  const { governmentLocation } = useLocationContext();
  const state = governmentLocation?.state || "Tamil Nadu";
  const pathname = usePathname();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const session = sessionService.get();
    if (!session || session.role !== "government") {
      router.replace("/login/government");
      return;
    }
    setLoaded(true);
  }, [router]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-ink-primary flex">
      {/* Sidebar */}
      <aside
        style={{ width: collapsed ? 64 : 240 }}
        className="fixed top-0 left-0 h-screen bg-[#1F1614] border-r border-white/10 z-30 flex flex-col transition-all duration-200"
        aria-label="Government navigation"
      >
        <div className={cn("h-14 border-b border-white/10 flex items-center flex-shrink-0 px-4", collapsed && "justify-center")}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-7 h-7 bg-burgundy-700 rounded-[6px] flex items-center justify-center flex-shrink-0 border border-white/20 shadow-xs">
                <svg width="15" height="15" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <rect x="14" y="6" width="4" height="20" rx="2" fill="white" />
                  <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
                </svg>
              </div>
              <div>
                <span className="text-[13px] font-extrabold text-white tracking-tight leading-none block">PRAGATI</span>
                <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase leading-none block mt-0.5">{state.toUpperCase()} GOV</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-[10px]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Government of {state}</div>
            <div className="text-[12px] font-bold text-white">Public Health Intelligence</div>
            <div className="text-[9.5px] text-amber-300 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Live Surveillance
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
                    ? "bg-burgundy-700 text-white font-bold shadow-xs border border-white/15"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-slate-400")} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User profile dropdown in sidebar footer */}
        <div className="p-3 border-t border-white/10">
          <ProfileDropdown />
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{ marginLeft: collapsed ? 64 : 240 }}
        className="flex-1 min-w-0 flex flex-col transition-all duration-200 bg-[#FAF7F5]"
      >
        {/* Top Header */}
        <header className="h-14 border-b border-[rgba(124,45,45,0.08)] bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <RoleLocationHeader role="government" />

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 border border-amber-200 text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Statewide Monitored
            </span>
            <button
              aria-label="Alerts"
              className="w-8 h-8 rounded-[8px] bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] flex items-center justify-center text-ink-secondary transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
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
