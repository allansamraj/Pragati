"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, AlertTriangle, TrendingDown, Eye, Activity, ShieldCheck, Building2, Users } from "lucide-react";

type AccessLevel = "good" | "moderate" | "gap";

const DISTRICTS: { id: string; name: string; access: AccessLevel; score: number; cx: number; cy: number }[] = [
  { id: "mh-nagpur",    name: "Nagpur",    access: "good",     score: 84, cx: 370, cy: 120 },
  { id: "mh-amravati",  name: "Amravati",  access: "moderate", score: 67, cx: 290, cy: 115 },
  { id: "mh-aurangabad",name: "Chhatrapati Sambhajinagar", access: "moderate", score: 61, cx: 230, cy: 175 },
  { id: "mh-nashik",    name: "Nashik",    access: "good",     score: 78, cx: 140, cy: 145 },
  { id: "mh-pune",      name: "Pune",      access: "good",     score: 88, cx: 150, cy: 230 },
  { id: "mh-mumbai",    name: "Mumbai",    access: "good",     score: 92, cx: 70,  cy: 215 },
  { id: "mh-nandurbar", name: "Nandurbar", access: "gap",      score: 42, cx: 120, cy: 100 },
  { id: "mh-gadchiroli", name: "Gadchiroli", access: "gap",    score: 38, cx: 420, cy: 185 },
  { id: "mh-palghar",   name: "Palghar",   access: "moderate", score: 55, cx: 75,  cy: 165 },
  { id: "mh-solapur",   name: "Solapur",   access: "moderate", score: 63, cx: 205, cy: 275 },
  { id: "mh-kolhapur",  name: "Kolhapur",  access: "good",     score: 76, cx: 130, cy: 305 },
  { id: "mh-latur",     name: "Latur",     access: "gap",      score: 48, cx: 260, cy: 290 },
  { id: "mh-akola",     name: "Akola",     access: "moderate", score: 58, cx: 310, cy: 145 },
  { id: "mh-chandrapur",name: "Chandrapur",access: "moderate", score: 62, cx: 390, cy: 230 },
];

const ACCESS_COLOR: Record<AccessLevel, { fill: string; stroke: string; text: string }> = {
  good:     { fill: "#DCFCE7", stroke: "#166534", text: "text-emerald-700" },
  moderate: { fill: "#FEF3C7", stroke: "#B45309", text: "text-amber-700" },
  gap:      { fill: "#FEE2E2", stroke: "#B91C1C", text: "text-rose-700" },
};

const ACCESS_LABEL: Record<AccessLevel, string> = {
  good: "Good access (75%+)",
  moderate: "Moderate gap (50-74%)",
  gap: "High gap (<50%)",
};

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
  const [selectedDistrict, setSelectedDistrict] = useState<typeof DISTRICTS[0] | null>(null);

  return (
    <div className="space-y-6 max-w-[1300px]">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">
            Government Command Dashboard
          </p>
          <h1 className="text-[26px] font-extrabold text-ink-primary tracking-tight">
            Maharashtra Healthcare Intelligence
          </h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Public healthcare accessibility, capacity &amp; resource surveillance — Demo Data
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
        {/* MAP */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] overflow-hidden shadow-2xs"
        >
          <div className="px-5 py-4 border-b border-[rgba(124,45,45,0.06)] flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-ink-primary">Healthcare Accessibility — Maharashtra</h2>
              <p className="text-[11.5px] text-ink-secondary mt-0.5">Click a district for details · Prototype surveillance data</p>
            </div>
            <Link href="/government/map" className="text-[12px] font-bold text-burgundy-700 hover:underline flex items-center gap-1">
              Full Map <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {(Object.keys(ACCESS_COLOR) as AccessLevel[]).map((a) => (
                <div key={a} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs border" style={{ background: ACCESS_COLOR[a].fill, borderColor: ACCESS_COLOR[a].stroke }} aria-hidden />
                  <span className="text-[11.5px] font-medium text-ink-secondary">{ACCESS_LABEL[a]}</span>
                </div>
              ))}
            </div>

            {/* SVG Map */}
            <div className="relative bg-[#F8F5F2] border border-[rgba(124,45,45,0.08)] rounded-[12px] overflow-hidden" style={{ paddingBottom: "60%" }}>
              <svg
                viewBox="0 0 500 320"
                className="absolute inset-0 w-full h-full"
                aria-label="Maharashtra district healthcare accessibility map"
                role="img"
              >
                {/* Background outline — simplified Maharashtra shape */}
                <path
                  d="M80,80 Q100,60 140,55 Q180,50 220,60 Q260,55 300,65 Q340,60 380,75 Q420,85 450,110 Q460,145 455,185 Q445,220 420,250 Q390,280 350,295 Q310,310 270,315 Q230,310 200,300 Q170,285 145,270 Q120,255 100,235 Q70,210 60,180 Q50,150 55,120 Q60,100 80,80Z"
                  fill="#EDE6E1"
                  stroke="rgba(124,45,45,0.18)"
                  strokeWidth="1.5"
                />
                {/* District dots */}
                {DISTRICTS.map((d) => {
                  const cfg = ACCESS_COLOR[d.access];
                  const isSelected = selectedDistrict?.id === d.id;
                  return (
                    <g key={d.id} onClick={() => setSelectedDistrict(isSelected ? null : d)} style={{ cursor: "pointer" }}>
                      <circle
                        cx={d.cx} cy={d.cy} r={isSelected ? 14 : 11}
                        fill={cfg.fill}
                        stroke={cfg.stroke}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        opacity={0.95}
                      />
                      <text x={d.cx} y={d.cy + 4} textAnchor="middle" fontSize={isSelected ? 8.5 : 7.5} fontWeight="700" fill={cfg.stroke} aria-hidden>
                        {d.score}
                      </text>
                      {isSelected && (
                        <text x={d.cx} y={d.cy + 26} textAnchor="middle" fontSize={8.5} fontWeight="bold" fill="#161210" aria-hidden>
                          {d.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected district detail */}
            {selectedDistrict && (
              <div className="mt-4 p-4 bg-bg border border-[rgba(124,45,45,0.1)] rounded-[10px]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[15px] font-bold text-ink-primary">{selectedDistrict.name}</div>
                    <div className={`text-[11.5px] font-semibold mt-0.5 ${ACCESS_COLOR[selectedDistrict.access].text}`}>
                      {ACCESS_LABEL[selectedDistrict.access]}
                    </div>
                  </div>
                  <div className="text-[28px] font-extrabold font-mono text-ink-primary">{selectedDistrict.score}%</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[
                    { label: "Healthcare Accessibility", val: `${selectedDistrict.score}%` },
                    { label: "Specialist Availability", val: selectedDistrict.score < 50 ? "LOW" : selectedDistrict.score < 70 ? "MODERATE" : "GOOD" },
                    { label: "Diagnostics", val: selectedDistrict.score < 50 ? "LIMITED" : "MODERATE" },
                    { label: "Teleconsultation", val: "AVAILABLE" },
                  ].map((item) => (
                    <div key={item.label} className="p-2 bg-white rounded-[6px] border border-[rgba(124,45,45,0.06)]">
                      <span className="text-[10px] uppercase font-bold text-ink-tertiary block">{item.label}</span>
                      <span className="font-bold text-ink-primary">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
