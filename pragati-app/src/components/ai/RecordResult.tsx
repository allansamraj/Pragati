"use client";

import React from "react";
import Link from "next/link";
import { FileText, ShieldCheck, User, Calendar, Pill, Share2, ArrowRight } from "lucide-react";
import { PatientSummaryData } from "@/lib/ai/types";

export function RecordResult({ data, isDoctor = false }: { data: PatientSummaryData; isDoctor?: boolean }) {
  if (!data) return null;

  return (
    <div className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[14px] p-4 my-2.5 shadow-xs text-ink-primary">
      {/* Patient Header */}
      <div className="flex items-center justify-between border-b border-[rgba(124,45,45,0.08)] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center text-burgundy-700 font-bold text-[11px]">
            AD
          </div>
          <div>
            <div className="text-[13px] font-bold">{data.name} ({data.age}y/{data.gender})</div>
            <div className="text-[10px] text-ink-tertiary font-mono">ABHA: {data.abhaId}</div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-available-600 bg-available-50 border border-available-100 rounded px-2 py-0.5 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Consented
        </span>
      </div>

      {/* Structured Clinical Grid */}
      <div className="space-y-2 text-[12px]">
        <div className="bg-bg rounded-[8px] p-2.5 border border-[rgba(124,45,45,0.06)]">
          <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Current Visit Reason</span>
          <span className="font-semibold text-ink-primary">{data.currentVisitReason}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-bg rounded-[8px] p-2 border border-[rgba(124,45,45,0.06)]">
            <span className="text-[9.5px] uppercase font-bold text-ink-tertiary block">Recent Consultation</span>
            <span className="text-[11.5px] font-semibold text-ink-secondary">{data.recentConsultation}</span>
          </div>
          <div className="bg-bg rounded-[8px] p-2 border border-[rgba(124,45,45,0.06)]">
            <span className="text-[9.5px] uppercase font-bold text-ink-tertiary block">Recent Diagnostic</span>
            <span className="text-[11.5px] font-semibold text-available-600">{data.recentDiagnostic}</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-blush/40 rounded-[8px] p-2 border border-[rgba(124,45,45,0.08)] text-[11.5px]">
          <span className="flex items-center gap-1 font-semibold text-burgundy-700">
            <Pill className="w-3.5 h-3.5" /> {data.activeMedicationsCount} Active Medications
          </span>
          <span className="text-ink-tertiary">
            Follow-up: <strong>{data.nextFollowUp}</strong>
          </span>
        </div>

        <div className="text-[10.5px] text-ink-tertiary bg-bg rounded p-2 border border-[rgba(124,45,45,0.06)] flex items-center gap-1">
          <Share2 className="w-3 h-3 text-burgundy-600 flex-shrink-0" />
          <span className="truncate">{data.referralStatus}</span>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-[rgba(124,45,45,0.08)] flex gap-2">
        {isDoctor ? (
          <Link
            href="/doctor/consultation"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[7px] text-[11.5px] font-bold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Open Clinical Consultation Pad
          </Link>
        ) : (
          <Link
            href="/patient/records"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[11.5px] font-bold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> View Longitudinal Records <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
