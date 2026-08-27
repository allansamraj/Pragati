"use client";
import React from "react";
import { DEMO_PATIENT } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";

export default function ProfilePage() {
  const { t } = useLanguage();
  const p = DEMO_PATIENT;
  return (
    <div className="max-w-[640px]">
      <div className="eyebrow mb-2">{t("patient.nav.profile")}</div>
      <h1 className="text-[26px] font-bold text-ink-primary mb-6" style={{ letterSpacing: "-0.02em" }}>{t("portal.patient")} {t("patient.nav.profile")}</h1>
      <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center">
            <span className="text-[20px] font-bold text-burgundy-700">AD</span>
          </div>
          <div>
            <div className="text-[18px] font-bold text-ink-primary">{p.name}</div>
            <div className="text-[13px] text-ink-tertiary">ABHA: {p.abhaId}</div>
          </div>
        </div>
        <div className="h-px bg-[rgba(124,45,45,0.07)]" />
        {[
          ["Age", `${p.age} years`],
          ["Gender", p.gender],
          ["Blood Group", p.bloodGroup],
          ["Phone", p.phone],
          [t("findCare.location"), p.location],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-[13px] text-ink-tertiary">{k}</span>
            <span className="text-[13px] font-semibold text-ink-primary">{v}</span>
          </div>
        ))}
        <div className="h-px bg-[rgba(124,45,45,0.07)]" />
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-widest text-ink-tertiary mb-2">Known Conditions</div>
          <div className="flex gap-2 flex-wrap">
            {p.knownConditions.map((c) => (
              <span key={c} className="text-[12px] font-medium text-ink-secondary bg-blush border border-[rgba(124,45,45,0.12)] rounded px-2.5 py-1">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
