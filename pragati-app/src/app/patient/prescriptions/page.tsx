"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, FileText, Clock, Calendar } from "lucide-react";
import { DEMO_PATIENT } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";

export default function PrescriptionsPage() {
  const { t } = useLanguage();
  const prescriptions = DEMO_PATIENT.currentMedications;

  return (
    <div className="max-w-[780px]">
      <div className="eyebrow mb-2">{t("patient.nav.prescriptions")}</div>
      <h1 className="text-[26px] font-bold text-ink-primary mb-6" style={{ letterSpacing: "-0.02em" }}>
        {t("rx.title")}
      </h1>

      {/* Digital prescription card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[18px] shadow-sm overflow-hidden mb-5"
      >
        {/* Prescription header */}
        <div className="bg-blush/20 border-b border-[rgba(124,45,45,0.08)] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary mb-2">{t("records.prescriptions")}</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center">
                  <span className="text-[14px] font-bold text-burgundy-700">AR</span>
                </div>
                <div>
                  <div className="text-[15px] font-bold text-ink-primary">Dr. Ananya Rao</div>
                  <div className="text-[12px] text-ink-tertiary">Cardiology · Nandurbar District Civil Hospital</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-ink-tertiary">
                <Calendar className="w-3.5 h-3.5" aria-hidden />
                {t("rx.prescribed")}: 25 Aug 2026
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-[12px] font-semibold text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded-[8px] px-3 py-2 hover:bg-rose transition-colors">
                <FileText className="w-3.5 h-3.5" aria-hidden /> {t("rx.viewPdf")}
              </button>
              <button className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary bg-surface border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-2 hover:bg-blush transition-colors">
                <Download className="w-3.5 h-3.5" aria-hidden /> {t("rx.download")}
              </button>
            </div>
          </div>
        </div>

        {/* Medications table */}
        <div className="p-6">
          <div className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary mb-4">{t("records.prescribedMeds")}</div>

          <div className="space-y-3">
            {prescriptions.map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-[12px] border ${med.refillNeeded ? "border-limited-200 bg-limited-50" : "border-[rgba(124,45,45,0.08)] bg-bg"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-ink-primary">{med.name}</h3>
                      {med.refillNeeded && (
                        <span className="text-[10px] font-semibold text-limited-500 bg-limited-50 border border-limited-100 rounded px-1.5 py-0.5">
                          {t("rx.refillNeeded")}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[12px]">
                      <div>
                        <div className="text-ink-tertiary">Dose</div>
                        <div className="font-semibold text-ink-primary mt-0.5">{med.dose}</div>
                      </div>
                      <div>
                        <div className="text-ink-tertiary">{t("rx.frequency")}</div>
                        <div className="font-semibold text-ink-primary mt-0.5">{med.frequency}</div>
                      </div>
                      <div>
                        <div className="text-ink-tertiary">{t("rx.duration")}</div>
                        <div className="font-semibold text-ink-primary mt-0.5">{med.duration}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[22px] font-bold font-mono text-ink-primary">{med.daysRemaining}</div>
                    <div className="text-[10px] text-ink-tertiary">{t("rx.daysLeft")}</div>
                  </div>
                </div>

                {/* Next reminder */}
                <div className="mt-3 pt-3 border-t border-[rgba(124,45,45,0.06)] flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                  <Clock className="w-3 h-3" aria-hidden />
                  {med.frequency.toLowerCase().includes("morning") ? "Next: Today, morning" : "Next: Today, with meals"}
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-5 p-4 bg-blush/30 rounded-[10px] border border-[rgba(124,45,45,0.1)]">
            <div className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary mb-2">{t("tele.notes")}</div>
            <ul className="text-[13px] text-ink-secondary space-y-1.5">
              <li>• Take all medications at the prescribed times.</li>
              <li>• Metformin must be taken with or after meals.</li>
              <li>• Do not stop medications without consulting your doctor.</li>
              <li>• Next follow-up: 30 Aug 2026, 10:30 AM — Dr. Ananya Rao.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
