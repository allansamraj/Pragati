"use client";

import React from "react";
import { Package, Truck, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

export default function GovernmentResourcesPage() {
  const supplies = [
    { item: "Paracetamol 500mg", category: "Essential Medicine", stock: "248,000 units", status: "Optimal", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { item: "Amoxicillin 250mg", category: "Antibiotic", stock: "46,200 units", status: "Adequate", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { item: "Metformin 500mg", category: "Chronic Care", stock: "12,400 units", status: "Low Stock (Latur Hub)", color: "text-amber-700 bg-amber-50 border-amber-200" },
    { item: "Oral Rehydration Salts (ORS)", category: "Pediatric / Emergency", stock: "180,000 pkts", status: "Optimal", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { item: "12-Lead ECG Thermal Rolls", category: "Diagnostic Consumables", stock: "3,200 rolls", status: "Optimal", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { item: "Insulin Regular 100IU", category: "Cold-Chain Critical", stock: "1,850 vials", status: "Critical (Dispatching)", color: "text-rose-700 bg-rose-50 border-rose-200" },
  ];

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Central Medical Warehouses</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Statewide Medical Resources &amp; Inventory</h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Live tracking of essential medicines, cold-chain supplies, and diagnostic consumables</p>
      </div>

      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[rgba(124,45,45,0.06)] bg-bg flex items-center justify-between">
          <span className="text-[12px] font-bold text-ink-primary">Central Medical Store Depots (CMSD) Feed</span>
          <button className="text-[11px] font-semibold text-burgundy-700 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Sync Inventory
          </button>
        </div>

        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {supplies.map((s) => (
            <div key={s.item} className="p-4 flex items-center justify-between gap-4 hover:bg-bg/40 transition-colors">
              <div>
                <span className="text-[14px] font-bold text-ink-primary block">{s.item}</span>
                <span className="text-[11.5px] text-ink-secondary">{s.category}</span>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-mono font-bold text-ink-primary">{s.stock}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 inline-block ${s.color}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
