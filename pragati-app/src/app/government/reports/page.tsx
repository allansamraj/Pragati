"use client";

import React, { useState } from "react";
import { FileText, Download, Printer, X, ShieldCheck, QrCode, Building2, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationContext } from "@/lib/context/LocationContext";

interface GovReportDetail {
  id: string;
  title: string;
  department: string;
  range: string;
  summary: string;
  stats: { label: string; value: string | number }[];
  headers: string[];
  rows: (string | number)[][];
}

const GOV_REPORTS_DATA: Record<string, GovReportDetail> = {
  "rep-1": {
    id: "REP-MH-2026-001",
    title: "District Healthcare Accessibility & Equity Index Report",
    department: "Directorate of Health Services (DHS) · Planning & Statistics",
    range: "August 2026 (Monthly Surveillance)",
    summary: "Composite evaluation of healthcare access across all 36 Maharashtra districts. Top tier access recorded in Mumbai (92%) and Pune (88%). Critical specialist and diagnostic gaps flagged in Nandurbar (42%), Gadchiroli (38%), and Latur (48%).",
    stats: [
      { label: "State Avg Access Index", value: "72.4%" },
      { label: "Districts Monitored", value: "36 Districts" },
      { label: "High Gap Zones (<50%)", value: "3 Districts" },
      { label: "Public Health Facilities", value: "1,284" },
    ],
    headers: ["District Name", "Division", "Composite Score", "Specialist Coverage", "Diagnostics Uptime", "Status"],
    rows: [
      ["Mumbai City & Suburban", "Konkan", "92%", "96% (Optimal)", "98.4%", "Good Access"],
      ["Pune District", "Pune", "88%", "91% (Optimal)", "96.2%", "Good Access"],
      ["Nagpur District", "Nagpur", "84%", "88% (Adequate)", "94.0%", "Good Access"],
      ["Nashik District", "Nashik", "78%", "82% (Adequate)", "91.5%", "Good Access"],
      ["Chhatrapati Sambhajinagar", "Marathwada", "67%", "64% (Moderate)", "86.0%", "Moderate Gap"],
      ["Solapur District", "Pune", "63%", "58% (Moderate)", "82.4%", "Moderate Gap"],
      ["Palghar (Tribal Blocks)", "Konkan", "55%", "48% (Low)", "76.0%", "Moderate Gap"],
      ["Latur District", "Marathwada", "48%", "44% (Critical Low)", "71.2%", "High Gap"],
      ["Nandurbar District", "Nashik", "42%", "38% (Critical Low)", "68.4%", "High Gap"],
      ["Gadchiroli Tribal District", "Nagpur", "38%", "32% (Critical Low)", "54.0%", "High Gap"],
    ],
  },
  "rep-2": {
    id: "REP-MH-2026-002",
    title: "Statewide Critical Resource Shortages & Triage Audit",
    department: "State Health Systems Resource Centre (SHSRC)",
    range: "Week Ending 27 Aug 2026",
    summary: "Live surveillance audit of clinical specialist vacancies, machine downtimes, and essential drug stockouts. 37 critical alerts active statewide with 28 automated teleconsultation remediations active.",
    stats: [
      { label: "Active Shortages", value: "37 Total" },
      { label: "Specialist Deficits", value: "14 Posts" },
      { label: "Equipment Outages", value: "9 Machines" },
      { label: "Remediation Rate", value: "84.2%" },
    ],
    headers: ["District / Facility", "Shortage Category", "Clinical Gap", "Impact Severity", "Active Remediation"],
    rows: [
      ["Nandurbar Civil Hospital", "Clinical Specialist", "Cardiology Specialist (0 on-site)", "High Severity", "Telemedicine Specialist Assigned"],
      ["Gadchiroli Sub-District", "Diagnostic Equipment", "CT Scan Calibration Downtime", "High Severity", "Technician Dispatch Scheduled"],
      ["Latur Rural Hospital Hub", "Essential Pharmacy", "Metformin 500mg (0 units)", "Moderate Severity", "Emergency Supply Requisitioned"],
      ["Mokhada PHC (Palghar)", "Clinical Specialist", "Paediatrician on Leave", "Moderate Severity", "Routed to Jawhar SDH"],
      ["Akola District Hospital", "Diagnostic Equipment", "Ultrasound Probe Repair", "Moderate Severity", "Vendor Replacement in Transit"],
    ],
  },
  "rep-3": {
    id: "REP-MH-2026-003",
    title: "Physician & Specialist Workforce Availability Report",
    department: "Maharashtra Medical Council & DHS Human Resources",
    range: "This Week (21 - 27 Aug 2026)",
    summary: "Duty roster attendance and specialty utilization across district hospitals and rural health centers. Total 8,420 medical officers active on PRAGATI surveillance registry.",
    stats: [
      { label: "Doctors on Duty", value: "8,420 Active" },
      { label: "Roster Compliance", value: "93.8%" },
      { label: "Teleconsult Hours", value: "1,240 Hours" },
      { label: "Rural Doctor Density", value: "0.78 / 1000" },
    ],
    headers: ["Cadre / Specialty", "Sanctioned Posts", "In-Position (Active)", "Vacancy Rate", "Teleconsult Coverage"],
    rows: [
      ["General Medical Officers (MBBS)", "4,200", "3,980", "5.2%", "Active Across All PHCs"],
      ["General Medicine (MD)", "850", "780", "8.2%", "District & SDH Covered"],
      ["Cardiology (DM / DNB)", "120", "64", "46.6%", "Hub-and-Spoke Telemedicine"],
      ["Paediatrics (MD / DCH)", "680", "590", "13.2%", "Sub-District Hubs"],
      ["Obstetrics & Gynaecology", "720", "640", "11.1%", "24/7 Delivery Points"],
      ["Radiology & Imaging", "210", "138", "34.2%", "Tele-Radiology Reporting"],
    ],
  },
  "rep-4": {
    id: "REP-MH-2026-004",
    title: "Diagnostic Infrastructure & Tele-Reporting Capacity",
    department: "State Health Diagnostic Imaging Wing",
    range: "August 2026 (Monthly Audit)",
    summary: "Diagnostic modality utilization and tele-ECG turnaround times. Average turnaround for rural ECG cloud interpretation achieved at 8.4 minutes across 346 PHC spokes.",
    stats: [
      { label: "Diagnostic Tests Run", value: "48,200 MTD" },
      { label: "Avg ECG Turnaround", value: "8.4 mins" },
      { label: "X-Ray Modality Uptime", value: "97.8%" },
      { label: "Tele-Pathology Links", value: "142 Active" },
    ],
    headers: ["Diagnostic Service", "Monitored Units", "Monthly Volume", "Average Turnaround", "Operating Uptime"],
    rows: [
      ["12-Lead Digital ECG", "1,140 Machines", "28,400 Tests", "8.4 mins", "99.1% Uptime"],
      ["Digital Chest Radiography", "410 Systems", "12,200 Scans", "18.2 mins", "97.8% Uptime"],
      ["Automated Blood Chemistry", "380 Analyzers", "34,000 Tests", "42.0 mins", "96.4% Uptime"],
      ["Ultrasonography (USG)", "290 Machines", "8,900 Scans", "25.0 mins", "98.2% Uptime"],
      ["Computed Tomography (CT)", "48 Systems", "2,840 Scans", "35.0 mins", "94.6% Uptime"],
    ],
  },
  "rep-5": {
    id: "REP-MH-2026-005",
    title: "Central Medical Store Depots (CMSD) Stockout Audit",
    department: "Maharashtra Medical Goods Procurement Authority (MMGPA)",
    range: "August 2026",
    summary: "Statewide pharmaceutical stock levels across essential medications, pediatric formulations, and diagnostic reagents. Buffer compliance maintained at 94.2%.",
    stats: [
      { label: "Essential Drugs Tracked", value: "240 SKU" },
      { label: "Buffer Compliance", value: "94.2%" },
      { label: "Emergency Orders Dispatched", value: "18 Trucks" },
      { label: "Stockout Alert Count", value: "5 Hubs" },
    ],
    headers: ["Medication Name", "Therapeutic Class", "Statewide Stock", "Buffer Status", "Reorder Triggered"],
    rows: [
      ["Paracetamol 500mg Tablets", "Analgesic / Antipyretic", "2,480,000 Units", "Optimal (>30 Days)", "Normal Schedule"],
      ["Metoprolol Succinate 50mg", "Cardiovascular / Beta-Blocker", "480,000 Units", "Optimal (>30 Days)", "Normal Schedule"],
      ["Atorvastatin 20mg", "Lipid Lowering / Statin", "320,000 Units", "Adequate (20 Days)", "Normal Schedule"],
      ["Metformin 500mg (SR)", "Oral Hypoglycemic", "84,000 Units", "Low Stock (<7 Days)", "Emergency Order Dispatched"],
      ["Insulin Regular 100IU", "Cold-Chain Critical", "18,500 Vials", "Critical (<5 Days)", "Priority Cold Van In-Transit"],
    ],
  },
  "rep-6": {
    id: "REP-MH-2026-006",
    title: "Inter-Facility Referral Pipeline & Transit Flow Analysis",
    department: "Hub-and-Spoke Telemedicine & Patient Continuity Division",
    range: "Q2 2026 (Quarterly Performance)",
    summary: "Tracking of 2,184 patient referrals from rural primary health centers to district secondary hospitals and tertiary medical colleges. 98.4% confirmation rate.",
    stats: [
      { label: "Total Referrals Q2", value: "2,184" },
      { label: "Acceptance Rate", value: "98.4%" },
      { label: "Avg Transfer Time", value: "4.2 Hours" },
      { label: "Tertiary Upgrades", value: "14.2%" },
    ],
    headers: ["Referring Facility Tier", "Receiving Specialty Hub", "Referral Count", "Transit Mode", "Outcome Rate"],
    rows: [
      ["Primary Health Centres (PHC)", "District Civil Hospitals", "1,240 Patients", "108 Ambulance / Road", "96.8% Evaluated"],
      ["Sub-District Hospitals (SDH)", "Government Medical Colleges", "680 Patients", "Advance Life Support (ALS)", "98.2% Admitted"],
      ["Tribal Mobile Health Units", "Sub-District Hospitals", "264 Patients", "Supported Road Transit", "94.5% Evaluated"],
    ],
  },
};

