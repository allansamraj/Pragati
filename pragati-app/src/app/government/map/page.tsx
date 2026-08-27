"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type AccessLevel = "good" | "moderate" | "gap";

const DISTRICTS: { name: string; district: string; access: AccessLevel; score: number; specialists: string; diagnostics: string; medicines: string; tele: boolean }[] = [
  { name: "Mumbai",      district: "Mumbai City",    access: "good",     score: 92, specialists: "HIGH",     diagnostics: "HIGH",     medicines: "GOOD",   tele: true },
  { name: "Pune",        district: "Pune",           access: "good",     score: 88, specialists: "HIGH",     diagnostics: "HIGH",     medicines: "GOOD",   tele: true },
  { name: "Nagpur",      district: "Nagpur",         access: "good",     score: 84, specialists: "MODERATE", diagnostics: "HIGH",     medicines: "GOOD",   tele: true },
  { name: "Nashik",      district: "Nashik",         access: "good",     score: 78, specialists: "MODERATE", diagnostics: "MODERATE", medicines: "GOOD",   tele: true },
  { name: "Kolhapur",    district: "Kolhapur",       access: "good",     score: 76, specialists: "MODERATE", diagnostics: "MODERATE", medicines: "GOOD",   tele: false },
  { name: "Aurangabad",  district: "Chhatrapati Sambhajinagar", access: "moderate", score: 67, specialists: "LOW", diagnostics: "MODERATE", medicines: "MODERATE", tele: true },
  { name: "Solapur",     district: "Solapur",        access: "moderate", score: 63, specialists: "LOW",      diagnostics: "MODERATE", medicines: "MODERATE", tele: false },
  { name: "Akola",       district: "Akola",          access: "moderate", score: 58, specialists: "LOW",      diagnostics: "LIMITED",  medicines: "MODERATE", tele: false },
  { name: "Palghar",     district: "Palghar",        access: "moderate", score: 55, specialists: "LOW",      diagnostics: "LIMITED",  medicines: "LIMITED", tele: false },
  { name: "Latur",       district: "Latur",          access: "gap",      score: 48, specialists: "CRITICAL", diagnostics: "LIMITED",  medicines: "LIMITED", tele: false },
  { name: "Nandurbar",   district: "Nandurbar",      access: "gap",      score: 42, specialists: "CRITICAL", diagnostics: "LIMITED",  medicines: "LIMITED", tele: false },
  { name: "Gadchiroli",  district: "Gadchiroli",     access: "gap",      score: 38, specialists: "CRITICAL", diagnostics: "CRITICAL", medicines: "LIMITED", tele: false },
];

const ACCESS_LABEL: Record<AccessLevel, string> = { good: "Good access", moderate: "Moderate gap", gap: "High gap" };
const ACCESS_STYLE: Record<AccessLevel, string> = {
  good: "bg-available-50 text-available-600 border-available-100",
  moderate: "bg-limited-50 text-limited-600 border-limited-100",
  gap: "bg-critical-50 text-critical-500 border-critical-100",
};

export default function MapPage() {
  const [filter, setFilter] = useState<"all" | AccessLevel>("all");
  const filtered = DISTRICTS.filter((d) => filter === "all" || d.access === filter);

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1">Government</p>
        <h1 className="text-[24px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
          Healthcare Accessibility — Maharashtra
        </h1>
        <p className="text-[12px] text-white/40 mt-1">Prototype data only — not actual government statistics</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "good", "moderate", "gap"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-[7px] border transition-colors ${filter === f ? "bg-burgundy-700 text-white border-burgundy-700" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}
          >
            {f === "all" ? "All Districts" : ACCESS_LABEL[f as AccessLevel]}
          </button>
        ))}
      </div>

      {/* District list */}
      <div className="bg-[#242019]/60 border border-white/8 rounded-[14px] overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.map((d) => (
            <div key={d.name} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 text-right">
                <span className="text-[20px] font-bold font-mono text-white">{d.score}</span>
                <span className="text-[10px] text-white/40 block">%</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[14px] font-bold text-white">{d.name}</div>
                  <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${ACCESS_STYLE[d.access]}`}>{ACCESS_LABEL[d.access]}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/50 flex-wrap">
                  <span>Specialists: <span className="font-bold">{d.specialists}</span></span>
                  <span>Diagnostics: <span className="font-bold">{d.diagnostics}</span></span>
                  <span>Medicines: <span className="font-bold">{d.medicines}</span></span>
                  {d.tele && <span className="text-available-500 font-bold">Tele ✓</span>}
                </div>
              </div>
              <Link href="/government/dashboard" className="text-[11px] font-semibold text-burgundy-400 hover:underline flex items-center gap-0.5 flex-shrink-0">
                View <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-white/25">DEMO DATA · All data shown is for prototype demonstration only and does not represent actual Maharashtra government healthcare statistics.</p>
    </div>
  );
}
