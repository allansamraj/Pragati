"use client";

import React from "react";
import Link from "next/link";
import { Phone, AlertTriangle, MapPin, ArrowRight } from "lucide-react";
import { EmergencyActionData } from "@/lib/ai/types";

export function EmergencyAction({ data }: { data: EmergencyActionData }) {
  if (!data) return null;

  return (
    <div className="bg-rose-600 text-white rounded-[14px] p-4 my-2.5 shadow-md">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse mt-0.5">
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100">
            {data.alertTitle}
          </div>
          <div className="text-[14px] font-bold">{data.alertSubtitle}</div>
          <div className="text-[11.5px] text-white/90 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{data.recommendedFacility} · {data.distance}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/20">
        <a
          href="tel:108"
          className="flex-1 flex items-center justify-center gap-2 bg-white text-rose-700 hover:bg-rose-50 py-2.5 rounded-[8px] font-bold text-[13px] transition-colors shadow-sm"
        >
          <Phone className="w-4 h-4" /> CALL 108 AMBULANCE
        </a>
        <Link
          href="/patient/emergency"
          className="px-3 py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded-[8px] text-[11.5px] font-semibold transition-colors"
        >
          Emergency Dept
        </Link>
      </div>
    </div>
  );
}
