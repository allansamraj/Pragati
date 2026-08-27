"use client";

import React from "react";
import { Settings, ShieldCheck, Bell, Lock, Database } from "lucide-react";

export default function GovernmentSettingsPage() {
  return (
    <div className="space-y-5 max-w-[800px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">State Command Settings</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">System &amp; Surveillance Configuration</h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Configure threshold alerts, notification triggers, and data feed frequencies</p>
      </div>

      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-4">
        <h2 className="text-[14px] font-bold text-ink-primary">Automated Surveillance Alerts</h2>
        <div className="space-y-3 text-[12.5px]">
          {[
            { title: "Specialist Shortage Alert", desc: "Notify when district specialist availability drops below 50%", defaultChecked: true },
            { title: "Emergency Bed Saturation Warning", desc: "Trigger high-priority alert when ICU/Trauma bed occupancy exceeds 85%", defaultChecked: true },
            { title: "Essential Drug Stockout Warning", desc: "Notify central warehouse when essential medicines reach <3 days supply", defaultChecked: true },
            { title: "Daily Executive Surveillance Digest", desc: "Email consolidated 36-district health report at 06:00 AM IST", defaultChecked: false },
          ].map((item) => (
            <label key={item.title} className="flex items-start gap-3 p-3 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.06)] cursor-pointer hover:bg-blush/40 transition-colors">
              <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 rounded text-burgundy-700 focus:ring-burgundy-600 mt-0.5" />
              <div>
                <strong className="text-ink-primary block leading-tight">{item.title}</strong>
                <span className="text-[11.5px] text-ink-secondary mt-0.5 block">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-2">
        <h2 className="text-[14px] font-bold text-ink-primary">Data Security &amp; ABHA Compliance</h2>
        <p className="text-[12px] text-ink-secondary leading-relaxed">
          PRAGATI Public Health Intelligence operates under ABDM (Ayushman Bharat Digital Mission) health data governance standards. Aggregated surveillance data is anonymized.
        </p>
        <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-[6px] inline-block">
          ✓ ABDM Certified · Encryption: AES-256 GCM · Audit Logging Active
        </div>
      </div>
    </div>
  );
}
