"use client";

import React, { useState } from "react";
import { Pill, Search, AlertTriangle, CheckCircle2, Truck, Plus, RefreshCw } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  category: string;
  batch: string;
  expiry: string;
  stock: number;
  min: number;
}

const INITIAL_MEDS: Medicine[] = [
  { id: "MED-01", name: "Paracetamol 500mg Tablets", category: "Analgesic / Antipyretic", batch: "PCM-2026-A1", expiry: "Dec 2027", stock: 240, min: 100 },
  { id: "MED-02", name: "Amoxicillin 250mg Capsules", category: "Antibiotic", batch: "AMX-2025-C4", expiry: "Sep 2026", stock: 48, min: 100 },
  { id: "MED-03", name: "Atorvastatin 20mg Tablets", category: "Cardiovascular / Statin", batch: "ATV-2026-B2", expiry: "Jan 2028", stock: 12, min: 50 },
  { id: "MED-04", name: "Metformin 500mg Tablets", category: "Antidiabetic", batch: "MET-2025-D9", expiry: "Nov 2026", stock: 0, min: 150 },
  { id: "MED-05", name: "Aspirin 75mg Gastro-resistant", category: "Antiplatelet / Cardiac", batch: "ASP-2026-F1", expiry: "Mar 2028", stock: 380, min: 100 },
  { id: "MED-06", name: "Ibuprofen 400mg Tablets", category: "NSAID", batch: "IBU-2026-G3", expiry: "Aug 2027", stock: 24, min: 80 },
  { id: "MED-07", name: "Omeprazole 20mg Capsules", category: "Antacid / PPI", batch: "OMP-2026-E5", expiry: "Feb 2028", stock: 96, min: 50 },
  { id: "MED-08", name: "Amlodipine 5mg Tablets", category: "Antihypertensive", batch: "AML-2025-H2", expiry: "Oct 2026", stock: 0, min: 100 },
  { id: "MED-09", name: "Ciprofloxacin 500mg Tablets", category: "Antibiotic", batch: "CIP-2026-K7", expiry: "Jul 2027", stock: 64, min: 50 },
  { id: "MED-10", name: "Oral Rehydration Salts (ORS)", category: "Electrolyte Solutions", batch: "ORS-2026-L1", expiry: "May 2028", stock: 120, min: 60 },
  { id: "MED-11", name: "Human Insulin 100 IU/mL Vials", category: "Antidiabetic / Injectable", batch: "INS-2026-M4", expiry: "Jan 2027", stock: 8, min: 40 },
  { id: "MED-12", name: "Azithromycin 500mg Tablets", category: "Antibiotic", batch: "AZM-2026-P2", expiry: "Nov 2027", stock: 110, min: 50 },
];

export default function ProviderMedicinesPage() {
  const [meds, setMeds] = useState<Medicine[]>(INITIAL_MEDS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "critical" | "limited" | "available">("all");
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const requestResupply = (id: string) => {
    setRequestedId(id);
    setTimeout(() => {
      setMeds((list) =>
        list.map((m) => (m.id === id ? { ...m, stock: m.stock + 100 } : m))
      );
      setRequestedId(null);
    }, 1200);
  };

  const filtered = meds.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.batch.toLowerCase().includes(search.toLowerCase());

    const status = m.stock === 0 ? "critical" : m.stock < m.min ? "limited" : "available";
    if (filter === "all") return matchesSearch;
    return matchesSearch && status === filter;
  });

  const criticalCount = meds.filter((m) => m.stock === 0).length;
  const limitedCount = meds.filter((m) => m.stock > 0 && m.stock < m.min).length;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] p-5 shadow-2xs">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-burgundy-700">Central Pharmacy Inventory</div>
          <h1 className="text-[22px] font-bold text-ink-primary mt-0.5">Medicine Stock &amp; Drug Dispensation</h1>
          <p className="text-[12.5px] text-ink-secondary">
            Live stock levels automatically inform patient facility matching and doctor prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-[7px]">
              {criticalCount} Critical Stockouts
            </span>
            <span className="text-[11.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-[7px]">
              {limitedCount} Low Stock
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search by medicine, category, or batch number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "critical", "limited", "available"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[7px] text-[12px] font-bold capitalize transition-all cursor-pointer ${
                filter === f
                  ? "bg-burgundy-700 text-white shadow-2xs"
                  : "bg-white border border-[rgba(124,45,45,0.12)] text-ink-secondary hover:bg-blush"
              }`}
            >
              {f === "all" ? "All Medicines" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(124,45,45,0.08)] bg-bg text-[11.5px] font-bold uppercase tracking-wider text-ink-tertiary">
                <th className="py-3 px-4">Medicine &amp; Category</th>
                <th className="py-3 px-4">Batch / Expiry</th>
                <th className="py-3 px-4 text-right">Available Units</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Supply Chain Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(124,45,45,0.06)] text-[13px]">
              {filtered.map((m) => {
                const status = m.stock === 0 ? "critical" : m.stock < m.min ? "limited" : "available";
                const isRequesting = requestedId === m.id;
                return (
                  <tr key={m.id} className={`hover:bg-bg/80 transition-colors ${status === "critical" ? "bg-rose-50/40" : ""}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink-primary">{m.name}</div>
                      <div className="text-[11px] text-ink-tertiary">{m.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-ink-secondary">
                      <div>{m.batch}</div>
                      <div className="text-[11px] text-ink-tertiary">Exp: {m.expiry}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-[15px] text-ink-primary">{m.stock}</span>
                      <span className="text-[11px] text-ink-tertiary block">Min: {m.min}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          status === "available"
                            ? "bg-available-50 border-available-100 text-available-600"
                            : status === "limited"
                            ? "bg-limited-50 border-limited-100 text-limited-600"
                            : "bg-critical-50 border-critical-100 text-critical-500"
                        }`}
                      >
                        {status === "critical" ? "Out of Stock" : status === "limited" ? "Low Stock" : "Adequate"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {status !== "available" ? (
                        <button
                          onClick={() => requestResupply(m.id)}
                          disabled={isRequesting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 disabled:opacity-50 text-white rounded-[7px] text-[11.5px] font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Truck className={`w-3.5 h-3.5 ${isRequesting ? "animate-bounce" : ""}`} />
                          {isRequesting ? "Dispatching..." : "Request Resupply (+100)"}
                        </button>
                      ) : (
                        <span className="text-[11.5px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Stock Synced
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
