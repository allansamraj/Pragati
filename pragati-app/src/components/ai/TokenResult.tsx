"use client";

import React from "react";
import Link from "next/link";
import { Ticket, Clock, MapPin, ArrowRight } from "lucide-react";
import { TokenStatusItem } from "@/lib/ai/types";

export function TokenResult({ data }: { data: TokenStatusItem }) {
  if (!data) return null;

  return (
    <div className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[14px] p-4 my-2.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[rgba(124,45,45,0.08)] pb-2.5 mb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy-700">Live OPD Queue</span>
          <h4 className="text-[13px] font-bold text-ink-primary">{data.facilityName}</h4>
        </div>
        <span className="text-[11px] font-semibold text-available-600 bg-available-50 border border-available-100 rounded px-2 py-0.5">
          Active OPD
        </span>
      </div>

      <div className="flex items-center gap-4 bg-blush/40 border border-[rgba(124,45,45,0.1)] rounded-[10px] p-3 mb-3">
        <div className="text-center flex-shrink-0">
          <div className="text-[9px] uppercase tracking-wider text-ink-tertiary font-bold">Your Token</div>
          <div className="text-[36px] font-extrabold font-mono text-burgundy-700 leading-none mt-0.5">
            #{data.tokenNumber}
          </div>
        </div>

        <div className="w-px h-10 bg-[rgba(124,45,45,0.12)]" />

        <div className="grid grid-cols-2 gap-2 flex-1 text-[11.5px]">
          <div>
            <span className="text-ink-tertiary block text-[10px]">Now Serving</span>
            <span className="font-bold font-mono text-ink-primary text-[14px]">#{data.nowServing}</span>
          </div>
          <div>
            <span className="text-ink-tertiary block text-[10px]">Ahead of You</span>
            <span className="font-bold text-ink-primary text-[14px]">{data.patientsAhead} patients</span>
          </div>
          <div>
            <span className="text-ink-tertiary block text-[10px]">Est. Wait</span>
            <span className="font-bold text-ink-primary">~{data.estimatedWaitMinutes} mins</span>
          </div>
          <div>
            <span className="text-ink-tertiary block text-[10px]">Specialty</span>
            <span className="font-bold text-ink-primary truncate">{data.specialty}</span>
          </div>
        </div>
      </div>

      <Link
        href="/patient/token"
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[8px] text-[12px] font-bold transition-colors shadow-2xs"
      >
        <Ticket className="w-3.5 h-3.5" /> Open Full Queue Tracker <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
