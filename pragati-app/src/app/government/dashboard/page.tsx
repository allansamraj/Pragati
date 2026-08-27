"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, AlertTriangle, TrendingDown, Eye } from "lucide-react";

// ─── MAHARASHTRA SVG MAP ──────────────────────────────────────────────────────
// Simplified representative district zones — NOT geographically accurate
// All data is DEMO only

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
  good:     { fill: "#DCFCE7", stroke: "#2D7A4F", text: "text-available-600" },
  moderate: { fill: "#FEF9EC", stroke: "#B07A2D", text: "text-limited-500" },
  gap:      { fill: "#FFF0F0", stroke: "#8B1F1F", text: "text-critical-500" },
};

const ACCESS_LABEL: Record<AccessLevel, string> = {
  good: "Good access",
  moderate: "Moderate gap",
  gap: "High gap",
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
  high:   { label: "HIGH PRIORITY",   cls: "border-l-rose-500 bg-rose-950/40 border border-rose-500/20", badge: "bg-rose-500 text-white font-bold", icon: AlertTriangle },
  medium: { label: "MEDIUM PRIORITY", cls: "border-l-amber-500 bg-amber-950/40 border border-amber-500/20", badge: "bg-amber-500 text-black font-bold",  icon: TrendingDown },
  watch:  { label: "WATCH",           cls: "border-l-cyan-500 bg-cyan-950/40 border border-cyan-500/20",   badge: "bg-cyan-600 text-white font-bold",  icon: Eye },
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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1">Government Dashboard</p>
          <h1 className="text-[26px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
            Maharashtra Healthcare Intelligence
          </h1>
          <p className="text-[13px] text-white/50 mt-1">Public healthcare accessibility and capacity — Demo Data</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/40">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden />
          Updated 5 min ago
        </div>
      </div>

      {/* ── KPIS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {KPIS.map((k) => (
          <div key={k.label} className="bg-[#242019]/60 border border-white/8 rounded-[12px] p-4">
            <div className="text-[26px] font-bold font-mono text-white leading-none mb-1.5">{k.value}</div>
            <div className="text-[11px] font-semibold text-white/70">{k.label}</div>
            {k.trend === "up" && <div className="text-[10px] text-critical-400 mt-0.5">↑ Needs attention</div>}
          </div>
        ))}
      </motion.div>

      {/* ── MAP + INSIGHTS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* MAP */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-[#242019]/60 border border-white/8 rounded-[14px] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-bold text-white">Healthcare Accessibility — Maharashtra</h2>
              <p className="text-[11px] text-white/40 mt-0.5">Click a district for details · Prototype data only</p>
            </div>
            <Link href="/government/map" className="text-[12px] font-semibold text-burgundy-400 hover:underline flex items-center gap-1">
              Full Map <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {(Object.keys(ACCESS_COLOR) as AccessLevel[]).map((a) => (
                <div key={a} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm border" style={{ background: ACCESS_COLOR[a].fill, borderColor: ACCESS_COLOR[a].stroke }} aria-hidden />
                  <span className="text-[11px] text-white/60">{ACCESS_LABEL[a]}</span>
                </div>
              ))}
            </div>

            {/* SVG Map */}
            <div className="relative bg-[#1A1714] rounded-[10px] overflow-hidden" style={{ paddingBottom: "60%" }}>
              <svg
                viewBox="0 0 500 320"
                className="absolute inset-0 w-full h-full"
                aria-label="Maharashtra district healthcare accessibility map"
                role="img"
              >
                {/* Background outline — simplified Maharashtra shape */}
                <path
                  d="M80,80 Q100,60 140,55 Q180,50 220,60 Q260,55 300,65 Q340,60 380,75 Q420,85 450,110 Q460,145 455,185 Q445,220 420,250 Q390,280 350,295 Q310,310 270,315 Q230,310 200,300 Q170,285 145,270 Q120,255 100,235 Q70,210 60,180 Q50,150 55,120 Q60,100 80,80Z"
                  fill="#252219"
                  stroke="rgba(255,255,255,0.1)"
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
                        opacity={0.9}
                      />
                      <text x={d.cx} y={d.cy + 4} textAnchor="middle" fontSize={isSelected ? 8.5 : 7.5} fontWeight="700" fill={cfg.stroke} aria-hidden>
                        {d.score}
                      </text>
                      {isSelected && (
                        <text x={d.cx} y={d.cy + 26} textAnchor="middle" fontSize={8} fontWeight="600" fill="rgba(255,255,255,0.7)" aria-hidden>
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
              <div className="mt-4 p-4 bg-[#1A1714] border border-white/10 rounded-[10px]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[15px] font-bold text-white">{selectedDistrict.name}</div>
                    <div className={`text-[11px] font-semibold mt-0.5 ${ACCESS_COLOR[selectedDistrict.access].text}`}>
                      {ACCESS_LABEL[selectedDistrict.access]}
                    </div>
                  </div>
                  <div className="text-[28px] font-bold font-mono text-white">{selectedDistrict.score}%</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Healthcare Accessibility", val: `${selectedDistrict.score}%` },
                    { label: "Specialist Availability", val: selectedDistrict.score < 50 ? "LOW" : selectedDistrict.score < 70 ? "MODERATE" : "GOOD" },
                    { label: "Diagnostics", val: selectedDistrict.score < 50 ? "LIMITED" : "MODERATE" },
                    { label: "Teleconsultation", val: "AVAILABLE" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-[7px] p-2.5">
                      <div className="text-[10px] text-white/40">{item.label}</div>
                      <div className="text-[12px] font-bold text-white mt-0.5">{item.val}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/25 mt-3">Prototype data · Not actual government statistics</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Priority Insights */}
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-[#242019]/60 border border-white/8 rounded-[14px] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-[14px] font-bold text-white">Priority Insights</h2>
              <p className="text-[11px] text-white/40 mt-0.5">Demo data — not real government recommendations</p>
            </div>
            <div className="p-3 space-y-2.5">
              {INSIGHTS.map((ins, i) => {
                const cfg = INSIGHT_CFG[ins.level];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`border-l-[3px] pl-3 pr-3 py-3 rounded-r-[8px] ${cfg.cls}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-[13px] font-bold text-white">{ins.district}</div>
                    <div className="text-[11.5px] text-slate-200 mt-0.5 font-medium">{ins.issue}</div>
                    <div className="text-[10.5px] text-amber-300 mt-1.5 font-semibold">→ {ins.action}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Facility network */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-[#242019]/60 border border-white/8 rounded-[14px] p-5"
          >
            <h2 className="text-[14px] font-bold text-white mb-4">Care Pathway Network</h2>
            <div className="space-y-1.5">
              {[
                "Aayushman Arogya Mandir",
                "Primary Health Centre (PHC)",
                "Rural Hospital",
                "Sub-District Hospital",
                "District Hospital",
                "Specialist / Medical College",
              ].map((level, i, arr) => (
                <div key={level}>
                  <div className="flex items-center gap-2.5 py-2 px-3 bg-white/5 border border-white/8 rounded-[7px]">
                    <div className="w-5 h-5 rounded-full bg-burgundy-700/40 border border-burgundy-700/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-burgundy-300">{i + 1}</span>
                    </div>
                    <span className="text-[12px] text-white/70 font-medium">{level}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <div className="w-px h-3 bg-white/15" aria-hidden />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── WORKLOAD SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#242019]/60 border border-white/8 rounded-[14px] p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-bold text-white">Facility Workload — Maharashtra</h2>
          <Link href="/government/analytics" className="text-[12px] font-semibold text-burgundy-400 hover:underline flex items-center gap-1">
            Full Analytics <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3.5">
          {WORKLOAD.map((w) => (
            <div key={w.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-white/70">{w.label}</span>
                <span className="text-[12px] font-bold font-mono text-white">{w.pct}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${w.pct > 75 ? "bg-critical-500" : w.pct > 60 ? "bg-limited-500" : "bg-available-500"}`}
                  style={{ width: `${w.pct}%` }}
                  role="progressbar"
                  aria-valuenow={w.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${w.label}: ${w.pct}% workload`}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/25 mt-4">Demo data — not actual Maharashtra government statistics</p>
      </motion.div>
    </div>
  );
}
