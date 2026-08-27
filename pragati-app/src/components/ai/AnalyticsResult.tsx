"use client";

import React from "react";
import Link from "next/link";
import { BarChart2, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { DistrictGapItem } from "@/lib/ai/types";

export function AnalyticsResult({ districts }: { districts: DistrictGapItem[] }) {
  if (!districts || districts.length === 0) return null;

  return (
    <div className="space-y-2.5 my-2.5">
      <div className="bg-amber-50 border border-amber-200/80 rounded-[8px] p-2 text-[10.5px] text-amber-900 font-semibold flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>DEMO DATA — Maharashtra Healthcare Intelligence Surveillance</span>
      </div>

      {districts.map((d) => (
        <div
          key={d.district}
          className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[12px] p-3.5 shadow-2xs hover:border-burgundy-600/40 transition-all text-ink-primary"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center font-mono font-bold text-[10px] text-burgundy-700">
                {d.rank}
              </span>
              <h4 className="text-[14px] font-bold">{d.district} District</h4>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                d.gapSeverity === "HIGH"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              {d.gapSeverity} GAP
            </span>
          </div>

          <p className="text-[12px] text-ink-secondary my-1.5 leading-relaxed">
            {d.primaryGap}
          </p>

          <div className="grid grid-cols-3 gap-1.5 bg-bg rounded-[8px] p-2 border border-[rgba(124,45,45,0.06)] text-[10.5px]">
            <div>
              <span className="text-ink-tertiary block">Specialists</span>
              <span className="font-bold text-ink-primary">{d.specialistScore}</span>
            </div>
            <div>
              <span className="text-ink-tertiary block">Diagnostics</span>
              <span className="font-bold text-ink-primary">{d.diagnosticsScore}</span>
            </div>
            <div>
              <span className="text-ink-tertiary block">Teleconsult</span>
              <span className="font-bold text-available-600">{d.teleconsultStatus}</span>
            </div>
          </div>
        </div>
      ))}

      <Link
        href="/government/dashboard"
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-[8px] text-[12px] font-bold transition-colors shadow-2xs mt-2"
      >
        <BarChart2 className="w-3.5 h-3.5" /> View Maharashtra Surveillance Map <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
