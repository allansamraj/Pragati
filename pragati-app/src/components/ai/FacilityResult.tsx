"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, Ticket, Video, ArrowRight } from "lucide-react";
import { FacilityCardItem } from "@/lib/ai/types";

export function FacilityResult({ facilities }: { facilities: FacilityCardItem[] }) {
  if (!facilities || facilities.length === 0) return null;

  return (
    <div className="space-y-2.5 my-2.5">
      {facilities.map((f) => (
        <div
          key={f.id}
          className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[12px] p-3.5 shadow-2xs hover:border-burgundy-600/40 transition-all text-ink-primary"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              {f.isBestMatch && (
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.18)] rounded px-1.5 py-0.5 mb-1 inline-block">
                  ★ Best Match
                </span>
              )}
              <div className="text-[13.5px] font-bold leading-snug">{f.name}</div>
              <div className="text-[11px] text-ink-tertiary">
                {f.type} · {f.distanceKm} km (~{f.travelMinutes} min)
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[16px] font-bold font-mono text-available-600">{f.matchScore}%</span>
              <span className="block text-[8.5px] uppercase tracking-widest text-ink-tertiary">suitability</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-ink-secondary my-2 flex-wrap">
            <span className="flex items-center gap-1 text-available-600 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Specialist Available
            </span>
            <span className="flex items-center gap-1 text-available-600 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> ECG Open
            </span>
            <span className="flex items-center gap-1 text-ink-tertiary">
              <Clock className="w-3 h-3" /> ~{f.queueWaitMinutes}m wait
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[rgba(124,45,45,0.08)]">
            <Link
              href="/patient/token"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[11.5px] font-bold transition-colors"
            >
              <Ticket className="w-3 h-3" /> Book Token #47
            </Link>
            <Link
              href="/patient/teleconsult"
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blush border border-[rgba(124,45,45,0.12)] text-burgundy-700 rounded-[7px] text-[11.5px] font-semibold hover:bg-rose transition-colors"
            >
              <Video className="w-3 h-3" /> Teleconsult
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
