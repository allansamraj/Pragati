"use client";

import React, { useState } from "react";
import { AlertTriangle, TrendingDown, Package, Stethoscope, Activity, ArrowRight, ShieldCheck } from "lucide-react";

const SHORTAGES = [
  { id: "sht-01", type: "Specialist Shortage", district: "Nandurbar", facility: "Nandurbar District Civil Hospital", gap: "Cardiology Specialist (0 on-site)", impact: "High Gap", urgency: "Critical", action: "Telemedicine Specialist Assigned" },
  { id: "sht-02", type: "Diagnostic Shortage", district: "Gadchiroli", facility: "Gadchiroli Sub-District Hospital", gap: "CT Scan Calibration Downtime", impact: "High Gap", urgency: "Critical", action: "Technician Dispatch Scheduled" },
  { id: "sht-03", type: "Medicine Stockout", district: "Latur", facility: "Latur Rural Hospital Hub", gap: "Metformin 500mg & Insulin (0 units)", impact: "Moderate Gap", urgency: "High", action: "Emergency Supply Requisitioned" },
  { id: "sht-04", type: "Specialist Shortage", district: "Palghar", facility: "Mokhada PHC", gap: "Pediatrician on Leave", impact: "Moderate Gap", urgency: "Medium", action: "Referrals Routed to Jawhar SDH" },
  { id: "sht-05", type: "Machine Maintenance", district: "Akola", facility: "Akola District Hospital", gap: "Ultrasound Probe Repair", impact: "Moderate Gap", urgency: "Medium", action: "Vendor Replacement Underway" },
];

export default function GovernmentShortagesPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Statewide Resource Triage</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Critical Resource Shortages</h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Live alerts for specialist gaps, diagnostic machine downtimes, and medicine stockouts</p>
      </div>

      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[rgba(124,45,45,0.06)] bg-bg flex items-center justify-between">
          <span className="text-[12px] font-bold text-ink-primary">Active Critical Alerts (5 Total)</span>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            ● 3 Priority Actions Required
          </span>
        </div>

        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {SHORTAGES.map((s) => (
            <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${s.urgency === "Critical" ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-amber-100 text-amber-800 border border-amber-200"}`}>
                    {s.urgency}
                  </span>
                  <span className="text-[14px] font-bold text-ink-primary">{s.type} — {s.district}</span>
                </div>
                <div className="text-[12.5px] text-ink-secondary">
                  <strong>Facility:</strong> {s.facility} · <strong>Gap:</strong> <span className="text-rose-700 font-semibold">{s.gap}</span>
                </div>
                <div className="text-[11.5px] text-emerald-800 flex items-center gap-1 font-medium pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Remediation: {s.action}
                </div>
              </div>

              <button className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[8px] text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors flex-shrink-0">
                Dispatch Action <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
