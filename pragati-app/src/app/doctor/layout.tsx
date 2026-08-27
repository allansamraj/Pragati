"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { sessionService } from "@/lib/auth/sessionService";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import {
  LayoutDashboard, Users, Activity, Video, FileText,
  Clock, Share2, Settings, ChevronLeft, ChevronRight,
  Stethoscope, Bell
} from "lucide-react";

const NAV = [
  { href: "/doctor/dashboard",    icon: LayoutDashboard, label: "Overview" },
  { href: "/doctor/queue",        icon: Users,           label: "Live OPD Queue" },
  { href: "/doctor/consultation", icon: Stethoscope,     label: "Consultation Pad" },
  { href: "/doctor/teleconsult",  icon: Video,           label: "Teleconsultation" },
  { href: "/doctor/patients",     icon: Activity,        label: "Patient Records" },
  { href: "/doctor/prescriptions",icon: FileText,        label: "E-Prescriptions" },
  { href: "/doctor/availability", icon: Clock,           label: "Duty & Schedule" },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const session = sessionService.get();
    if (!session || session.role !== "doctor") {
      router.replace("/login/doctor");
      return;
    }
    setLoaded(true);
  }, [router]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex">
      {/* Clinical Dark Sidebar */}
      <aside
        style={{ width: collapsed ? 64 : 240 }}
        className="fixed top-0 left-0 h-screen bg-[#141210] border-r border-white/10 z-30 flex flex-col transition-all duration-200"
        aria-label="Doctor navigation"
      >
        <div className={cn("h-14 border-b border-white/10 flex items-center flex-shrink-0 px-4", collapsed && "justify-center")}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-7 h-7 bg-emerald-600 rounded-[6px] flex items-center justify-center flex-shrink-0 border border-white/20 shadow-xs">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[13px] font-extrabold text-white tracking-tight leading-none block">PRAGATI</span>
                <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase leading-none block mt-0.5">DOCTOR CONSOLE</span>
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
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Nandurbar District Civil Hospital</div>
            <div className="text-[12px] font-bold text-white">Dr. Ananya Rao</div>
            <div className="text-[9.5px] text-emerald-300 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> On Duty · OPD Active
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
                    ? "bg-emerald-600 text-white font-bold shadow-xs border border-white/15"
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
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-bold text-ink-primary">Department of Cardiology</span>
            <span className="text-ink-tertiary">|</span>
            <span className="text-[11px] text-ink-secondary">Room 204 · OPD Counter 3</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Serving Token #41
            </span>
            <Link
              href="/doctor/teleconsult"
              className="flex items-center gap-1.5 px-3 py-1 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[11px] font-bold transition-colors shadow-2xs"
            >
              <Video className="w-3.5 h-3.5" /> PRAGATI Teleconsult (1)
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
