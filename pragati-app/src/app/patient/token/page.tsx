"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin, RefreshCw, ArrowRight, Share2, Navigation } from "lucide-react";
import { DEMO_PATIENT } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";
import { useLocationContext } from "@/lib/context/LocationContext";

export default function TokenPage() {
  const { t } = useLanguage();
  const { nearbyFacilities, getDirectionsUrl } = useLocationContext();
  const token = DEMO_PATIENT.activeToken!;
  const queueTokens = [41, 42, 43, 44, 45, 46, 47];

  // Matched facility for token
  const matchedFacility = nearbyFacilities.find((f) => f.name.includes("Nandurbar") || f.name.includes("Civil")) || nearbyFacilities[0];
  const dist = matchedFacility?.distanceKm ?? 2.4;
  const travel = matchedFacility?.travelMinutes ?? 10;

  return (
    <div className="max-w-[640px] space-y-5">
      <div>
        <div className="eyebrow mb-1">{t("patient.nav.token")}</div>
        <h1 className="text-[26px] font-bold text-ink-primary tracking-tight">
          {t("token.title")}
        </h1>
        <p className="text-[13px] text-ink-secondary mt-0.5">
          Live outpatient queue tracking with proximity and estimated consultation window
        </p>
      </div>

      {/* Token card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-[rgba(124,45,45,0.12)] rounded-[18px] shadow-sm overflow-hidden"
      >
        {/* Facility header */}
        <div className="bg-blush/30 border-b border-[rgba(124,45,45,0.07)] px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-ink-primary">{token.facilityName}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-[12px] text-ink-tertiary flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-burgundy-700" aria-hidden />
                <span>Nandurbar District Civil Hospital · {token.specialty}</span>
                <span className="font-bold text-burgundy-700 bg-white border border-[rgba(124,45,45,0.1)] px-1.5 py-0.2 rounded text-[10.5px]">
                  {dist} km from you (~{travel} min)
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-available-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-available-500" aria-hidden />
                {t("common.openNow")}
              </div>
              <div className="text-[10px] text-ink-tertiary mt-0.5">{t("token.booked")} {token.bookedAt}</div>
            </div>
          </div>
        </div>

        {/* Token number — the hero element */}
        <div className="p-8 text-center border-b border-[rgba(124,45,45,0.06)]">
          <div className="text-[13px] font-semibold uppercase tracking-widest text-ink-tertiary mb-2">
            {t("token.yourToken")}
          </div>
          <div
            className="text-[96px] font-bold font-mono text-burgundy-700 leading-none"
            aria-label={`Token number ${token.tokenNumber}`}
          >
            #{token.tokenNumber}
          </div>
          <div className="text-[14px] font-semibold text-ink-secondary mt-3">
            Cardiology OPD · Dr. Ananya Rao
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-[rgba(124,45,45,0.07)] bg-bg/50">
          <div className="p-5 text-center">
            <div className="text-[11px] uppercase tracking-widest text-ink-tertiary mb-1">{t("token.nowServing")}</div>
            <div className="text-[32px] font-bold font-mono text-ink-primary">#{token.nowServing}</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-[11px] uppercase tracking-widest text-ink-tertiary mb-1">{t("token.ahead")}</div>
            <div className="text-[32px] font-bold font-mono text-ink-primary">{token.tokenNumber - token.nowServing}</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-[11px] uppercase tracking-widest text-ink-tertiary mb-1">{t("token.estimatedWait")}</div>
            <div className="flex items-end justify-center gap-1">
              <div className="text-[32px] font-bold font-mono text-ink-primary leading-none">{token.estimatedWait}</div>
              <div className="text-[13px] text-ink-tertiary mb-1">{t("token.min")}</div>
            </div>
          </div>
        </div>

        {/* Location & Navigation Action Footer */}
        <div className="p-4 bg-bg border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[12px] text-ink-secondary">
            Estimated Arrival: <strong className="text-ink-primary">Leave by 10:15 AM</strong>
          </div>
          <a
            href={getDirectionsUrl(matchedFacility?.lat ?? 21.3734, matchedFacility?.lng ?? 74.2404, token.facilityName)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[8px] text-[12px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> Get Directions
          </a>
        </div>
      </motion.div>

      {/* Visual queue tokens */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-bold text-ink-primary">OPD Token Sequence</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <RefreshCw className="w-3 h-3" aria-hidden />
            {t("token.refresh")}
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="list" aria-label="Queue tokens">
          {queueTokens.map((num) => {
            const isYours = num === token.tokenNumber;
            const isServing = num === token.nowServing;
            return (
              <div
                key={num}
                className={`w-12 h-12 rounded-[10px] flex items-center justify-center font-mono font-bold text-[15px] border ${
                  isYours
                    ? "bg-burgundy-700 text-white border-burgundy-800 ring-2 ring-burgundy-600/30"
                    : isServing
                    ? "bg-available-50 text-available-600 border-available-500"
                    : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)]"
                }`}
              >
                #{num}
              </div>
            );
          })}
        </div>
        <p className="text-[11.5px] text-ink-tertiary mt-3">
          ● Green: Now inside consultation · Burgundy: Your assigned token (#47).
        </p>
      </motion.div>
    </div>
  );
}
