"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, MessageSquare, Stethoscope, Pill, Building2 } from "lucide-react";
import { UserRole } from "@/lib/ai/types";
import { sessionService } from "@/lib/auth/sessionService";
import { ChatPanel } from "./ChatPanel";

export function PragatiAssist() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>("patient");

  // Determine active role from pathname and session
  useEffect(() => {
    if (pathname?.startsWith("/doctor") || pathname === "/login/doctor") {
      setActiveRole("doctor");
    } else if (pathname?.startsWith("/provider") || pathname === "/login/provider") {
      setActiveRole("provider");
    } else if (pathname?.startsWith("/government") || pathname === "/login/government") {
      setActiveRole("government");
    } else {
      const session = sessionService.get();
      if (session?.role) {
        setActiveRole(session.role as UserRole);
      } else {
        setActiveRole("patient");
      }
    }
  }, [pathname]);

  const getRoleTheme = () => {
    switch (activeRole) {
      case "doctor":
        return {
          btnBg: "bg-emerald-700 hover:bg-emerald-800",
          border: "border-emerald-500/30",
          ring: "ring-emerald-500/20",
          label: "Clinical Assist",
          icon: <Stethoscope className="w-5 h-5" />,
        };
      case "provider":
        return {
          btnBg: "bg-amber-700 hover:bg-amber-800",
          border: "border-amber-500/30",
          ring: "ring-amber-500/20",
          label: "Operations Assist",
          icon: <Pill className="w-5 h-5" />,
        };
      case "government":
        return {
          btnBg: "bg-[#1E3A8A] hover:bg-blue-900",
          border: "border-blue-500/30",
          ring: "ring-blue-500/20",
          label: "Health Intelligence",
          icon: <Building2 className="w-5 h-5" />,
        };
      case "patient":
      default:
        return {
          btnBg: "bg-burgundy-700 hover:bg-burgundy-800",
          border: "border-burgundy-500/30",
          ring: "ring-burgundy-500/20",
          label: "PRAGATI Care",
          icon: <Sparkles className="w-5 h-5" />,
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <>
      {/* ── FLOATING LAUNCHER BUTTON (Bottom Right) ── */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-full text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-200 border ${theme.btnBg} ${theme.border} ring-4 ${theme.ring} cursor-pointer hover:scale-105 active:scale-95`}
            aria-label="Open PRAGATI Role-Aware AI Assistant"
          >
            <div className="relative">
              {theme.icon}
              <span className="w-2 h-2 rounded-full bg-emerald-400 border-2 border-burgundy-900 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <span className="text-[12px] block font-extrabold tracking-tight">PRAGATI Assist</span>
              <span className="text-[9px] text-white/80 block uppercase tracking-wider font-semibold">
                {theme.label}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* ── CHAT PANEL (Neatly Sized 415px with optimal alignment) ── */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 w-full sm:w-[415px] h-full sm:h-[600px] sm:max-h-[calc(100vh-80px)] shadow-2xl rounded-none sm:rounded-[18px] overflow-hidden border border-[rgba(124,45,45,0.18)] flex flex-col bg-surface animate-in fade-in slide-in-from-bottom-4 duration-200">
          <ChatPanel role={activeRole} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
