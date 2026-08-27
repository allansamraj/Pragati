"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Search, Pill, ShieldCheck, Download, ExternalLink } from "lucide-react";

const PRESCRIPTIONS = [
  { id: "RX-2026-8812", patient: "Arjun Deshmukh", abha: "77-8923-4512-6734", date: "Today, 10:14 AM", meds: ["Metoprolol 50mg", "Aspirin 75mg", "Atorvastatin 20mg"], status: "Transmitted to Pharmacy" },
  { id: "RX-2026-8809", patient: "Sunita Kulkarni", abha: "82-1144-9021-3312", date: "12 Aug 2026", meds: ["Ivabradine 5mg", "Clopidogrel 75mg"], status: "Dispensed" },
  { id: "RX-2026-8794", patient: "Ganesh Patil", abha: "45-7782-3901-8842", date: "28 Jul 2026", meds: ["Ramipril 5mg", "Metformin 500mg", "Rosuvastatin 10mg"], status: "Dispensed" },
  { id: "RX-2026-8761", patient: "Anjali Shinde", abha: "61-2291-5510-4491", date: "15 Jun 2026", meds: ["Propranolol 20mg", "Multivitamin"], status: "Dispensed" },
];

export default function DoctorPrescriptionsPage() {
  const [search, setSearch] = useState("");

  const filtered = PRESCRIPTIONS.filter(
    (rx) => rx.patient.toLowerCase().includes(search.toLowerCase()) || rx.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Digital Prescription Ledger</div>
        <h1 className="text-[22px] font-bold text-ink-primary mt-0.5">Doctor E-Prescriptions Issued</h1>
        <p className="text-[13px] text-ink-secondary">Signed electronic prescriptions synced with hospital central pharmacy.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Search by Rx ID, patient name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-[rgba(124,45,45,0.12)] rounded-[10px] text-[13.5px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] overflow-hidden shadow-2xs">
        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {filtered.map((rx) => (
            <div key={rx.id} className="p-4 flex items-center justify-between gap-4 hover:bg-bg transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[13.5px] text-ink-primary">{rx.id}</span>
                  <span className="text-[12px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {rx.patient}
                  </span>
                  <span className="text-[11px] text-ink-tertiary">({rx.date})</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {rx.meds.map((m) => (
                    <span key={m} className="text-[11.5px] font-medium bg-bg border border-[rgba(124,45,45,0.08)] px-2 py-0.5 rounded text-ink-secondary">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded block mb-1">
                  {rx.status}
                </span>
                <button
                  onClick={() => alert(`Downloading signed Rx PDF: ${rx.id}`)}
                  className="text-[11px] font-bold text-ink-tertiary hover:text-emerald-700 flex items-center gap-1 ml-auto"
                >
                  <Download className="w-3 h-3" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
