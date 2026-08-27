"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, AlertTriangle, TrendingDown, Eye, Activity, ShieldCheck, Building2, Users } from "lucide-react";
import { MaharashtraRealTimeMap, DistrictMetric } from "@/components/shared/MaharashtraRealTimeMap";
import { useLocationContext } from "@/lib/context/LocationContext";

const KPIS = [
  { label: "Facilities Monitored",  value: "1,284", trend: null },
  { label: "Doctors Available",     value: "8,420", trend: null },
  { label: "Critical Shortages",    value: "37",    trend: "up" },
  { label: "Pending Referrals",     value: "2,184", trend: null },
  { label: "Underserved Areas",     value: "64",    trend: "up" },
];

const INSIGHTS: { level: "high" | "medium" | "watch"; district: string; issue: string; action: string }[] = [
  { level: "high",   district: "Nandurbar",   issue: "Cardiology specialist availability below threshold. Coverage at 42%.", action: "Expand specialist availability or teleconsultation capacity." },
  { level: "medium", district: "Gadchiroli",  issue: "Diagnostic availability gap detected. CT scan and X-Ray limited.", action: "Review diagnostic equipment supply and technician availability." },
  { level: "watch",  district: "Palghar",     issue: "OPD workload increasing month-on-month. Facility at 88% capacity.", action: "Monitor facility workload, consider temporary capacity expansion." },
  { level: "medium", district: "Latur",       issue: "Medicine shortage reported: Metformin, Insulin at critical levels.", action: "Priority supply request for diabetes medications." },
];

const INSIGHT_CFG = {
  high:   { label: "HIGH PRIORITY",   cls: "border-l-rose-500 bg-rose-50/70 border border-rose-200/80", badge: "bg-rose-600 text-white font-bold", icon: AlertTriangle },
  medium: { label: "MEDIUM PRIORITY", cls: "border-l-amber-500 bg-amber-50/70 border border-amber-200/80", badge: "bg-amber-600 text-white font-bold",  icon: TrendingDown },
  watch:  { label: "WATCH",           cls: "border-l-cyan-500 bg-cyan-50/70 border border-cyan-200/80",   badge: "bg-cyan-700 text-white font-bold",  icon: Eye },
};

const WORKLOAD = [
  { label: "District Hospitals",        pct: 78 },
  { label: "Sub-District Hospitals",    pct: 65 },
  { label: "Rural Hospitals",           pct: 72 },
  { label: "PHC",                       pct: 58 },
  { label: "Aayushman Arogya Mandir",   pct: 44 },
];

export default function GovernmentDashboard() {
  const { governmentLocation } = useLocationContext();
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictMetric | null>(null);

  return (
    <div className="space-y-6 max-w-[1300px]">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">
            Government Command Dashboard · {governmentLocation.state} Health Command
          </p>
          <h1 className="text-[26px] font-extrabold text-ink-primary tracking-tight">
            {governmentLocation.state} Healthcare Intelligence · {governmentLocation.district}
          </h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Administrative surveillance, facility capacity, and public health telemetry across {governmentLocation.district}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-ink-tertiary bg-white border border-[rgba(124,45,45,0.08)] rounded-[8px] px-3 py-1.5 shadow-2xs">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden />
          Updated 5 min ago
        </div>
      </div>

      {/* ── KPIS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5"
      >
        {KPIS.map((k) => (
          <div key={k.label} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4 shadow-2xs">
            <div className="text-[26px] font-extrabold font-mono text-ink-primary leading-none mb-1.5">{k.value}</div>
            <div className="text-[12px] font-semibold text-ink-secondary">{k.label}</div>
            {k.trend === "up" && (
              <div className="text-[10.5px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Needs attention
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* ── MAP + INSIGHTS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* REAL INTERACTIVE OPENSTREETMAP */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15.5px] font-bold text-ink-primary">Healthcare Accessibility — Maharashtra</h2>
              <p className="text-[12px] text-ink-secondary mt-0.5">Real-time geographic surveillance map with district telemetry</p>
            </div>
            <Link href="/government/map" className="text-[12px] font-bold text-burgundy-700 hover:underline flex items-center gap-1">
              Full Map View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MaharashtraRealTimeMap onSelectDistrict={setSelectedDistrict} />
        </motion.div>

        {/* PRIORITY INSIGHTS */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-4 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-[15px] font-bold text-ink-primary">Priority Insights</h2>
            <p className="text-[11.5px] text-ink-secondary mt-0.5">Surveillance observations &amp; recommended actions</p>
          </div>

          <div className="space-y-3">
            {INSIGHTS.map((ins) => {
              const cfg = INSIGHT_CFG[ins.level];
              return (
                <div key={ins.district} className={`p-3 rounded-[8px] border-l-4 ${cfg.cls}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[12.5px] text-ink-primary">{ins.district}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p className="text-[11.5px] text-ink-secondary leading-snug">{ins.issue}</p>
                  <p className="text-[11px] font-semibold text-burgundy-700 mt-1">→ {ins.action}</p>
                </div>
              );
            })}
          </div>

          <Link
            href="/government/shortages"
            className="w-full py-2 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] text-ink-primary rounded-[8px] text-[12px] font-bold text-center block transition-colors"
          >
            View All Shortages &amp; Alerts →
          </Link>
        </motion.div>
      </div>

      {/* ── WORKLOAD CAPACITY BARS ── */}
      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-3">
        <h3 className="text-[14px] font-bold text-ink-primary">Public Healthcare Tier Workload &amp; Capacity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
          {WORKLOAD.map((w) => (
            <div key={w.label} className="p-3 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.06)] space-y-1.5">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-ink-primary">{w.label}</span>
                <span className="font-mono font-bold text-ink-primary">{w.pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${w.pct > 75 ? "bg-rose-500" : w.pct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${w.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
