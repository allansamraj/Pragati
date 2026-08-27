"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, User, FileText, ShieldCheck, Activity, ChevronRight } from "lucide-react";

const PATIENTS = [
  { id: "P-101", name: "Arun Sundaram", age: "54y", gender: "Male", abha: "77-8923-4512-6734", loc: "Triplicane, Chennai", condition: "Hypertension, Exertional Angina", lastVisit: "Today (OPD)", status: "Active" },
  { id: "P-102", name: "Sundari Karthikeyan", age: "48y", gender: "Female", abha: "82-1144-9021-3312", loc: "Royapettah, Chennai", condition: "Sinus Tachycardia", lastVisit: "12 Aug 2026", status: "Follow-up" },
  { id: "P-103", name: "Ganesan Palanisamy", age: "62y", gender: "Male", abha: "45-7782-3901-8842", loc: "Park Town, Chennai", condition: "Post-CABG Follow-up, Type 2 Diabetes", lastVisit: "28 Jul 2026", status: "Stable" },
  { id: "P-104", name: "Anjalai Shanmugam", age: "39y", gender: "Female", abha: "61-2291-5510-4491", loc: "Teynampet, Chennai", condition: "Mitral Valve Prolapse (Mild)", lastVisit: "15 Jun 2026", status: "Stable" },
  { id: "P-105", name: "Ramesh Govindarajan", age: "55y", gender: "Male", abha: "91-4402-1188-7721", loc: "Adyar, Chennai", condition: "Ischemic Heart Disease", lastVisit: "02 Aug 2026", status: "Medication Review" },
  { id: "P-106", name: "Poongodi Chandran", age: "51y", gender: "Female", abha: "33-6621-9988-1122", loc: "Anna Nagar, Chennai", condition: "Cardiac Arrhythmia", lastVisit: "19 Jul 2026", status: "Stable" },
];

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState("");

  const filtered = PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.abha.includes(search) ||
      p.loc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Patient Electronic Health Records</div>
        <h1 className="text-[22px] font-bold text-ink-primary mt-0.5">Regional Patient Registry · Outpatient Department</h1>
        <p className="text-[13px] text-ink-secondary">Consent-backed access to ABHA longitudinal health records and clinical history.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Search by patient name, district/tahsil, or ABHA ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-[rgba(124,45,45,0.12)] rounded-[10px] text-[13.5px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Patients List */}
      <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] overflow-hidden shadow-2xs">
        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {filtered.map((p) => (
            <div key={p.id} className="p-4.5 flex items-center justify-between gap-4 hover:bg-bg transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-[8px] bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-[13px]">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-ink-primary">{p.name}</h3>
                    <span className="text-[11.5px] text-ink-tertiary font-medium">({p.age}, {p.gender} · {p.loc})</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-ink-secondary mt-0.5">{p.condition}</div>
                  <div className="text-[11px] text-ink-tertiary font-mono mt-0.5">ABHA: {p.abha} · Last Visit: {p.lastVisit}</div>
                </div>
              </div>

              <Link
                href="/doctor/consultation"
                className="flex items-center gap-1 px-3.5 py-2 bg-surface border border-[rgba(124,45,45,0.15)] hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 text-ink-primary rounded-[8px] text-[12.5px] font-bold transition-all flex-shrink-0"
              >
                Open EHR <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
