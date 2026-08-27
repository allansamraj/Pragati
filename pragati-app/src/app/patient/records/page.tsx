"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, ChevronRight, Filter, Lock, Printer, X, ShieldCheck, Activity, QrCode, Stethoscope, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { DEMO_HEALTH_RECORDS, type HealthRecord } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";

const RECORD_TYPE_COLORS: Record<HealthRecord["type"], string> = {
  consultation:  "bg-blush border-[rgba(124,45,45,0.15)] text-burgundy-800",
  report:        "bg-emerald-50 border-emerald-200 text-emerald-800",
  prescription:  "bg-cyan-50 border-cyan-200 text-cyan-800",
  scan:          "bg-amber-50 border-amber-200 text-amber-800",
  discharge:     "bg-purple-50 border-purple-200 text-purple-800",
  referral:      "bg-blush border-[rgba(124,45,45,0.15)] text-burgundy-800",
  consent:       "bg-emerald-50 border-emerald-200 text-emerald-800",
};

export default function RecordsPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<HealthRecord | null>(null);

  const RECORD_TYPE_LABELS: Record<HealthRecord["type"], string> = {
    consultation:  t("records.consultations"),
    report:        t("records.reports"),
    prescription:  t("records.prescriptions"),
    scan:          "Scan",
    discharge:     "Discharge",
    referral:      t("records.referrals"),
    consent:       "Informed Consent",
  };

  const categories = [
    { key: "All", label: t("records.all") },
    { key: "Reports", label: "Diagnostic Reports" },
    { key: "Consultations", label: t("records.consultations") },
    { key: "Scans", label: "Scans & Radiology" },
    { key: "Discharge", label: "Discharge Summaries" },
    { key: "Consent", label: "Informed Consent" },
  ];

  const filtered = DEMO_HEALTH_RECORDS.filter((r) => {
    if (activeCategory === "All") return true;
    const map: Record<string, HealthRecord["type"][]> = {
      Consultations: ["consultation"],
      Reports:       ["report"],
      Scans:         ["scan"],
      Discharge:     ["discharge"],
      Consent:       ["consent"],
    };
    return map[activeCategory]?.includes(r.type) ?? true;
  });

  return (
    <div className="max-w-[880px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-burgundy-700 mb-1">
            {t("records.title")}
          </div>
          <h1 className="text-[26px] font-extrabold text-ink-primary tracking-tight">
            {t("records.abha")}
          </h1>
          <p className="text-[12.5px] text-ink-secondary mt-0.5">
            Longitudinal electronic health records verified under Ayushman Bharat Digital Mission (ABDM)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-ink-tertiary bg-white border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-2 shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-emerald-600" aria-hidden />
          <span className="font-semibold text-ink-secondary">ABHA: 77-8923-4512-6734</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat.key}
            role="tab"
            aria-selected={activeCategory === cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`text-[12.5px] font-bold px-3.5 py-1.5 rounded-[8px] transition-all cursor-pointer ${
              activeCategory === cat.key
                ? "bg-burgundy-700 text-white shadow-2xs"
                : "bg-white border border-[rgba(124,45,45,0.12)] text-ink-secondary hover:bg-blush"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3.5">
        {filtered.map((record, i) => {
          const isExpanded = activeRecordId === record.id;
          const typeCls = RECORD_TYPE_COLORS[record.type];
          const typeLabel = RECORD_TYPE_LABELS[record.type] ?? record.type;

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] shadow-2xs overflow-hidden"
            >
              <div
                className="p-4 sm:p-5 cursor-pointer hover:bg-bg/40 transition-colors"
                onClick={() => setActiveRecordId(isExpanded ? null : record.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Date column */}
                  <div className="w-14 flex-shrink-0 text-center bg-bg p-2 rounded-[8px] border border-[rgba(124,45,45,0.06)]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-burgundy-700">
                      {record.displayDate.split(" ")[1]}
                    </div>
                    <div className="text-[20px] font-extrabold font-mono text-ink-primary leading-tight">
                      {record.displayDate.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-ink-tertiary">
                      {record.displayDate.split(" ")[2]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[15px] font-bold text-ink-primary">{record.title}</h3>
                      <span className={`text-[10px] font-bold border rounded px-2 py-0.2 uppercase ${typeCls}`}>
                        {typeLabel}
                      </span>
                    </div>
                    <div className="text-[12px] font-semibold text-ink-secondary">{record.facility}</div>
                    {record.doctor && (
                      <div className="text-[11.5px] text-ink-tertiary mt-0.5">{record.doctor}</div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {record.hasDocument && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDoc(record);
                        }}
                        className="px-3 py-1.5 bg-blush hover:bg-rose text-burgundy-700 border border-[rgba(124,45,45,0.15)] rounded-[7px] text-[11.5px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Report
                      </button>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 text-ink-tertiary transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[rgba(124,45,45,0.08)] space-y-3">
                    <div>
                      <span className="text-[10.5px] uppercase font-bold text-ink-tertiary block mb-1">
                        Clinical Summary &amp; Findings:
                      </span>
                      <p className="text-[12.5px] text-ink-primary leading-relaxed bg-bg p-3 rounded-[8px] border border-[rgba(124,45,45,0.06)]">
                        {record.summary}
                      </p>
                    </div>

                    {/* Preview Table of Lab Values if available */}
                    {record.labValues && (
                      <div className="space-y-1.5">
                        <span className="text-[10.5px] uppercase font-bold text-ink-tertiary block">
                          Key Test Parameters:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {record.labValues.slice(0, 4).map((param) => (
                            <div key={param.parameter} className="p-2 bg-bg rounded-[6px] border border-[rgba(124,45,45,0.06)] text-[11px]">
                              <span className="text-ink-tertiary block truncate">{param.parameter}</span>
                              <strong className="text-[13px] text-ink-primary font-mono">{param.result} {param.unit}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-ink-tertiary">File size: {record.fileSize || "1.2 MB"}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDoc(record);
                        }}
                        className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white font-bold rounded-[8px] text-[12px] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Open Full Official Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── INTERACTIVE CLINICAL REPORT VIEWER MODAL ── */}
      <AnimatePresence>
        {viewingDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[18px] max-w-[700px] w-full shadow-2xl border border-[rgba(124,45,45,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11.5px] font-bold text-ink-primary uppercase tracking-wider">
                    Official Diagnostic Report · {viewingDoc.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary" title="Print Report">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewingDoc(null)} className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Medical Report Paper */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-ink-primary font-sans">
                {/* Letterhead */}
                <div className="border-b-2 border-burgundy-800 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-burgundy-700 uppercase">
                      Public Health Department · Government of Maharashtra
                    </div>
                    <h2 className="text-[17px] font-black text-ink-primary tracking-tight">
                      {viewingDoc.facility.toUpperCase()}
                    </h2>
                    <p className="text-[11px] text-ink-secondary">
                      {viewingDoc.hospitalDept || "Department of Clinical Diagnostics & Pathology"} · Diagnostic Accreditation No: MH-PATH-2024-881
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="w-12 h-12 bg-bg border border-[rgba(124,45,45,0.15)] rounded flex items-center justify-center mx-auto text-ink-tertiary">
                      <QrCode className="w-9 h-9 text-ink-primary" />
                    </div>
                    <span className="text-[8px] font-mono text-ink-tertiary block mt-0.5">ABDM AUTHENTICATED</span>
                  </div>
                </div>

                {/* Patient Details Bar */}
                <div className="grid grid-cols-3 gap-3 text-[11.5px] bg-[#FAF8F6] p-3 rounded-[8px] border border-[rgba(124,45,45,0.08)]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Patient Name</span>
                    <strong>Arun Sundaram</strong>
                    <div className="text-[10px] text-ink-secondary">54 Yrs / Male · Blood: B+</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary block">ABHA Address</span>
                    <strong className="font-mono">77-8923-4512-6734</strong>
                    <div className="text-[10px] text-ink-secondary">Chennai District</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Report Date</span>
                    <strong>{viewingDoc.displayDate}</strong>
                    <div className="text-[10px] text-ink-secondary">Time: 11:20 AM IST</div>
                  </div>
                </div>

                {/* Report Title */}
                <div>
                  <h3 className="text-[15px] font-extrabold text-burgundy-800 border-b border-burgundy-200 pb-1">
                    {viewingDoc.title}
                  </h3>
                </div>

                {/* ECG Trace Visualization if ECG report */}
                {viewingDoc.id === "rec-002" && (
                  <div className="space-y-2 bg-[#FAF5F5] border border-rose-200 rounded-[10px] p-3">
                    <div className="flex items-center justify-between text-[11px] text-ink-secondary font-semibold">
                      <span>Lead II Rhythm Strip (25mm/s, 10mm/mV):</span>
                      <span className="text-emerald-700 font-mono font-bold">HR: 74 BPM (Normal Sinus Rhythm)</span>
                    </div>
                    {/* SVG ECG Waveform */}
                    <div className="h-20 w-full bg-[#161210] rounded-[6px] p-2 flex items-center overflow-hidden">
                      <svg viewBox="0 0 600 60" className="w-full h-full" preserveAspectRatio="none">
                        <path
                          d="M0,30 L40,30 L45,26 L50,30 L60,30 L65,10 L70,55 L75,22 L80,30 L95,30 L105,18 L115,30 L160,30 L165,26 L170,30 L180,30 L185,10 L190,55 L195,22 L200,30 L215,30 L225,18 L235,30 L280,30 L285,26 L290,30 L300,30 L305,10 L310,55 L315,22 L320,30 L335,30 L345,18 L355,30 L400,30 L405,26 L410,30 L420,30 L425,10 L430,55 L435,22 L440,30 L455,30 L465,18 L475,30 L520,30 L525,26 L530,30 L540,30 L545,10 L550,55 L555,22 L560,30 L600,30"
                          fill="none"
                          stroke="#34D399"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Lab Parameter Table if Lab Report */}
                {viewingDoc.labValues && (
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead>
                      <tr className="border-b border-ink-primary/20 bg-bg text-[10px] uppercase font-bold text-ink-tertiary">
                        <th className="py-2 px-2">Investigation / Parameter</th>
                        <th className="py-2 px-2">Observed Result</th>
                        <th className="py-2 px-2">Biological Reference Interval</th>
                        <th className="py-2 px-2">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(124,45,45,0.06)]">
                      {viewingDoc.labValues.map((v) => (
                        <tr key={v.parameter} className={v.status === "high" ? "bg-amber-50/50" : ""}>
                          <td className="py-2 px-2 font-semibold text-ink-primary">{v.parameter}</td>
                          <td className="py-2 px-2 font-mono font-bold">
                            {v.result} <span className="text-[10px] text-ink-tertiary">{v.unit}</span>
                          </td>
                          <td className="py-2 px-2 text-ink-secondary">{v.normalRange} {v.unit}</td>
                          <td className="py-2 px-2">
                            {v.status === "high" ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">ELEVATED</span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">NORMAL</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Radiology / Clinical Findings */}
                <div className="space-y-1 bg-bg p-3 rounded-[8px] border border-[rgba(124,45,45,0.06)] text-[12px]">
                  <strong>Clinical Impression / Interpretation:</strong>
                  <p className="text-ink-secondary leading-relaxed">
                    {viewingDoc.summary}
                  </p>
                </div>

                {/* Sign-off */}
                <div className="pt-4 border-t border-[rgba(124,45,45,0.1)] flex items-end justify-between text-[11px]">
                  <div>
                    <div className="text-[10px] text-ink-tertiary">Laboratory Verification:</div>
                    <div className="text-emerald-700 font-semibold">Quality Control: Passed (Internal Calibrated)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic text-[14px] text-burgundy-800 font-bold">{viewingDoc.doctor}</div>
                    <div className="text-[9.5px] font-mono text-emerald-700">Digitally Authenticated Electronic Record</div>
                    <div className="text-[9px] text-ink-tertiary">{viewingDoc.displayDate} IST</div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-bg border-t border-[rgba(124,45,45,0.08)] flex justify-end gap-2">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 bg-burgundy-700 text-white font-bold text-[12px] rounded-[8px] shadow-2xs cursor-pointer"
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
