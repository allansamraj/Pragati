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
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1">Government</p>
        <h1 className="text-[24px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Analytics</h1>
        <p className="text-[11px] text-white/40 mt-1">DEMO DATA — not actual government statistics</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#242019]/60 border border-white/8 rounded-[14px] p-5">
          <h2 className="text-[13px] font-bold text-white mb-4">Healthcare Accessibility by District</h2>
          <div className="space-y-2.5">
            {BAR_DATA.map(d => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="w-20 text-right text-[11px] text-white/60 flex-shrink-0">{d.label}</div>
                <div className="flex-1 bg-white/8 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 ${d.val < 50 ? "bg-critical-600" : d.val < 65 ? "bg-limited-500" : "bg-available-500"}`}
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
        <div className="bg-[#242019]/60 border border-white/8 rounded-[14px] p-5">
          <h2 className="text-[13px] font-bold text-white mb-4">State Accessibility Trend (12 months)</h2>
          <div className="relative h-40">
            <svg viewBox="0 0 480 100" className="w-full h-full" preserveAspectRatio="none" aria-label="Trend line chart">
              <polyline
                points={TREND.map((v, i) => `${i * 40 + 20},${100 - (v / maxT) * 85}`).join(" ")}
                fill="none" stroke="#7C2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              {TREND.map((v, i) => <circle key={i} cx={i * 40 + 20} cy={100 - (v / maxT) * 85} r="3" fill="#7C2D2D" />)}
            </svg>
          </div>
          <div className="flex justify-between mt-2">
            {MONTHS.map(m => <span key={m} className="text-[9px] text-white/30">{m}</span>)}
          </div>
        </div>
        <div className="bg-[#242019]/60 border border-white/8 rounded-[14px] p-5 lg:col-span-2">
          <h2 className="text-[13px] font-bold text-white mb-4">Resource Shortages — Priority Districts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]" aria-label="Shortages table">
              <thead>
                <tr>
                  <th className="text-left text-white/40 font-semibold pb-2 pr-4">District</th>
                  {["Doctors","Specialists","ECG","X-Ray","CT Scan","Blood Test","Medicines"].map(h => (
                    <th key={h} className="text-white/40 font-semibold pb-2 px-2 text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { d: "Nandurbar",   vals: [2,0,2,1,0,2,1] },
                  { d: "Gadchiroli",  vals: [1,0,1,1,0,1,2] },
                  { d: "Latur",       vals: [2,1,2,2,1,2,1] },
                  { d: "Palghar",     vals: [3,2,3,2,1,3,2] },
                ].map(row => (
                  <tr key={row.d}>
                    <td className="text-white/70 font-medium py-2 pr-4">{row.d}</td>
                    {row.vals.map((v, i) => {
                      const [bg, label] = v === 0 ? ["bg-critical-600/80 text-white", "None"] : v === 1 ? ["bg-critical-500/40 text-critical-300", "Critical"] : v === 2 ? ["bg-limited-500/40 text-limited-300", "Limited"] : ["bg-available-500/20 text-available-400", "OK"];
                      return (
                        <td key={i} className="px-2 py-2 text-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bg}`}>{label}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-white/20 mt-3">DEMO DATA — Prototype only</p>
        </div>
      </div>
    </div>
  );
}
