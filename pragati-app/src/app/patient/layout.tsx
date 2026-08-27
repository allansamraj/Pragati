"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { sessionService } from "@/lib/auth/sessionService";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import { useLanguage } from "@/lib/i18n";
import {
  LayoutDashboard, Search, Ticket, FileText, Pill,
  CalendarDays, Share2, Bell, AlertTriangle, User,
  ChevronLeft, ChevronRight, Menu, X, Home, Phone, Video, Bot
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/patient/dashboard",       icon: LayoutDashboard, key: "patient.nav.overview" },
  { href: "/patient/find-care",       icon: Search,           key: "patient.nav.findCare" },
  { href: "/patient/ai-consultation", icon: Bot,              key: "patient.nav.aiConsultation" },
  { href: "/patient/teleconsult",     icon: Video,            key: "patient.nav.teleconsult" },
  { href: "/patient/token",           icon: Ticket,           key: "patient.nav.token" },
  { href: "/patient/appointments",    icon: CalendarDays,     key: "patient.nav.appointments" },
  { href: "/patient/records",         icon: FileText,         key: "patient.nav.records" },
  { href: "/patient/prescriptions",   icon: Pill,             key: "patient.nav.prescriptions" },
  { href: "/patient/referrals",       icon: Share2,           key: "patient.nav.referrals" },
  { href: "/patient/reminders",       icon: Bell,             key: "patient.nav.reminders" },
  { href: "/patient/profile",         icon: User,             key: "patient.nav.profile" },
];

const BOTTOM_NAV = [
  { href: "/patient/dashboard",  icon: Home,       key: "patient.nav.overview" },
  { href: "/patient/find-care",  icon: Search,     key: "patient.nav.findCare" },
  { href: "/patient/token",      icon: Ticket,     key: "patient.nav.token" },
  { href: "/patient/records",    icon: FileText,   key: "patient.nav.records" },
  { href: "/patient/profile",    icon: User,       key: "patient.nav.profile" },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const session = sessionService.get();
    if (!session || session.role !== "patient") {
      router.replace("/login/patient");
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
    <div className="min-h-screen bg-bg">

      {/* ── SIDEBAR (desktop) ── */}
      <aside
        style={{ width: collapsed ? 64 : 240 }}
        className="fixed top-0 left-0 h-screen bg-surface border-r border-[rgba(124,45,45,0.08)] z-30 hidden lg:flex flex-col transition-all duration-200"
        aria-label="Patient navigation"
      >
        {/* Logo + collapse */}
        <div className={cn("h-14 border-b border-[rgba(124,45,45,0.06)] flex items-center flex-shrink-0 px-4", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link href="/patient/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-burgundy-700 rounded-[5px] flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <rect x="14" y="6" width="4" height="20" rx="2" fill="white" />
                  <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
                </svg>
              </div>
              <span className="text-[13px] font-bold text-ink-primary tracking-tight">PRAGATI</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 rounded-[6px] hover:bg-blush flex items-center justify-center text-ink-tertiary transition-colors flex-shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Demo badge */}
        {!collapsed && (
          <div className="mx-3 mt-2.5 mb-1 bg-limited-50 border border-limited-100 rounded-[6px] px-2.5 py-1.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-limited-500">Demo Mode</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
            const isActive = pathname === href || (href !== "/patient/dashboard" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? t(key) : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2.5 rounded-[8px] transition-colors text-[13px]",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-blush text-burgundy-700 font-semibold"
                    : "text-ink-secondary hover:bg-blush/50 hover:text-ink-primary font-medium"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden />
                {!collapsed && t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Emergency */}
        {!collapsed && (
          <div className="p-2.5 border-t border-[rgba(124,45,45,0.06)]">
            <Link
              href="/patient/emergency"
              className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[8px] text-critical-500 hover:bg-critical-50 transition-colors text-[13px] font-medium"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden />
              {t("patient.nav.emergency")}
            </Link>
          </div>
        )}
      </aside>

      {/* ── DESKTOP MAIN ── */}
      <div style={{ marginLeft: collapsed ? 64 : 240 }} className="hidden lg:block min-h-screen transition-all duration-200">
        <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-[rgba(124,45,45,0.07)] h-14 flex items-center px-6 justify-between">
          <div />
          <ProfileDropdown />
        </header>
        <div className="p-6 max-w-[1200px]">{children}</div>
      </div>

      {/* ── MOBILE ── */}
      <div className="lg:hidden">
        {/* Mobile top */}
        <header className="fixed top-0 left-0 right-0 z-30 bg-surface border-b border-[rgba(124,45,45,0.08)] h-14 flex items-center px-4 justify-between">
          <Link href="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-burgundy-700 rounded-[5px] flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 32 32" fill="none" aria-hidden>
                <rect x="14" y="6" width="4" height="20" rx="2" fill="white" />
                <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-ink-primary">PRAGATI</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href="tel:108" className="w-8 h-8 rounded-[7px] bg-critical-50 border border-critical-100 flex items-center justify-center" aria-label="Emergency 108">
              <Phone className="w-3.5 h-3.5 text-critical-500" />
            </a>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-8 h-8 rounded-[7px] hover:bg-blush flex items-center justify-center text-ink-secondary transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-40" role="dialog" aria-label="Navigation menu">
            <div className="absolute inset-0 bg-ink-primary/20" onClick={() => setMobileOpen(false)} />
            <nav className="absolute top-14 left-0 right-0 bg-surface border-b border-[rgba(124,45,45,0.08)] shadow-lg p-2.5 max-h-[75vh] overflow-y-auto">
              {[...NAV_ITEMS, { href: "/patient/emergency", icon: AlertTriangle, key: "patient.nav.emergency" }].map(({ href, icon: Icon, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-medium transition-colors",
                    pathname === href ? "bg-blush text-burgundy-700" : "text-ink-secondary hover:bg-blush/50"
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden /> {t(key)}
                </Link>
              ))}
              <div className="pt-2 border-t border-[rgba(124,45,45,0.07)] mt-2">
                <ProfileDropdown />
              </div>
            </nav>
          </div>
        )}

        <div className="pt-14 pb-20 px-4 min-h-screen">{children}</div>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-[rgba(124,45,45,0.08)]" aria-label="Bottom navigation">
          <div className="flex">
            {BOTTOM_NAV.map(({ href, icon: Icon, key }) => {
              const isActive = pathname === href || (href !== "/patient/dashboard" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn("flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors", isActive ? "text-burgundy-700" : "text-ink-tertiary")}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  <span className="text-[10px] font-semibold">{t(key)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
