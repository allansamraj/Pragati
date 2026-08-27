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
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  gap: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function MapPage() {
  const [filter, setFilter] = useState<"all" | AccessLevel>("all");
  const filtered = DISTRICTS.filter((d) => filter === "all" || d.access === filter);

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Government Surveillance</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">
          Healthcare Accessibility — Maharashtra
        </h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Prototype surveillance data — not actual government statistics</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "good", "moderate", "gap"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[12px] font-bold px-3 py-1.5 rounded-[7px] border transition-colors cursor-pointer ${
              filter === f
                ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                : "bg-white border-[rgba(124,45,45,0.12)] text-ink-secondary hover:bg-blush"
            }`}
          >
            {f === "all" ? "All Districts" : ACCESS_LABEL[f as AccessLevel]}
          </button>
        ))}
      </div>

      {/* District list */}
      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] overflow-hidden shadow-2xs">
        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {filtered.map((d) => (
            <div key={d.name} className="flex items-center gap-4 px-5 py-4 hover:bg-bg/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14px] font-bold text-ink-primary">{d.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${ACCESS_STYLE[d.access]}`}>
                    {ACCESS_LABEL[d.access]}
                  </span>
                </div>
                <div className="text-[11.5px] text-ink-secondary">
                  Specialists: <strong>{d.specialists}</strong> · Diagnostics: <strong>{d.diagnostics}</strong> · Medicines: <strong>{d.medicines}</strong>
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <div className="text-[22px] font-extrabold font-mono text-ink-primary">{d.score}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
