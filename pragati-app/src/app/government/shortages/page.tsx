"use client";
import React from "react";
import Link from "next/link";
import { AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";

const SHORTAGES = [
  { district: "Gadchiroli",  type: "Specialist",  resource: "No Cardiologist", severity: "critical", action: "Assign specialist or enable teleconsultation" },
  { district: "Nandurbar",   type: "Specialist",  resource: "No Gynaecologist", severity: "critical", action: "Expedite specialist posting" },
  { district: "Latur",       type: "Medicine",    resource: "Metformin, Insulin out of stock", severity: "critical", action: "Priority supply request" },
  { district: "Gadchiroli",  type: "Diagnostic",  resource: "No CT Scan available", severity: "high", action: "Review equipment supply" },
  { district: "Palghar",     type: "Medicine",    resource: "ORS, Amoxicillin limited", severity: "high", action: "Initiate resupply" },
  { district: "Akola",       type: "Diagnostic",  resource: "X-Ray machine down", severity: "medium", action: "Schedule maintenance" },
  { district: "Latur",       type: "Doctor",      resource: "General Medicine — 40% vacancy", severity: "medium", action: "Prioritise recruitment" },
];

const S_CFG = {
  critical: { dot: "bg-critical-500", border: "border-l-critical-500", bg: "bg-critical-50/10", badge: "bg-critical-500 text-white", label: "Critical" },
  high:     { dot: "bg-limited-500",  border: "border-l-limited-500",  bg: "bg-limited-50/10",  badge: "bg-limited-500 text-white",  label: "High" },
  medium:   { dot: "bg-ink-tertiary", border: "border-l-white/20",     bg: "bg-white/3",        badge: "bg-white/20 text-white/70",  label: "Medium" },
};

export default function ShortagesPage() {
  return (
    <div className="space-y-5 max-w-[900px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1">Government</p>
        <h1 className="text-[24px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Resource Shortages</h1>
        <p className="text-[11px] text-white/40 mt-1">DEMO DATA — not actual government data</p>
      </div>
      <div className="space-y-3">
        {SHORTAGES.map((s, i) => {
          const cfg = S_CFG[s.severity as keyof typeof S_CFG];
          return (
            <div key={i} className={`border-l-[3px] pl-4 pr-5 py-4 rounded-r-[12px] ${cfg.border} ${cfg.bg} border border-white/8`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.badge}`}>{cfg.label}</span>
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{s.type}</span>
                  </div>
                  <div className="text-[14px] font-bold text-white">{s.district}</div>
                  <div className="text-[12px] text-white/60 mt-0.5">{s.resource}</div>
                  <div className="text-[11px] text-white/40 mt-1.5 italic">→ {s.action}</div>
                </div>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-1 ${s.severity === "critical" ? "text-critical-400" : s.severity === "high" ? "text-limited-400" : "text-white/30"}`} aria-hidden />
              </div>
            </div>
          );
        })}
      </div>
      <Link href="/government/analytics" className="flex items-center gap-2 text-[12px] font-semibold text-burgundy-400 hover:underline">
        View full analytics <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
