"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, ShieldCheck } from "lucide-react";
import { sessionService } from "@/lib/auth/sessionService";
import { authService } from "@/lib/auth/authService";
import type { UserRole } from "@/lib/auth/types";

const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  doctor: "Doctor / Clinician",
  provider: "Pharmacy & Supplies",
  government: "Government",
};

const ROLE_COLORS: Record<UserRole, string> = {
  patient: "bg-blush text-burgundy-700",
  doctor: "bg-emerald-50 text-emerald-700",
  provider: "bg-amber-50 text-amber-800",
  government: "bg-[#1C1917] text-white",
};

export function ProfileDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const session = sessionService.get();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session) return null;

  const { user, role, isDemoSession } = session;
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    const loginUrl = authService.logout(role);
    router.push(loginUrl);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] hover:bg-blush transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="w-7 h-7 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-burgundy-700">{initials}</span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-[12px] font-semibold text-ink-primary leading-none">{user.name.split(" ")[0]}</div>
          <div className="text-[10px] text-ink-tertiary leading-none mt-0.5">{ROLE_LABELS[role]}</div>
        </div>
        <ChevronDown className={`w-3 h-3 text-ink-tertiary transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-[rgba(124,45,45,0.1)] rounded-[12px] shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[rgba(124,45,45,0.07)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-bold text-burgundy-700">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-ink-primary truncate">{user.name}</div>
                <div className="text-[11px] text-ink-tertiary truncate">{user.email}</div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-widest rounded px-1.5 py-0.5 ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
              {isDemoSession && (
                <span className="text-[10px] font-semibold text-limited-500 bg-limited-50 border border-limited-100 rounded px-1.5 py-0.5">
                  Demo
                </span>
              )}
            </div>
            {role === "patient" && user.abhaId && (
              <div className="mt-2 text-[11px] text-ink-tertiary">ABHA: {user.abhaId}</div>
            )}
            {role === "provider" && user.facilityName && (
              <div className="mt-2 text-[11px] text-ink-tertiary">{user.facilityName}</div>
            )}
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <button
              onClick={() => { setOpen(false); router.push(`/${role}/profile`); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[13px] text-ink-secondary hover:bg-blush hover:text-ink-primary transition-colors text-left"
            >
              <User className="w-3.5 h-3.5 text-ink-tertiary" aria-hidden />
              View Profile
            </button>
            <div className="h-px bg-[rgba(124,45,45,0.07)] my-1" />
            <div className="flex items-center gap-2 px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5 text-available-500 flex-shrink-0" aria-hidden />
              <span className="text-[11px] text-ink-tertiary">Secure session · Role-based access</span>
            </div>
            <div className="h-px bg-[rgba(124,45,45,0.07)] my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[13px] text-critical-500 hover:bg-critical-50 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
