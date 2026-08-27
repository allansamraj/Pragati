"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MaharashtraRealTimeMap, MAHARASHTRA_DISTRICTS, DistrictMetric } from "@/components/shared/MaharashtraRealTimeMap";

const ACCESS_LABEL: Record<string, string> = { good: "Good access", moderate: "Moderate gap", gap: "High gap" };
const ACCESS_STYLE: Record<string, string> = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  gap: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function MapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictMetric | null>(null);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Statewide Spatial Surveillance</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">
          Maharashtra Healthcare Accessibility Map
        </h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">
          Interactive real-time OpenStreetMap with district-level specialist density, diagnostics availability, and facility capacity
        </p>
      </div>

      {/* Real Map Card */}
      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-3">
        <MaharashtraRealTimeMap onSelectDistrict={setSelectedDistrict} />
      </div>

      {/* District breakdown table */}
      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[rgba(124,45,45,0.06)] bg-bg">
          <h2 className="text-[14px] font-bold text-ink-primary">District Health Indices Ledger (13 Key Districts Tracked)</h2>
        </div>

        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {MAHARASHTRA_DISTRICTS.map((d) => (
            <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-bg/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14.5px] font-bold text-ink-primary">{d.name}</span>
                  <span className="text-[11px] text-ink-tertiary">({d.division} Division)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ACCESS_STYLE[d.access]}`}>
                    {ACCESS_LABEL[d.access]}
                  </span>
                </div>
                <div className="text-[12px] text-ink-secondary">
                  Specialists: <strong>{d.specialists}</strong> · Diagnostics: <strong>{d.diagnostics}</strong> · Medicines: <strong>{d.medicines}</strong> · Facilities: <strong>{d.facilitiesCount}</strong>
                </div>
                {d.primaryIssue && (
                  <div className="text-[11.5px] text-rose-700 mt-0.5">
                    ● Issue: {d.primaryIssue}
                  </div>
                )}
              </div>

              <div className="text-right flex items-center gap-4 flex-shrink-0">
                <div>
                  <div className="text-[22px] font-extrabold font-mono text-ink-primary leading-none">{d.score}%</div>
                  <span className="text-[9px] uppercase tracking-wider text-ink-tertiary">Index Score</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
