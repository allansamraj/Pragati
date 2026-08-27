"use client";

import React from "react";
import { Activity, ShieldCheck, TrendingUp, Users, MapPin } from "lucide-react";

export default function GovernmentAccessibilityPage() {
  const metrics = [
    { title: "Average Travel Time to Secondary Care", val: "48 mins", note: "-12 mins from 2025 baseline", positive: true },
    { title: "Rural Population within 30m of PHC", val: "86.4%", note: "+4.2% statewide improvement", positive: true },
    { title: "Specialist Teleconsultation Reach", val: "94.2%", note: "Covering 346 rural PHC spokes", positive: true },
    { title: "Unmet Healthcare Requests Rate", val: "4.8%", note: "Lowest in western division", positive: true },
  ];

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Public Health Surveillance</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Healthcare Accessibility Indices</h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Geographic equity, travel time thresholds, and specialty coverage across Maharashtra</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4 shadow-2xs space-y-2">
            <span className="text-[11px] font-semibold text-ink-secondary leading-snug block">{m.title}</span>
            <div className="text-[24px] font-extrabold font-mono text-ink-primary">{m.val}</div>
            <div className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              {m.note}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-4">
        <h2 className="text-[15px] font-bold text-ink-primary">Accessibility Heatmap by Division</h2>
        <div className="space-y-3">
          {[
            { division: "Konkan Division (Mumbai, Thane, Palghar)", score: 91, status: "High Access" },
            { division: "Pune Division (Pune, Satara, Kolhapur, Solapur)", score: 87, status: "High Access" },
            { division: "Nashik Division (Nashik, Dhule, Nandurbar, Jalgaon)", score: 72, status: "Moderate Access" },
            { division: "Chhatrapati Sambhajinagar Division", score: 68, status: "Moderate Access" },
            { division: "Nagpur Division (Nagpur, Wardha, Bhandara, Gadchiroli)", score: 64, status: "Moderate Access" },
            { division: "Amravati Division (Amravati, Akola, Yavatmal)", score: 61, status: "Moderate Access" },
          ].map((div) => (
            <div key={div.division} className="p-3 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.06)] space-y-1.5">
              <div className="flex items-center justify-between text-[12.5px]">
                <strong className="text-ink-primary">{div.division}</strong>
                <span className="font-mono font-bold text-burgundy-700">{div.score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${div.score >= 80 ? "bg-emerald-500" : div.score >= 65 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${div.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
