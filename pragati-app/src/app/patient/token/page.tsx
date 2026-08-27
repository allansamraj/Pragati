"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin, RefreshCw, ArrowRight, Share2 } from "lucide-react";
import { DEMO_PATIENT } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";

export default function TokenPage() {
  const { t } = useLanguage();
  const token = DEMO_PATIENT.activeToken!;
  const queueTokens = [41, 42, 43, 44, 45, 46, 47];

  return (
    <div className="max-w-[640px]">
      <div className="eyebrow mb-2">{t("patient.nav.token")}</div>
      <h1 className="text-[26px] font-bold text-ink-primary mb-6" style={{ letterSpacing: "-0.02em" }}>
        {t("token.title")}
      </h1>

      {/* Token card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[18px] shadow-md overflow-hidden mb-5"
      >
        {/* Facility header */}
        <div className="bg-blush/30 border-b border-[rgba(124,45,45,0.07)] px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[14px] font-bold text-ink-primary">{token.facilityName}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-[12px] text-ink-tertiary">
                <MapPin className="w-3 h-3" aria-hidden />
                Nandurbar District Civil Hospital · {token.specialty}
              </div>
            </div>
            <div className="text-right">
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
          <div className="text-[14px] text-ink-secondary mt-3">
            Cardiology · Dr. Ananya Rao
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-[rgba(124,45,45,0.07)]">
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
      </motion.div>

      {/* Visual queue tokens */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 mb-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-bold text-ink-primary">{t("token.title")}</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <RefreshCw className="w-3 h-3" aria-hidden />
            {t("token.refresh")}
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="list" aria-label="Queue tokens">
          {queueTokens.map((num) => (
            <div
              key={num}
              role="listitem"
              aria-label={num === token.nowServing ? `Token ${num} — currently being served` : num === token.tokenNumber ? `Token ${num} — your position` : `Token ${num}`}
              className={`w-14 h-14 rounded-[10px] flex flex-col items-center justify-center transition-all ${
                num === token.nowServing
                  ? "bg-available-500 text-white shadow-sm"
                  : num === token.tokenNumber
                    ? "bg-burgundy-700 text-white ring-2 ring-burgundy-400/30 shadow-md"
                    : num < token.tokenNumber
                      ? "bg-surface border border-[rgba(124,45,45,0.1)] text-ink-tertiary"
                      : "bg-blush border border-[rgba(124,45,45,0.12)] text-ink-secondary"
              }`}
            >
              <div className="text-[14px] font-bold font-mono">{num === token.tokenNumber ? "YOU" : `#${num}`}</div>
              {num === token.nowServing && <div className="text-[8px] uppercase tracking-wider opacity-80">{t("token.nowServing")}</div>}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-[11px] text-ink-tertiary">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-available-500" aria-hidden /> {t("token.nowServing")}</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-burgundy-700" aria-hidden /> {t("patient.nav.token")}</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blush border border-[rgba(124,45,45,0.12)]" aria-hidden /> {t("common.available")}</div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/patient/find-care"
          className="flex items-center justify-center gap-2 border border-[rgba(124,45,45,0.15)] text-ink-secondary text-[14px] font-medium px-4 py-3 rounded-[10px] hover:bg-blush transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {t("token.share")}
        </Link>
        <Link
          href="/patient/records"
          className="flex items-center justify-center gap-2 bg-burgundy-700 text-white text-[14px] font-semibold px-4 py-3 rounded-[10px] hover:bg-burgundy-800 transition-colors"
        >
          {t("records.title")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
