"use client";

import React from "react";
import Link from "next/link";
import { Pill, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { MedicineStockItem } from "@/lib/ai/types";

export function MedicineInventoryCard({ items }: { items: MedicineStockItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2 my-2.5 bg-surface border border-[rgba(124,45,45,0.12)] rounded-[12px] p-3.5 shadow-xs">
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary mb-1">
        Pharmacy Inventory Status
      </div>

      <div className="divide-y divide-[rgba(124,45,45,0.06)]">
        {items.map((m) => (
          <div key={m.id} className="py-2 flex items-center justify-between gap-2 text-[12px]">
            <div>
              <div className="font-bold text-ink-primary">{m.name}</div>
              <div className="text-[10px] text-ink-tertiary">{m.category}</div>
            </div>

            <div className="text-right">
              <span
                className={`text-[9.5px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  m.status === "unavailable"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : m.status === "limited"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-available-50 border-available-100 text-available-600"
                }`}
              >
                {m.status} ({m.stockUnits} {m.unit})
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/provider/medicines"
        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[11.5px] font-bold transition-colors shadow-2xs mt-2"
      >
        <Pill className="w-3.5 h-3.5" /> Manage Pharmacy Inventory <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
