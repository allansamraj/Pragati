"use client";
import React from "react";
import Link from "next/link";
import { FileText, Download } from "lucide-react";

const REPORTS = [
  { title: "District Accessibility Report",   desc: "Healthcare accessibility scores across all 36 Maharashtra districts.",   range: "August 2026" },
  { title: "Resource Shortages Summary",       desc: "Doctor, specialist, diagnostic and medicine shortages by district.",        range: "August 2026" },
  { title: "Doctor Availability Report",       desc: "Availability and workload of doctors across district hospitals.",           range: "This Week" },
  { title: "Diagnostic Capacity Report",       desc: "ECG, X-Ray, CT Scan, Blood Test availability across facilities.",           range: "August 2026" },
  { title: "Medicine Shortage Report",         desc: "Key medicines below threshold in PHCs and district hospitals.",             range: "August 2026" },
  { title: "Referral Flow Analysis",           desc: "Referral patterns from PHCs to district hospitals and medical colleges.",  range: "Q2 2026" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-5 max-w-[900px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Government</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Reports &amp; Intelligence</h1>
        <p className="text-[12px] text-ink-secondary mt-1">DEMO — Surveillance exports &amp; state audit archives</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div key={r.title} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs">
            <div className="flex items-start gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-[7px] bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-burgundy-700" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-ink-primary">{r.title}</div>
                <div className="text-[10.5px] font-semibold text-ink-tertiary mt-0.5">{r.range}</div>
              </div>
            </div>
            <p className="text-[12px] text-ink-secondary mb-4 leading-relaxed">{r.desc}</p>
            <div className="flex gap-2">
              <Link href="#" className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[7px] text-[11.5px] font-bold text-ink-primary transition-colors">
                View Report
              </Link>
              <button className="flex items-center justify-center gap-1.5 h-8 px-3 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[7px] text-[11px] font-semibold text-ink-secondary transition-colors" title="Export CSV">
                <Download className="w-3 h-3" aria-hidden /> CSV
              </button>
              <button className="flex items-center justify-center gap-1.5 h-8 px-3 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[7px] text-[11px] font-semibold text-ink-secondary transition-colors" title="Export PDF">
                <Download className="w-3 h-3" aria-hidden /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
