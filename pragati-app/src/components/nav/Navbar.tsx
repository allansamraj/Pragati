"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X, Video, Shield, Building2, User, Stethoscope, Pill } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// ─── PRAGATI LOGO ─────────────────────────────────────────────────────────────

export function PragatiLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: 20, md: 26, lg: 32 };
  const px = sizes[size];

  return (
    <div className="flex items-center gap-2.5" aria-label="PRAGATI">
      <svg
        width={px}
        height={px}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="32" height="32" rx="8" fill="#7C2D2D" />
        <rect x="14" y="7" width="4" height="18" rx="1.5" fill="white" opacity="0.95" />
        <rect x="7" y="14" width="18" height="4" rx="1.5" fill="white" opacity="0.95" />
        <circle cx="23.5" cy="23.5" r="2.5" fill="#F4B8B8" />
      </svg>

      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-bold tracking-tight text-ink-primary",
            size === "sm" ? "text-[15px]" : size === "md" ? "text-[18px]" : "text-[22px]"
          )}
          style={{ letterSpacing: "-0.02em" }}
        >
          PRAGATI
        </span>
        {size !== "sm" && (
          <span className="text-[10px] font-medium tracking-widest uppercase text-ink-tertiary leading-none mt-0.5">
            Smart Healthcare Access
          </span>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isApp =
    pathname?.startsWith("/patient") ||
    pathname?.startsWith("/doctor") ||
    pathname?.startsWith("/provider") ||
    pathname?.startsWith("/government") ||
    pathname?.startsWith("/login");

  if (isApp) return null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 left-0 right-0 z-40 transition-all duration-200",
          "h-[68px] flex items-center",
          "bg-surface/95 backdrop-blur-md",
          scrolled
            ? "border-b border-[rgba(124,45,45,0.1)] shadow-xs"
            : "border-b border-[rgba(124,45,45,0.06)]"
        )}
        role="banner"
      >
        <div className="section-container w-full flex items-center justify-between gap-6">
          {/* Left — Logo */}
          <Link href="/" aria-label="PRAGATI — Home">
            <PragatiLogo size="md" />
          </Link>

          {/* Center — Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
            <Link
              href="/patient/find-care"
              className="px-3 py-2 rounded-[8px] text-[13.5px] font-semibold text-ink-secondary hover:text-ink-primary hover:bg-blush transition-colors"
            >
              {t("nav.findCare")}
            </Link>
            <Link
              href="/patient/teleconsult"
              className="px-3 py-2 rounded-[8px] text-[13.5px] font-semibold text-burgundy-700 bg-blush/60 hover:bg-blush transition-colors flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              {t("nav.teleconsult")}
            </Link>
            <Link
              href="/login/doctor"
              className="px-3 py-2 rounded-[8px] text-[13.5px] font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 transition-colors flex items-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              Doctor Portal
            </Link>
            <Link
              href="/login/provider"
              className="px-3 py-2 rounded-[8px] text-[13.5px] font-semibold text-ink-secondary hover:text-ink-primary hover:bg-blush transition-colors flex items-center gap-1"
            >
              <Pill className="w-3.5 h-3.5 text-burgundy-700" />
              Pharmacy &amp; Supplies
            </Link>
            <Link
              href="/login/government"
              className="px-3 py-2 rounded-[8px] text-[13.5px] font-semibold text-ink-secondary hover:text-ink-primary hover:bg-blush transition-colors flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              Government
            </Link>
          </nav>

          {/* Right — Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login/patient"
              className="text-[13.5px] font-semibold text-ink-secondary hover:text-ink-primary px-3 py-2 rounded-[8px] hover:bg-blush transition-colors"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/patient/find-care"
              className="inline-flex items-center gap-2 bg-burgundy-700 text-white text-[13.5px] font-semibold px-4 py-[8px] rounded-[9px] hover:bg-burgundy-800 transition-colors shadow-xs"
            >
              {t("nav.findCare")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile — Hamburger */}
          <button
            className="lg:hidden p-2 rounded-[8px] text-ink-secondary hover:bg-blush transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-label="Mobile navigation">
          <div className="absolute inset-0 bg-ink-primary/20" onClick={() => setMobileOpen(false)} />
          <nav className="absolute top-[68px] left-0 right-0 bg-surface border-b border-[rgba(124,45,45,0.1)] shadow-md p-4 flex flex-col gap-1">
            <Link
              href="/patient/find-care"
              className="px-3 py-2.5 rounded-[8px] text-[14px] font-semibold text-ink-primary hover:bg-blush"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.findCare")}
            </Link>
            <Link
              href="/patient/teleconsult"
              className="px-3 py-2.5 rounded-[8px] text-[14px] font-semibold text-burgundy-700 bg-blush flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Video className="w-4 h-4" /> {t("nav.teleconsult")}
            </Link>
            <Link
              href="/login/patient"
              className="px-3 py-2.5 rounded-[8px] text-[14px] font-semibold text-ink-secondary hover:bg-blush"
              onClick={() => setMobileOpen(false)}
            >
              Patient Portal
            </Link>
            <Link
              href="/login/doctor"
              className="px-3 py-2.5 rounded-[8px] text-[14px] font-semibold text-emerald-800 hover:bg-emerald-50"
              onClick={() => setMobileOpen(false)}
            >
              Doctor Consultation Pad
            </Link>
            <Link
              href="/login/provider"
              className="px-3 py-2.5 rounded-[8px] text-[14px] font-semibold text-ink-secondary hover:bg-blush"
              onClick={() => setMobileOpen(false)}
            >
              Pharmacy &amp; Hospital Supplies
            </Link>
            <Link
              href="/login/government"
              className="px-3 py-2.5 rounded-[8px] text-[14px] font-semibold text-ink-secondary hover:bg-blush"
              onClick={() => setMobileOpen(false)}
            >
              Government Health Intelligence
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
