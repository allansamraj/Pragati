"use client";
import React from "react";

const BAR_DATA = [
  { label: "Nagpur",     val: 84 },
  { label: "Pune",       val: 88 },
  { label: "Mumbai",     val: 92 },
  { label: "Nashik",     val: 78 },
  { label: "Nandurbar",  val: 42 },
  { label: "Gadchiroli", val: 38 },
  { label: "Latur",      val: 48 },
  { label: "Aurangabad", val: 67 },
];
const TREND = [62, 64, 63, 67, 66, 69, 70, 71, 68, 72, 73, 74];
const MONTHS = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];

export default function AnalyticsPage() {
  const maxBar = Math.max(...BAR_DATA.map(d => d.val));
  const maxT = Math.max(...TREND);

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Government</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Analytics &amp; Intelligence</h1>
        <p className="text-[12px] text-ink-secondary mt-1">DEMO DATA — Public health capacity &amp; accessibility metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* District Accessibility Bar Chart */}
        <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs">
          <h2 className="text-[14px] font-bold text-ink-primary mb-4">Healthcare Accessibility by District</h2>
          <div className="space-y-2.5">
            {BAR_DATA.map(d => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="w-20 text-right text-[12px] font-medium text-ink-secondary flex-shrink-0">{d.label}</div>
                <div className="flex-1 bg-bg rounded-full h-5 overflow-hidden border border-[rgba(124,45,45,0.06)]">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 transition-all ${
                      d.val < 50 ? "bg-rose-500" : d.val < 65 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${(d.val / maxBar) * 100}%` }}
                    role="progressbar" aria-valuenow={d.val} aria-valuemin={0} aria-valuemax={100}
                    aria-label={`${d.label}: ${d.val}%`}
                  >
                    <span className="text-[10px] font-bold text-white">{d.val}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 12 Months Trend Chart */}
        <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs">
          <h2 className="text-[14px] font-bold text-ink-primary mb-4">State Accessibility Trend (12 months)</h2>
          <div className="relative h-40 bg-bg rounded-[8px] p-2 border border-[rgba(124,45,45,0.06)]">
            <svg viewBox="0 0 480 100" className="w-full h-full" preserveAspectRatio="none" aria-label="Trend line chart">
              <polyline
                points={TREND.map((v, i) => `${i * 40 + 20},${100 - (v / maxT) * 85}`).join(" ")}
                fill="none" stroke="#7C2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              />
              {TREND.map((v, i) => <circle key={i} cx={i * 40 + 20} cy={100 - (v / maxT) * 85} r="3.5" fill="#7C2D2D" />)}
            </svg>
          </div>
          <div className="flex justify-between mt-2 px-2">
            {MONTHS.map(m => <span key={m} className="text-[10px] text-ink-tertiary font-semibold">{m}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
