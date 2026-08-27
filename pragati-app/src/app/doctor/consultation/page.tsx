"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText, Activity, Pill, CheckCircle2, ShieldCheck,
  Share2, ArrowRight, Stethoscope, Save, Plus, Trash2
} from "lucide-react";

export default function DoctorConsultationPage() {
  const [saved, setSaved] = useState(false);
  const [meds, setMeds] = useState([
    { name: "Metoprolol Succinate 50mg", dose: "1 Tab", freq: "Once Daily (Morning)", days: "30 Days" },
    { name: "Aspirin (Ecosprin) 75mg", dose: "1 Tab", freq: "Once Daily (After Lunch)", days: "30 Days" },
    { name: "Atorvastatin 20mg", dose: "1 Tab", freq: "Once Daily (Night)", days: "30 Days" },
  ]);

  const [notes, setNotes] = useState(
    "Patient Arun Sundaram (Chennai) presenting with mild chest discomfort on exertion. ECG shows normal sinus rhythm. Advised low sodium diet, regular walking, and 30-day medication compliance."
  );

  const addMed = () => {
    setMeds([...meds, { name: "Pantoprazole 40mg", dose: "1 Tab", freq: "Before Breakfast", days: "14 Days" }]);
  };

  const removeMed = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Patient Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-[14px]">
            AS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold text-ink-primary">Arun Sundaram</h1>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Token #41 · Active
              </span>
            </div>
            <div className="text-[11.5px] text-ink-tertiary">
              54y · Male · ABHA ID: 77-8923-4512-6734 · Chennai, Tamil Nadu
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] text-[12.5px] font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Prescription Signed & Transmitted!" : "Sign & Issue Digital Rx"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: Consultation Notes & Rx Pad */}
        <div className="space-y-5">
          {/* Clinical Findings */}
          <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] p-5 shadow-2xs space-y-3">
            <h3 className="text-[14px] font-bold text-ink-primary flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> Clinical Assessment &amp; Findings
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full p-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[13px] text-ink-primary focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Electronic Prescription Writer */}
          <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-ink-primary flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" /> Digital E-Prescription (NMC Verified)
              </h3>
              <button
                onClick={addMed}
                className="flex items-center gap-1 text-[11.5px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Medicine
              </button>
            </div>

            <div className="space-y-2.5">
              {meds.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-bg border border-[rgba(124,45,45,0.07)] rounded-[8px]">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-ink-primary">{m.name}</div>
                    <div className="text-[11.5px] text-ink-secondary mt-0.5">{m.dose} · {m.freq} · {m.days}</div>
                  </div>
                  <button
                    onClick={() => removeMed(idx)}
                    className="p-1.5 text-ink-tertiary hover:text-rose-600 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[rgba(124,45,45,0.07)] flex items-center justify-between text-[11.5px] text-ink-tertiary">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Signed by Dr. Ananya Rao (MMC-2014-08-3921)
              </span>
              <span>Nandurbar Central Pharmacy synced</span>
            </div>
          </div>
        </div>

        {/* Right: Vitals & Referral Actions */}
        <div className="space-y-5">
          {/* Live Vitals Recorded */}
          <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] p-5 shadow-2xs space-y-3">
            <h3 className="text-[13px] font-bold text-ink-primary uppercase tracking-wider">
              Patient Vitals
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-bg rounded-[6px]">
                <span className="text-[12px] text-ink-secondary">Heart Rate</span>
                <span className="text-[12.5px] font-bold font-mono text-ink-primary">74 bpm (Sinus)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-bg rounded-[6px]">
                <span className="text-[12px] text-ink-secondary">Blood Pressure</span>
                <span className="text-[12.5px] font-bold font-mono text-ink-primary">120/80 mmHg</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-bg rounded-[6px]">
                <span className="text-[12px] text-ink-secondary">SpO2</span>
                <span className="text-[12.5px] font-bold font-mono text-emerald-700">98% Normal</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-bg rounded-[6px]">
                <span className="text-[12px] text-ink-secondary">Blood Glucose</span>
                <span className="text-[12.5px] font-bold font-mono text-ink-primary">112 mg/dL</span>
              </div>
            </div>
          </div>

          {/* Quick Smart Referral */}
          <div className="bg-blush/60 border border-burgundy-200 rounded-[12px] p-5 space-y-3">
            <h3 className="text-[13px] font-bold text-burgundy-800 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-burgundy-700" /> Escalate Maharashtra Referral
            </h3>
            <p className="text-[11.5px] text-ink-secondary leading-relaxed">
              Need tertiary cardiac intervention or catheterization? Initiate instant referral to Government Medical College &amp; Hospital (GMCH), Chhatrapati Sambhajinagar.
            </p>
            <button
              onClick={() => alert("Referral dispatched with patient consent to GMCH Chhatrapati Sambhajinagar.")}
              className="w-full py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[8px] text-[12px] font-bold transition-colors cursor-pointer"
            >
              Dispatch Tier-3 Referral to GMCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
