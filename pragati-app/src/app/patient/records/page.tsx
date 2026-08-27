"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, ChevronRight, Filter, Lock } from "lucide-react";
import { DEMO_HEALTH_RECORDS, type HealthRecord } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";

const RECORD_TYPE_COLORS: Record<HealthRecord["type"], string> = {
  consultation:  "bg-blush border-[rgba(124,45,45,0.12)] text-burgundy-700",
  report:        "bg-limited-50 border-limited-100 text-limited-500",
  prescription:  "bg-available-50 border-available-100 text-available-500",
  scan:          "bg-limited-50 border-limited-100 text-limited-500",
  discharge:     "bg-critical-50 border-critical-100 text-critical-500",
  referral:      "bg-blush border-[rgba(124,45,45,0.12)] text-burgundy-700",
  consent:       "bg-emerald-50 border-emerald-200 text-emerald-800",
};

export default function RecordsPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeRecord, setActiveRecord] = useState<string | null>(null);

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
    { key: "Consultations", label: t("records.consultations") },
    { key: "Reports", label: t("records.reports") },
    { key: "Prescriptions", label: t("records.prescriptions") },
    { key: "Referrals", label: t("records.referrals") },
    { key: "Consent", label: "Informed Consent" },
  ];

  const filtered = DEMO_HEALTH_RECORDS.filter((r) => {
    if (activeCategory === "All") return true;
    const map: Record<string, HealthRecord["type"][]> = {
      Consultations: ["consultation"],
      Reports:       ["report", "scan"],
      Prescriptions: ["prescription"],
      Referrals:     ["referral"],
      Consent:       ["consent"],
    };
    return map[activeCategory]?.includes(r.type) ?? true;
  });

  return (
    <div className="max-w-[860px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="eyebrow mb-2">{t("records.title")}</div>
          <h1 className="text-[26px] font-bold text-ink-primary" style={{ letterSpacing: "-0.02em" }}>
            {t("records.abha")}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-ink-tertiary bg-surface border border-[rgba(124,45,45,0.08)] rounded-[8px] px-3 py-2">
          <Lock className="w-3 h-3 text-available-500" aria-hidden />
          {t("records.consent")}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6" role="tablist" aria-label="Record categories">
        {categories.map((cat) => (
          <button
            key={cat.key}
            role="tab"
            aria-selected={activeCategory === cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`text-[13px] font-medium px-3.5 py-2 rounded-[8px] transition-colors ${
              activeCategory === cat.key
                ? "bg-burgundy-700 text-white"
                : "bg-surface border border-[rgba(124,45,45,0.1)] text-ink-secondary hover:bg-blush"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map((record, i) => {
          const isActive = activeRecord === record.id;
          const typeCls = RECORD_TYPE_COLORS[record.type];
          const typeLabel = RECORD_TYPE_LABELS[record.type] ?? record.type;

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <button
                className={`w-full text-left p-4 rounded-[12px] border transition-all duration-200 ${
                  isActive
                    ? "bg-blush border-[rgba(124,45,45,0.2)] shadow-sm"
                    : "bg-surface border-[rgba(124,45,45,0.09)] hover:border-[rgba(124,45,45,0.18)] hover:bg-blush/30"
                }`}
                onClick={() => setActiveRecord(isActive ? null : record.id)}
                aria-expanded={isActive}
              >
                <div className="flex items-start gap-4">
                  {/* Date column */}
                  <div className="w-14 flex-shrink-0 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">
                      {record.displayDate.split(" ")[1]}
                    </div>
                    <div className="text-[22px] font-bold font-mono text-ink-primary leading-tight">
                      {record.displayDate.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-ink-tertiary">
                      {record.displayDate.split(" ")[2]}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px self-stretch bg-[rgba(124,45,45,0.08)] flex-shrink-0" aria-hidden />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[14px] font-bold text-ink-primary">{record.title}</h3>
                      <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${typeCls}`}>
                        {typeLabel}
                      </span>
                    </div>
                    <div className="text-[12px] text-ink-secondary">{record.facility}</div>
                    {record.doctor && (
                      <div className="text-[11px] text-ink-tertiary mt-0.5">{record.doctor}</div>
                    )}
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {record.hasDocument && (
                      <span className="text-[10px] font-semibold text-available-500 bg-available-50 border border-available-100 rounded px-1.5 py-0.5">
                        PDF
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 text-ink-tertiary transition-transform duration-150 ${isActive ? "rotate-90" : ""}`}
                      aria-hidden
                    />
                  </div>
                </div>

                {/* Expanded content */}
                {isActive && record.summary && (
                  <div className="mt-4 pt-4 border-t border-[rgba(124,45,45,0.08)] flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1.5">{t("records.diagnosis")}</div>
                      <p className="text-[13px] text-ink-secondary">{record.summary}</p>
                    </div>
                    {record.hasDocument && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="flex items-center gap-1.5 text-[12px] font-semibold text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded-[8px] px-3 py-2 hover:bg-rose transition-colors">
                          <FileText className="w-3.5 h-3.5" aria-hidden /> {t("records.viewPdf")}
                        </button>
                        <button className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary bg-surface border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-2 hover:bg-blush transition-colors">
                          <Download className="w-3.5 h-3.5" aria-hidden /> {t("records.download")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Consent notice */}
      <div className="mt-6 flex items-center gap-2.5 text-[12px] text-ink-tertiary bg-surface border border-[rgba(124,45,45,0.07)] rounded-[10px] p-3.5">
        <Lock className="w-4 h-4 text-available-500 flex-shrink-0" aria-hidden />
        {t("records.consent")}
      </div>
    </div>
  );
}
