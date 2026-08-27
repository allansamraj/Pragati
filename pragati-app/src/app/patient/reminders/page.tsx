"use client";
import React from "react";
import { useLanguage } from "@/lib/i18n";

export default function RemindersPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-[640px]">
      <div className="eyebrow mb-2">{t("patient.nav.reminders")}</div>
      <h1 className="text-[26px] font-bold text-ink-primary mb-6" style={{ letterSpacing: "-0.02em" }}>{t("remind.title")}</h1>
      <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-6 space-y-3">
        {[
          { time: `${t("common.today")}, morning`, label: "Metoprolol Succinate 50mg", note: "Once daily" },
          { time: `${t("common.today")}, with meals`, label: "Metformin 500mg", note: `Twice daily — ${t("rx.refillNeeded")}` },
          { time: "30 Aug, 10:30 AM", label: "Cardiology Follow-up", note: "Nandurbar District Civil Hospital" },
          { time: "02 Sep, 8:00 AM", label: "Blood Test (Fasting)", note: "Nandurbar District Civil Hospital" },
        ].map((r) => (
          <div key={r.label} className="flex items-start gap-3 p-3.5 bg-bg border border-[rgba(124,45,45,0.08)] rounded-[10px]">
            <div className="w-2 h-2 rounded-full bg-burgundy-600 mt-1.5 flex-shrink-0" aria-hidden />
            <div>
              <div className="text-[13px] font-semibold text-ink-primary">{r.label}</div>
              <div className="text-[11px] text-ink-tertiary mt-0.5">{r.time}</div>
              <div className="text-[11px] text-ink-secondary mt-0.5 italic">{r.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
