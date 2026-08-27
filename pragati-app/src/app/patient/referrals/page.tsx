"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, MapPin, Calendar, Clock, Lock, ChevronRight } from "lucide-react";
import { DEMO_REFERRAL } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";

const STEP_ORDER = ["created", "accepted", "scheduled", "arrived", "consulted", "continued"];

export default function ReferralsPage() {
  const { t } = useLanguage();
  const ref = DEMO_REFERRAL;
  const currentStepIdx = STEP_ORDER.indexOf(ref.status);

  const referralSteps = [
    { key: "created",   label: t("ref.status.created"),   sub: "Referral issued by referring doctor" },
    { key: "accepted",  label: t("ref.status.accepted"),  sub: "Receiving facility confirmed" },
    { key: "scheduled", label: t("ref.status.scheduled"), sub: "30 Aug 2026 · 10:30 AM" },
    { key: "arrived",   label: t("ref.status.arrived"),   sub: "" },
    { key: "consulted", label: t("ref.status.consulted"), sub: "" },
    { key: "continued", label: t("ref.status.continued"), sub: "" },
  ];

  return (
    <div className="max-w-[720px]">
      <div className="eyebrow mb-2">{t("patient.nav.referrals")}</div>
      <h1 className="text-[26px] font-bold text-ink-primary mb-6" style={{ letterSpacing: "-0.02em" }}>
        {t("ref.title")}
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[18px] shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="bg-blush/20 border-b border-[rgba(124,45,45,0.08)] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1.5">{t("ref.active")}</div>
              <h2 className="text-[16px] font-bold text-ink-primary mb-1">{ref.specialty} Specialist Referral</h2>
              <p className="text-[13px] text-ink-secondary max-w-[400px]">{ref.reason}</p>
            </div>
            <div className="text-[11px] font-semibold text-available-500 bg-available-50 border border-available-100 rounded px-2 py-1">
              {t("ref.inProgress")}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Facility journey */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-6">
            <div className="bg-bg border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1.5">{t("ref.from")}</div>
              <div className="text-[13px] font-bold text-ink-primary">{ref.referringFacility}</div>
              <div className="text-[11px] text-ink-tertiary mt-0.5">{ref.referringDoctor}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-burgundy-600 flex-shrink-0" aria-hidden />
            <div className="bg-blush border border-[rgba(124,45,45,0.12)] rounded-[12px] p-4">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1.5">{t("ref.to")}</div>
              <div className="text-[13px] font-bold text-ink-primary">{ref.receivingFacility}</div>
              <div className="text-[11px] text-ink-tertiary mt-0.5">{ref.receivingDoctor}</div>
            </div>
          </div>

          {/* Appointment info */}
          {ref.appointmentDate && (
            <div className="flex items-center gap-4 mb-6 p-3.5 bg-bg border border-[rgba(124,45,45,0.08)] rounded-[10px]">
              <div className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
                <Calendar className="w-4 h-4 text-burgundy-600" aria-hidden />
                {ref.appointmentDate}
              </div>
              <div className="w-px h-4 bg-[rgba(124,45,45,0.1)]" />
              <div className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
                <Clock className="w-4 h-4 text-burgundy-600" aria-hidden />
                {ref.appointmentTime}
              </div>
              <div className="w-px h-4 bg-[rgba(124,45,45,0.1)]" />
              <div className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
                <MapPin className="w-4 h-4 text-burgundy-600" aria-hidden />
                {ref.receivingFacility}
              </div>
            </div>
          )}

          {/* Tracker */}
          <div className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary mb-4">{t("ref.title")}</div>
          <div className="space-y-0" role="list" aria-label="Referral progress steps">
            {referralSteps.map((step, i) => {
              const isDone = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;

              return (
                <div
                  key={step.key}
                  role="listitem"
                  className="flex items-start gap-4"
                >
                  {/* Timeline line + icon */}
                  <div className="flex flex-col items-center">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-available-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-ink-tertiary/40 flex-shrink-0" />
                    )}
                    {i < referralSteps.length - 1 && (
                      <div className={`w-0.5 h-10 ${isDone && i < currentStepIdx ? "bg-available-500" : "bg-[rgba(124,45,45,0.1)]"}`} />
                    )}
                  </div>

                  <div className="pb-6">
                    <div className={`text-[13px] font-bold ${isDone ? "text-ink-primary" : "text-ink-tertiary"}`}>
                      {step.label}
                    </div>
                    {step.sub && (
                      <div className="text-[11px] text-ink-tertiary mt-0.5">{step.sub}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transport & consent info */}
          <div className="mt-4 pt-4 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[12px] text-ink-tertiary">
            <div>{t("ref.transport")}</div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-available-500" />
              {t("ref.consent")}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