const REPORTS = [
  { id: "rep-1", title: "District Accessibility Report",   desc: "Healthcare accessibility scores across all 36 Maharashtra districts.",   range: "August 2026" },
  { id: "rep-2", title: "Resource Shortages Summary",       desc: "Doctor, specialist, diagnostic and medicine shortages by district.",        range: "August 2026" },
  { id: "rep-3", title: "Doctor Availability Report",       desc: "Availability and workload of doctors across district hospitals.",           range: "This Week" },
  { id: "rep-4", title: "Diagnostic Capacity Report",       desc: "ECG, X-Ray, CT Scan, Blood Test availability across facilities.",           range: "August 2026" },
  { id: "rep-5", title: "Medicine Shortage Report",         desc: "Key medicines below threshold in PHCs and district hospitals.",             range: "August 2026" },
  { id: "rep-6", title: "Referral Flow Analysis",           desc: "Referral patterns from PHCs to district hospitals and medical colleges.",  range: "Q2 2026" },
];

export default function ReportsPage() {
  const { governmentLocation } = useLocationContext();
  const state = governmentLocation?.state || "Tamil Nadu";
  const [selectedReport, setSelectedReport] = useState<GovReportDetail | null>(null);

  return (
    <div className="space-y-6 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">State Command Center</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Reports &amp; Public Health Intelligence</h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Official surveillance archives, accessibility audits, and healthcare equity ledgers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div key={r.id} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs flex flex-col justify-between hover:border-[rgba(124,45,45,0.18)] transition-all">
            <div>
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-burgundy-700" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-ink-primary">{r.title}</div>
                  <div className="text-[10.5px] font-semibold text-ink-tertiary mt-0.5">{r.range}</div>
                </div>
              </div>
              <p className="text-[12px] text-ink-secondary mb-4 leading-relaxed">{r.desc}</p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[rgba(124,45,45,0.06)]">
              <button
                onClick={() => setSelectedReport(GOV_REPORTS_DATA[r.id])}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[11.5px] font-bold transition-colors shadow-2xs cursor-pointer"
              >
                View Report
              </button>
              <button
                onClick={() => setSelectedReport(GOV_REPORTS_DATA[r.id])}
                className="flex items-center justify-center gap-1.5 h-8 px-3 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[7px] text-[11px] font-semibold text-ink-secondary transition-colors"
                title="Export CSV"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
              <button
                onClick={() => setSelectedReport(GOV_REPORTS_DATA[r.id])}
                className="flex items-center justify-center gap-1.5 h-8 px-3 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[7px] text-[11px] font-semibold text-ink-secondary transition-colors"
                title="Export PDF"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── INTERACTIVE DETAILED GOVERNMENT REPORT MODAL ── */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[18px] max-w-[780px] w-full shadow-2xl border border-[rgba(124,45,45,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Bar */}
              <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Government Surveillance Audit Document · {selectedReport.id}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary" title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Medical Letterhead Paper */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-ink-primary font-sans">
                {/* Official State Header */}
                <div className="border-b-2 border-burgundy-800 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10.5px] font-bold tracking-wider text-burgundy-700 uppercase">
                      Government of {state} · Public Health &amp; Family Welfare
                    </div>
                    <h2 className="text-[18px] font-black text-ink-primary tracking-tight">
                      {selectedReport.title.toUpperCase()}
                    </h2>
                    <p className="text-[11.5px] text-ink-secondary">
                      {selectedReport.department} · {selectedReport.range}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="w-12 h-12 bg-bg border border-[rgba(124,45,45,0.15)] rounded flex items-center justify-center mx-auto text-ink-tertiary">
                      <QrCode className="w-9 h-9 text-ink-primary" />
                    </div>
                    <span className="text-[8px] font-mono text-ink-tertiary block mt-0.5">STATE COMMAND SEAL</span>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedReport.stats.map((s) => (
                    <div key={s.label} className="p-3 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.06)] text-center">
                      <div className="text-[18px] font-black font-mono text-burgundy-800">{s.value}</div>
                      <div className="text-[10.5px] text-ink-secondary font-semibold mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="bg-[#FAF8F6] p-3.5 rounded-[8px] border border-[rgba(124,45,45,0.08)] text-[12.5px] leading-relaxed">
                  <strong>Surveillance Analysis: </strong>
                  <span className="text-ink-secondary">{selectedReport.summary}</span>
                </div>

                {/* Detailed Table */}
                <div className="space-y-2">
                  <div className="text-[12px] font-bold text-ink-primary">Detailed Surveillance Dataset:</div>
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead>
                      <tr className="border-b border-ink-primary/20 bg-bg text-[10px] uppercase font-bold text-ink-tertiary">
                        {selectedReport.headers.map((h) => (
                          <th key={h} className="py-2 px-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(124,45,45,0.06)]">
                      {selectedReport.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-bg/40">
                          {row.map((cell, cidx) => (
                            <td key={cidx} className="py-2 px-2.5 font-medium text-ink-primary">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Audit Sign-off */}
                <div className="pt-4 border-t border-[rgba(124,45,45,0.1)] flex items-end justify-between text-[11px]">
                  <div>
                    <div className="text-[10px] text-ink-tertiary">State Epidemiological Certification:</div>
                    <div className="text-emerald-700 font-semibold">● Live Telemetry Synced with 36 District Civil Hospitals</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic text-[14px] text-burgundy-800 font-bold">Principal Secretary (Health)</div>
                    <div className="text-[9.5px] font-mono text-emerald-700">Digital State Seal Authenticated</div>
                    <div className="text-[9px] text-ink-tertiary">27 Aug 2026, 12:00 PM IST</div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-bg border-t border-[rgba(124,45,45,0.08)] flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-burgundy-700 text-white font-bold text-[12px] rounded-[8px]"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
