"use client";

import React, { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, XCircle, Save } from "lucide-react";

export default function DoctorAvailabilityPage() {
  const [status, setStatus] = useState<"available" | "limited" | "off">("available");
  const [opdLimit, setOpdLimit] = useState(35);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[800px]">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Clinical Duty &amp; Scheduling</div>
        <h1 className="text-[22px] font-bold text-ink-primary mt-0.5">Doctor Availability Status</h1>
        <p className="text-[13px] text-ink-secondary">Live availability status is broadcasted to rural patients and PHC triage in real time.</p>
      </div>

      <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-6 shadow-2xs space-y-6">
        <div>
          <label className="text-[13px] font-bold text-ink-primary uppercase tracking-wider block mb-3">
            Current Duty Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "available", label: "Available (On Duty)", desc: "Accepting OPD & Teleconsult", color: "border-emerald-500 bg-emerald-50 text-emerald-900", dot: "bg-emerald-500" },
              { id: "limited", label: "Limited (High Load)", desc: "Emergency & Urgent cases only", color: "border-amber-500 bg-amber-50 text-amber-900", dot: "bg-amber-500" },
              { id: "off", label: "Off Duty / In OT", desc: "Unavailable for new tokens", color: "border-slate-300 bg-slate-50 text-slate-700", dot: "bg-slate-400" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatus(opt.id as any)}
                className={`p-4 rounded-[10px] border text-left transition-all cursor-pointer ${
                  status === opt.id ? `${opt.color} ring-2 ring-emerald-500/20 shadow-xs` : "bg-bg border-[rgba(124,45,45,0.1)] hover:bg-blush/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                  <span className="text-[13px] font-bold">{opt.label}</span>
                </div>
                <p className="text-[11px] text-ink-tertiary">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[rgba(124,45,45,0.07)]">
          <div>
            <label className="text-[12.5px] font-bold text-ink-primary block mb-1.5">
              Daily OPD Token Quota
            </label>
            <input
              type="number"
              value={opdLimit}
              onChange={(e) => setOpdLimit(Number(e.target.value))}
              className="w-full h-10 px-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[14px] font-mono text-ink-primary"
            />
          </div>

          <div>
            <label className="text-[12.5px] font-bold text-ink-primary block mb-1.5">
              Consultation Room
            </label>
            <div className="h-10 px-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[8px] flex items-center text-[13px] text-ink-secondary font-medium">
              OPD Wing B · Room 204 (Cardiology)
            </div>
          </div>
        </div>

        <div className="pt-3">
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] text-[13px] font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saved ? "Status Saved & Broadcasted!" : "Update Availability Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
