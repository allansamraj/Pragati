'use client';

import React, { useState } from 'react';
import { FileText, Download, Activity, Users, Pill, Stethoscope, ArrowRightLeft, X, Printer, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportDetail {
  title: string;
  category: string;
  dateRange: string;
  facility: string;
  summary: string;
  tableHeaders: string[];
  tableRows: (string | number)[][];
  stats: { label: string; value: string | number }[];
}

const SAMPLE_REPORT_DATA: Record<number, ReportDetail> = {
  1: {
    title: "Daily OPD Summary & Department Triage",
    category: "Operational Efficiency",
    dateRange: "Today, 27 Aug 2026",
    facility: "Nandurbar District Civil Hospital",
    summary: "Total 412 outpatients registered across General Medicine, Cardiology, Paediatrics, and Orthopaedics. Average consultation turnaround time maintained at 14.2 minutes.",
    stats: [
      { label: "Total Registrations", value: 412 },
      { label: "Consultations Completed", value: 374 },
      { label: "Avg Wait Time", value: "18 mins" },
      { label: "Telemedicine Sessions", value: 28 },
    ],
    tableHeaders: ["Department / Room", "Doctor on Duty", "Patients Seen", "Avg Time", "Status"],
    tableRows: [
      ["Cardiology OPD (Room 204)", "Dr. Ananya Natarajan", "48", "16 mins", "Active"],
      ["General Medicine (Room 102)", "Dr. S. Karthikeyan", "84", "12 mins", "Active"],
      ["Paediatrics OPD (Room 105)", "Dr. Meera Sundaram", "56", "14 mins", "Completed"],
      ["Orthopaedics (Room 208)", "Dr. K. Ravichandran", "42", "18 mins", "Active"],
      ["Gynaecology & ANC (Room 110)", "Dr. S. Priya", "62", "15 mins", "Active"],
    ],
  },
  2: {
    title: "Central Pharmacy Medicine Stock & Dispense Audit",
    category: "Inventory Surveillance",
    dateRange: "Week Ending 27 Aug 2026",
    facility: "Central Hospital Pharmacy Depot",
    summary: "Stock audit across essential list items. Metformin 500mg and Regular Insulin identified at critical reorder levels. Emergency resupply order CMSD-2026-904 placed.",
    stats: [
      { label: "Items Stocked", value: "148 SKU" },
      { label: "Dispensed Today", value: "1,240 Units" },
      { label: "Critical Stockouts", value: "2 Items" },
      { label: "Fulfilment Rate", value: "97.4%" },
    ],
    tableHeaders: ["Medicine & Strength", "Current Stock", "Weekly Dispensed", "Buffer Threshold", "Status"],
    tableRows: [
      ["Paracetamol 500mg Tablets", "2,400 Units", "840 Units", "500 Units", "Optimal"],
      ["Metoprolol Succinate 50mg", "850 Units", "210 Units", "200 Units", "Optimal"],
      ["Atorvastatin 20mg", "320 Units", "180 Units", "150 Units", "Adequate"],
      ["Metformin 500mg (SR)", "18 Units", "340 Units", "100 Units", "Critical Low"],
      ["Insulin Regular 100IU", "12 Vials", "64 Vials", "30 Vials", "Reorder Placed"],
    ],
  },
  3: {
    title: "Physician & Specialist Roster Attendance Report",
    category: "Clinical Human Resources",
    dateRange: "This Week (21 - 27 Aug 2026)",
    facility: "Clinical Specialist Wing",
    summary: "Specialist attendance at 94%. Cardiology and General Medicine covered continuously. Spoke PHC teleconsultation coverage active across 6 blocks.",
    stats: [
      { label: "Duty Doctors", value: "18 Assigned" },
      { label: "On-Site Attendance", value: "94.2%" },
      { label: "Teleconsult Hours", value: "42 Hours" },
      { label: "Night Emergency Coverage", value: "100%" },
    ],
    tableHeaders: ["Doctor Name", "Specialty", "Roster Shift", "OPD Patients", "Teleconsult Sessions"],
    tableRows: [
      ["Dr. Ananya Natarajan", "Cardiology", "Morning + Tele", "184", "24 Sessions"],
      ["Dr. S. Karthikeyan", "General Medicine", "Full Day", "312", "18 Sessions"],
      ["Dr. Meera Sundaram", "Paediatrics", "Morning OPD", "148", "6 Sessions"],
      ["Dr. K. Ravichandran", "Orthopaedics", "Afternoon OPD", "118", "4 Sessions"],
    ],
  },
  4: {
    title: "Diagnostic Equipment & Turnaround Time Analysis",
    category: "Diagnostics & Imaging",
    dateRange: "August 2026",
    facility: "Diagnostic Imaging & Clinical Pathology",
    summary: "ECG, Digital X-Ray, and Automated Biochemistry operational at 99.2% uptime. 12-lead ECG tele-reporting average turnaround: 8 minutes.",
    stats: [
      { label: "Total Tests Run", value: "1,842" },
      { label: "Avg ECG Turnaround", value: "8.4 mins" },
      { label: "X-Ray Volume", value: "418 Scans" },
      { label: "Equipment Uptime", value: "99.2%" },
    ],
    tableHeaders: ["Modality", "Equipment Model", "Tests (MTD)", "Avg Wait Time", "Status"],
    tableRows: [
      ["12-Lead ECG", "BPL Cardiart 108T", "542 Tests", "10 mins", "Calibrated / Active"],
      ["Digital X-Ray (500mA)", "Siemens Multix", "418 Scans", "15 mins", "Active"],
      ["Automated Blood Biochemistry", "Erba Chem-7", "620 Tests", "45 mins", "Active"],
      ["Ultrasound (Sonography)", "GE Healthcare", "262 Scans", "20 mins", "Active"],
    ],
  },
  5: {
    title: "Inter-Facility Referral Pipeline & Transfer Audit",
    category: "Continuity of Care",
    dateRange: "August 2026",
    facility: "Nandurbar Hub-and-Spoke Teleconsult Network",
    summary: "88 referrals received from Dhadgaon, Akkalkuwa, and Navapur PHC spokes. 94% evaluated within 48 hours of primary triage.",
    stats: [
      { label: "Inbound Referrals", value: "88 Patients" },
      { label: "Accepted & Treated", value: "83" },
      { label: "Outbound Tertiary", value: "8 to Dhule Med" },
      { label: "Transit Support Rate", value: "100%" },
    ],
    tableHeaders: ["Referring Facility", "Primary Specialty", "Total Referred", "Accepted", "Avg Time to Slot"],
    tableRows: [
      ["Dhadgaon Rural PHC Hub", "Cardiology / Internal Med", "34", "32", "24 Hours"],
      ["Akkalkuwa Primary Health Centre", "Obstetrics / Gynae", "28", "27", "18 Hours"],
      ["Mokhada Sub-Centre", "Orthopaedics", "16", "15", "36 Hours"],
      ["Toranmal Tribal Spoke", "Paediatrics / Emergency", "10", "9", "Same Day"],
    ],
  },
  6: {
    title: "Outpatient Load & Peak Hours Distribution",
    category: "Capacity Planning",
    dateRange: "August 2026",
    facility: "Outpatient Reception & Token Registry",
    summary: "Peak OPD footfall observed between 09:30 AM and 11:45 AM (averaging 68 patients/hour). Token queue automated allocation reduced waiting hall crowding by 38%.",
    stats: [
      { label: "Peak Inflow Window", value: "09:30 - 11:30 AM" },
      { label: "Token Queue Efficiency", value: "+38%" },
      { label: "Digital Registration", value: "78.4%" },
      { label: "Counter Wait Time", value: "4.2 mins" },
    ],
    tableHeaders: ["Time Window", "Avg Hourly Arrivals", "Staff on Counters", "Congestion Index", "Recommendation"],
    tableRows: [
      ["08:00 AM - 09:30 AM", "28 Patients", "2 Counters", "Low", "Normal Roster"],
      ["09:30 AM - 11:30 AM", "68 Patients", "4 Counters", "High", "Add 1 Floater Counter"],
      ["11:30 AM - 01:30 PM", "44 Patients", "3 Counters", "Moderate", "Normal Roster"],
      ["02:00 PM - 04:30 PM", "22 Patients", "2 Counters", "Low", "Teleconsult Shift"],
    ],
  },
};

const reports = [
  { id: 1, title: 'OPD Summary', description: 'Patient footfall, demographics, and average consultation times.', range: 'Today', icon: Users },
  { id: 2, title: 'Medicine Inventory', description: 'Current stock levels, consumption rates, and near-expiry alerts.', range: 'This Week', icon: Pill },
  { id: 3, title: 'Doctor Availability', description: 'Attendance logs and scheduled vs actual active hours.', range: 'This Week', icon: Stethoscope },
  { id: 4, title: 'Diagnostics', description: 'Test volume, turnaround times, and equipment utilization.', range: 'This Month', icon: Activity },
  { id: 5, title: 'Referral Summary', description: 'Inbound and outbound referral tracking and outcomes.', range: 'This Month', icon: ArrowRightLeft },
  { id: 6, title: 'Patient Load', description: 'Peak hours analysis and department-wise distribution.', range: 'This Week', icon: FileText },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);

  return (
    <div className="space-y-6 max-w-[1100px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-burgundy-700">Clinical Operations</div>
          <h1 className="text-2xl font-extrabold text-ink-primary tracking-tight">Facility Reports &amp; Analytics</h1>
          <p className="text-sm text-ink-secondary mt-0.5">Live operational telemetry, stock registries, and outpatient performance audits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs flex flex-col h-full hover:border-[rgba(124,45,45,0.18)] transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blush rounded-xl text-burgundy-700 border border-[rgba(124,45,45,0.12)]">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-ink-primary text-base">{report.title}</h3>
                  <p className="text-[13px] text-ink-secondary mt-1 leading-snug">{report.description}</p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-[rgba(124,45,45,0.06)] flex items-center justify-between">
                <span className="text-xs font-bold text-ink-secondary bg-bg px-2.5 py-1 rounded-md border border-[rgba(124,45,45,0.06)]">
                  {report.range}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedReport(SAMPLE_REPORT_DATA[report.id] || SAMPLE_REPORT_DATA[1])}
                    className="text-burgundy-700 hover:text-burgundy-800 bg-blush hover:bg-rose px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition-colors border border-[rgba(124,45,45,0.12)] cursor-pointer"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => setSelectedReport(SAMPLE_REPORT_DATA[report.id] || SAMPLE_REPORT_DATA[1])}
                    className="flex items-center gap-1 text-ink-secondary hover:text-ink-primary bg-bg hover:bg-blush border border-[rgba(124,45,45,0.1)] px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── INTERACTIVE DETAILED REPORT MODAL ── */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[18px] max-w-[760px] w-full shadow-2xl border border-[rgba(124,45,45,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Operational Audit Record
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

              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-ink-primary font-sans">
                {/* Header */}
                <div className="border-b-2 border-burgundy-800 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-burgundy-700 uppercase">
                      PRAGATI Health Facility Telemetry · Government of Maharashtra
                    </div>
                    <h2 className="text-[18px] font-black text-ink-primary">{selectedReport.title}</h2>
                    <p className="text-[11.5px] text-ink-secondary">{selectedReport.facility} · {selectedReport.dateRange}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="w-12 h-12 bg-bg border border-[rgba(124,45,45,0.15)] rounded flex items-center justify-center mx-auto text-ink-tertiary">
                      <QrCode className="w-9 h-9 text-ink-primary" />
                    </div>
                    <span className="text-[8px] font-mono text-ink-tertiary block mt-0.5">AUDIT VERIFIED</span>
                  </div>
                </div>

                {/* KPI stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedReport.stats.map((s) => (
                    <div key={s.label} className="p-3 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.06)] text-center">
                      <div className="text-[18px] font-black font-mono text-burgundy-800">{s.value}</div>
                      <div className="text-[10.5px] text-ink-secondary font-semibold mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-[#FAF8F6] p-3.5 rounded-[8px] border border-[rgba(124,45,45,0.08)] text-[12.5px] leading-relaxed">
                  <strong>Executive Summary: </strong>
                  <span className="text-ink-secondary">{selectedReport.summary}</span>
                </div>

                {/* Data Table */}
                <div className="space-y-2">
                  <div className="text-[12px] font-bold text-ink-primary">Detailed Breakdown:</div>
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead>
                      <tr className="border-b border-ink-primary/20 bg-bg text-[10px] uppercase font-bold text-ink-tertiary">
                        {selectedReport.tableHeaders.map((th) => (
                          <th key={th} className="py-2 px-2.5">{th}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(124,45,45,0.06)]">
                      {selectedReport.tableRows.map((row, idx) => (
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
              </div>

              <div className="p-4 bg-bg border-t border-[rgba(124,45,45,0.08)] flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-burgundy-700 text-white font-bold text-[12px] rounded-[8px]"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
