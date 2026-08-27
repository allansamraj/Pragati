"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, MapPin, Calendar, Clock, Lock, ChevronRight, Navigation } from "lucide-react";
import Link from "next/link";
import { DEMO_REFERRAL } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";
import { useLocationContext } from "@/lib/context/LocationContext";

const STEP_ORDER = ["created", "accepted", "scheduled", "arrived", "consulted", "continued"];

export default function ReferralsPage() {
  const { t } = useLanguage();
  const { locality, nearbyFacilities, getDirectionsUrl } = useLocationContext();
  const ref = DEMO_REFERRAL;
  const currentStepIdx = STEP_ORDER.indexOf(ref.status);

  // Find facility coordinates if matching in dataset
  const matchedFacility = nearbyFacilities.find((f) => f.name.includes("Nandurbar") || f.name.includes("Civil")) || nearbyFacilities[0];
  const dist = matchedFacility?.distanceKm ?? 2.4;
  const travel = matchedFacility?.travelMinutes ?? 10;

  const referralSteps = [
    { key: "created",   label: t("ref.status.created"),   sub: "Referral issued by referring doctor" },
    { key: "accepted",  label: t("ref.status.accepted"),  sub: "Receiving facility confirmed" },
    { key: "scheduled", label: t("ref.status.scheduled"), sub: "30 Aug 2026 · 10:30 AM" },
    { key: "arrived",   label: t("ref.status.arrived"),   sub: "" },
    { key: "consulted", label: t("ref.status.consulted"), sub: "" },
    { key: "continued", label: t("ref.status.continued"), sub: "" },
  ];

  return (
    <div className="max-w-[760px] space-y-6">
      <div>
        <div className="eyebrow mb-1">{t("patient.nav.referrals")}</div>
        <h1 className="text-[26px] font-bold text-ink-primary tracking-tight">
          {t("ref.title")}
        </h1>
        <p className="text-[13px] text-ink-secondary mt-0.5">
          Continuity of care pathway connecting primary health centres with secondary &amp; tertiary specialist hospitals
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-[rgba(124,45,45,0.12)] rounded-[18px] shadow-2xs overflow-hidden"
      >
        {/* Header */}
        <div className="bg-blush/20 border-b border-[rgba(124,45,45,0.08)] px-6 py-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-widest font-bold text-burgundy-700 mb-1.5">{t("ref.active")}</div>
              <h2 className="text-[17px] font-extrabold text-ink-primary mb-1">{ref.specialty} Specialist Referral</h2>
              <p className="text-[13px] text-ink-secondary max-w-[440px]">{ref.reason}</p>
            </div>
            <div className="text-[11px] font-bold text-available-600 bg-available-50 border border-available-200 rounded px-2.5 py-1">
              {t("ref.inProgress")}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Facility journey */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 mb-6">
            <div className="bg-bg border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4">
              <div className="text-[10px] uppercase tracking-widest font-bold text-ink-tertiary mb-1">{t("ref.from")}</div>
              <div className="text-[13.5px] font-bold text-ink-primary">{ref.referringFacility}</div>
              <div className="text-[11.5px] text-ink-tertiary mt-0.5">{ref.referringDoctor}</div>
            </div>

            <div className="hidden sm:flex justify-center">
              <ChevronRight className="w-5 h-5 text-burgundy-600" aria-hidden />
            </div>

            <div className="bg-blush border border-[rgba(124,45,45,0.12)] rounded-[12px] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-burgundy-700 mb-1">{t("ref.to")}</div>
                <span className="text-[10.5px] font-bold text-burgundy-700 font-mono bg-white px-1.5 py-0.2 rounded border border-[rgba(124,45,45,0.1)]">
                  {dist} km from you
                </span>
              </div>
              <div className="text-[13.5px] font-bold text-ink-primary">{ref.receivingFacility}</div>
              <div className="text-[11.5px] text-ink-secondary mt-0.5">{ref.receivingDoctor}</div>
            </div>
          </div>

          {/* Appointment info */}
          {ref.appointmentDate && (
            <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-bg border border-[rgba(124,45,45,0.08)] rounded-[12px] flex-wrap">
              <div className="flex items-center gap-4 flex-wrap text-[12.5px] text-ink-secondary">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-burgundy-700" aria-hidden />
                  <strong>{ref.appointmentDate}</strong>
                </div>
                <div className="hidden sm:block w-px h-4 bg-[rgba(124,45,45,0.15)]" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-burgundy-700" aria-hidden />
                  {ref.appointmentTime}
                </div>
                <div className="hidden sm:block w-px h-4 bg-[rgba(124,45,45,0.15)]" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-burgundy-700" aria-hidden />
                  {ref.receivingFacility} (~{travel} min travel)
                </div>
              </div>

              <a
                href={getDirectionsUrl(matchedFacility?.lat ?? 21.3734, matchedFacility?.lng ?? 74.2404, ref.receivingFacility)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-white hover:bg-blush border border-[rgba(124,45,45,0.15)] text-burgundy-700 text-[12px] font-bold rounded-[8px] flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5" /> Directions
              </a>
            </div>
          )}

          {/* Tracker */}
          <div className="text-[11px] uppercase tracking-widest font-bold text-ink-tertiary mb-4">Referral Pipeline Steps</div>
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
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                      isDone
                        ? "bg-available-50 border-available-500 text-available-600"
                        : "bg-surface border-[rgba(124,45,45,0.15)] text-ink-tertiary"
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-ink-tertiary" />}
                    </div>
                    {i < referralSteps.length - 1 && (
                      <div className={`w-0.5 h-8 my-0.5 ${isDone && i < currentStepIdx ? "bg-available-500" : "bg-[rgba(124,45,45,0.1)]"}`} />
                    )}
                  </div>
                  <div className="pb-6 pt-0.5">
                    <div className={`text-[13px] font-bold ${isCurrent ? "text-burgundy-700" : isDone ? "text-ink-primary" : "text-ink-tertiary"}`}>
                      {step.label}
                    </div>
                    {step.sub && (
                      <div className="text-[11.5px] text-ink-tertiary mt-0.5">{step.sub}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[11.5px] text-ink-tertiary">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              ABDM Consent Artefact #REF-2026-8812 Verified
            </div>
            <Link href="/patient/records" className="text-burgundy-700 font-bold hover:underline">
              View Linked Health Records →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
