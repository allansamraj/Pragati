"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe, Wifi, WifiOff, RefreshCw, Sparkles,
  CheckCircle2, AlertTriangle, ShieldCheck, User, Stethoscope, Pill, Building2, MapPin
} from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";
import { useConnectivity, type NetworkMode } from "@/lib/connectivity/ConnectivityContext";
import { useLocationContext } from "@/lib/context/LocationContext";

export function TopBar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { mode, setMode } = useConnectivity();
  const { locality, source, refreshGPS, isRefreshing } = useLocationContext();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [connMenuOpen, setConnMenuOpen] = useState(false);

  const LANG_NAMES: Record<Language, string> = {
    en: "English",
    mr: "मराठी (MH)",
    hi: "हिन्दी",
    ta: "தமிழ்",
  };

  const isPatient = pathname?.startsWith("/patient") || pathname === "/login/patient";
  const isDoctor = pathname?.startsWith("/doctor") || pathname === "/login/doctor";
  const isProvider = pathname?.startsWith("/provider") || pathname === "/login/provider";
  const isGov = pathname?.startsWith("/government") || pathname === "/login/government";

  return (
    <aside aria-label="System status and workspace selector" className="bg-gradient-to-r from-[#170E0D] via-[#1F1210] to-[#170E0D] text-white/90 border-b border-white/10 text-[11px] font-medium py-1.5 px-4 sm:px-6 relative z-50 shadow-xs">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Platform Title */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            <span className="font-bold tracking-tight text-white text-[11.5px]">PRAGATI</span>
          </Link>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white/60 hidden sm:inline text-[11px]">
            Public Healthcare Access &amp; Continuity Platform
          </span>
        </div>

        {/* Center: 4 Workspaces Access Pill Switcher */}
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-inner">
          <Link
            href="/login/patient"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
              isPatient
                ? "bg-burgundy-700 text-white shadow-sm ring-1 ring-white/20"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Patient Care & Access Portal"
          >
            <User className="w-3 h-3 text-rose-300" aria-hidden />
            <span>Patient</span>
          </Link>

          <Link
            href="/login/doctor"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
              isDoctor
                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-white/20"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Doctor Consultation Pad & Live OPD Queue"
          >
            <Stethoscope className="w-3 h-3 text-emerald-300" aria-hidden />
            <span>Doctor</span>
          </Link>

          <Link
            href="/login/provider"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
              isProvider
                ? "bg-burgundy-700 text-white shadow-sm ring-1 ring-white/20"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Hospital Central Pharmacy & Diagnostic Labs"
          >
            <Pill className="w-3 h-3 text-amber-300" aria-hidden />
            <span>Pharmacy / Provider</span>
          </Link>

          <Link
            href="/login/government"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
              isGov
                ? "bg-burgundy-700 text-white shadow-sm ring-1 ring-white/20"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title="Maharashtra Government Health Intelligence"
          >
            <Building2 className="w-3 h-3 text-amber-300" aria-hidden />
            <span>Government</span>
          </Link>
        </div>

        {/* Right: Global Location Indicator + Connectivity + Language */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Subtle Global Location Pill */}
          <button
            onClick={() => refreshGPS(true)}
            title={`Location: ${locality} (${source === "CURRENT_GPS" ? "Device GPS" : "Manual Location"}). Click to refresh.`}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 text-[11px] transition-colors cursor-pointer"
          >
            <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <span className="max-w-[130px] truncate">{locality}</span>
            <RefreshCw className={`w-2.5 h-2.5 text-white/50 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Connectivity / 2G Offline Simulator */}
          <div className="relative">
            <button
              onClick={() => {
                setConnMenuOpen(!connMenuOpen);
                setLangMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] border transition-all cursor-pointer ${
                mode === "offline"
                  ? "bg-rose-950/80 border-rose-500/50 text-rose-200 font-bold"
                  : mode === "low-data"
                  ? "bg-amber-950/80 border-amber-500/50 text-amber-200 font-bold"
                  : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {mode === "offline" ? (
                <WifiOff className="w-3 h-3 text-rose-400" aria-hidden />
              ) : (
                <Wifi className="w-3 h-3 text-emerald-400" aria-hidden />
              )}
              <span className="capitalize">{mode === "low-data" ? "2G Rural" : mode}</span>
            </button>

            {connMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#1F1210] border border-white/15 rounded-[10px] shadow-2xl p-2 z-50 text-white space-y-1">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-white/50 tracking-wider">
                  Network Simulator
                </div>
                {[
                  { id: "online", label: "Fast Online", desc: "Real-time sync" },
                  { id: "low-data", label: "2G Rural Mode", desc: "Text-first low bandwidth" },
                  { id: "offline", label: "Offline Mode", desc: "Queue local actions & cache" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMode(item.id as NetworkMode);
                      setConnMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-[7px] transition-colors cursor-pointer ${
                      mode === item.id ? "bg-burgundy-700 text-white" : "hover:bg-white/10 text-white/80"
                    }`}
                  >
                    <div className="font-bold text-[12px]">{item.label}</div>
                    <div className="text-[10px] text-white/60">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setConnMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-white/5 border border-white/15 text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              <span>{LANG_NAMES[language]}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#1F1210] border border-white/15 rounded-[10px] shadow-2xl p-1 z-50 text-white space-y-0.5">
                {(Object.keys(LANG_NAMES) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
                      language === lang ? "bg-burgundy-700 text-white font-bold" : "hover:bg-white/10 text-white/80"
                    }`}
                  >
                    {LANG_NAMES[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
