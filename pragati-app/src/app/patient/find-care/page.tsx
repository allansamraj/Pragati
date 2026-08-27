"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Mic, Globe, ArrowRight,
  CheckCircle2, AlertCircle, Zap, ChevronRight,
  Clock, XCircle, Phone, Video, Ticket, AlertTriangle, ShieldCheck
} from "lucide-react";
import { DEMO_FACILITIES, DEMO_SEARCH_CONTEXT } from "@/data/facilities";
import { StatusBadge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";

type TriageLevel = "routine" | "urgent" | "emergency";

function FindCareContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [triageLevel, setTriageLevel] = useState<TriageLevel>("urgent");
  const [searched, setSearched] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState("fac-001");
  const [location, setLocation] = useState("Nandurbar, Maharashtra");

  // React to URL Search Params (e.g. ?specialty=general or ?specialty=cardiology or ?q=...)
  useEffect(() => {
    const specialty = searchParams?.get("specialty");
    const q = searchParams?.get("q");

    if (specialty === "general" || specialty === "phc") {
      setTriageLevel("routine");
      setQuery("Dhadgaon Rural PHC Hub · Routine General OPD & Blood Pressure Check");
      setSearched(true);
    } else if (specialty === "cardiology") {
      setTriageLevel("urgent");
      setQuery("Cardiology Specialist Consultation & 12-Lead ECG (Nandurbar District Civil Hospital)");
      setSearched(true);
    } else if (specialty === "emergency") {
      setTriageLevel("emergency");
      setQuery("Acute Emergency Trauma & 108 Ambulance Dispatch");
      setSearched(true);
    } else if (q) {
      setQuery(q);
      setSearched(true);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const handleTriageSelect = (level: TriageLevel, sampleQueryKey: string) => {
    setTriageLevel(level);
    setQuery(t(sampleQueryKey));
    setSearched(true);
  };

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Page Header */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-2 py-0.5 inline-block mb-1.5">
          {t("findCare.headerEyebrow")}
        </div>
        <h1 className="text-[26px] font-bold text-ink-primary" style={{ letterSpacing: "-0.02em" }}>
          {t("findCare.heading")}
        </h1>
        <p className="text-[14px] text-ink-secondary mt-1">
          {t("findCare.subheading")}
        </p>
      </div>

      {/* ── 3-TIER TRIAGE SELECTOR ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleTriageSelect("routine", "findCare.sampleRoutine")}
          className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
            triageLevel === "routine"
              ? "bg-available-50 border-available-500 shadow-sm ring-1 ring-available-500"
              : "bg-surface border-[rgba(124,45,45,0.1)] hover:bg-blush/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-available-500" />
            <span className="text-[13px] font-bold text-ink-primary">🟢 {t("findCare.routineTitle")}</span>
          </div>
          <p className="text-[11px] text-ink-tertiary">
            {t("findCare.routineDesc")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleTriageSelect("urgent", "findCare.sampleUrgent")}
          className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
            triageLevel === "urgent"
              ? "bg-limited-50 border-limited-500 shadow-sm ring-1 ring-limited-500"
              : "bg-surface border-[rgba(124,45,45,0.1)] hover:bg-blush/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-limited-500" />
            <span className="text-[13px] font-bold text-ink-primary">🟡 {t("findCare.urgentTitle")}</span>
          </div>
          <p className="text-[11px] text-ink-tertiary">
            {t("findCare.urgentDesc")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleTriageSelect("emergency", "findCare.sampleEmergency")}
          className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
            triageLevel === "emergency"
              ? "bg-critical-50 border-critical-500 shadow-sm ring-1 ring-critical-500"
              : "bg-surface border-[rgba(124,45,45,0.1)] hover:bg-critical-50/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-critical-500 animate-pulse" />
            <span className="text-[13px] font-bold text-critical-600">🔴 {t("findCare.emergencyTitle")}</span>
          </div>
          <p className="text-[11px] text-ink-tertiary">
            {t("findCare.emergencyDesc")}
          </p>
        </button>
      </div>

      {/* ── EMERGENCY IMMEDIATE BANNER ── */}
      {triageLevel === "emergency" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-critical-500 text-white rounded-[14px] p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Phone className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-white/80">
                {t("findCare.emergencyBannerTitle")}
              </div>
              <div className="text-[18px] font-bold">{t("findCare.emergencyBannerSubtitle")}</div>
              <p className="text-[13px] text-white/85 mt-0.5">
                {t("findCare.emergencyBannerDesc")}
              </p>
            </div>
          </div>
          <a
            href="tel:108"
            className="inline-flex items-center justify-center gap-2 bg-white text-critical-600 hover:bg-rose px-6 py-3 rounded-[10px] font-bold text-[14px] transition-colors shadow-sm flex-shrink-0"
          >
            <Phone className="w-4 h-4" /> {t("findCare.call108Now")}
          </a>
        </motion.div>
      )}

      {/* Search Input Box */}
      <div id="triage-input" className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-ink-tertiary" aria-hidden />
            <textarea
              id="care-search"
              className="w-full bg-bg border border-[rgba(124,45,45,0.12)] rounded-[10px] text-[14px] text-ink-primary placeholder:text-ink-tertiary pl-10 pr-12 py-3 resize-none focus:outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600/20 transition-all"
              rows={2}
              placeholder={t("findCare.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-3 top-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuery(t("findCare.sampleUrgent"))}
                className="p-1.5 rounded-[6px] hover:bg-blush text-ink-tertiary hover:text-burgundy-700 transition-colors cursor-pointer"
                title="Voice Input (AI Clinical Triage)"
              >
                <Mic className="w-4 h-4 text-burgundy-700" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-bg border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-burgundy-600" />
                <span className="text-[12px] font-semibold text-ink-secondary">{location}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-bg border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-1.5">
                <Zap className="w-3.5 h-3.5 text-limited-500" />
                <span className="text-[12px] font-semibold text-ink-secondary capitalize">{triageLevel} {t("findCare.priority")}</span>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[13px] font-bold px-5 py-2.5 rounded-[9px] transition-colors shadow-xs ml-auto cursor-pointer"
            >
              {t("findCare.matchFacilities")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── AI CLINICAL TRIAGE INTERPRETATION HUD ── */}
      {searched && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[14px] p-5 shadow-xs"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {t("findCare.aiInterpretation")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-bg rounded-[10px] p-4 border border-[rgba(124,45,45,0.06)] text-[12px]">
            <div>
              <span className="text-ink-tertiary block text-[11px]">{t("findCare.dept")}</span>
              <span className="font-bold text-ink-primary text-[13px]">
                {triageLevel === "routine" ? "General Medicine / PHC" : "Cardiology OPD"}
              </span>
            </div>
            <div>
              <span className="text-ink-tertiary block text-[11px]">{t("findCare.diagnosticNeeded")}</span>
              <span className="font-bold text-ink-primary text-[13px]">
                {triageLevel === "routine" ? "Blood Pressure & Vitals" : "ECG (12-Lead)"}
              </span>
            </div>
            <div>
              <span className="text-ink-tertiary block text-[11px]">{t("findCare.triageTier")}</span>
              <span className="font-bold text-limited-500 text-[13px]">
                {triageLevel === "routine" ? "Routine Primary" : "Urgent (OPD Priority)"}
              </span>
            </div>
            <div>
              <span className="text-ink-tertiary block text-[11px]">{t("findCare.teleconsultAvailable")}</span>
              <span className="font-bold text-available-600 text-[13px]">
                Yes (Dr. Ananya Rao)
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── FACILITY RESULTS & SPATIAL MAP ── */}
      {searched && (
        <div id="facility-results" className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 scroll-mt-6">
          {/* Left: Ranked Facilities List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-ink-primary">
                {DEMO_FACILITIES.length} {t("findCare.recommendedFacilities")}
              </h2>
              <span className="text-[12px] text-ink-tertiary">
                {t("findCare.rankedBy")}
              </span>
            </div>

            {DEMO_FACILITIES.map((facility, index) => {
              const isSelected = selectedFacility === facility.id;
              const isBestMatch = index === 0;

              return (
                <motion.div
                  key={facility.id}
                  layout
                  className={`bg-surface rounded-[14px] border transition-all p-5 shadow-xs ${
                    isBestMatch
                      ? "border-burgundy-600/40 ring-1 ring-burgundy-600/20"
                      : "border-[rgba(124,45,45,0.1)] hover:border-burgundy-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      {isBestMatch && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-2 py-0.5 mb-1.5">
                          ★ {t("findCare.bestSuitability")}
                        </div>
                      )}
                      <h3 className="text-[17px] font-bold text-ink-primary">
                        {facility.name}
                      </h3>
                      <div className="text-[12.5px] text-ink-secondary mt-0.5">
                        {facility.type} · {facility.distanceKm} km · ~{facility.travelMinutes} mins travel via SH-4
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[20px] font-extrabold font-mono text-available-600">
                        {facility.matchScore}%
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-ink-tertiary">
                        {t("findCare.suitability")}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5 text-[12px] bg-bg p-3 rounded-[10px] border border-[rgba(124,45,45,0.06)]">
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">Specialist Doctor</span>
                      <span className="font-bold text-available-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dr. Ananya Rao
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">12-Lead ECG</span>
                      <span className="font-bold text-available-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">Diagnostic Wait</span>
                      <span className="font-bold text-ink-primary mt-0.5 block">~15 mins wait</span>
                    </div>
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">OPD Queue</span>
                      <span className="font-bold text-ink-primary mt-0.5 block">18 mins wait</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[rgba(124,45,45,0.08)] flex-wrap">
                    <div className="text-[11.5px] text-ink-tertiary flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-available-500" />
                      Maharashtra Public Health Dept
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/patient/token"
                        className="px-4 py-2 rounded-[8px] bg-burgundy-700 hover:bg-burgundy-800 text-white text-[12.5px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Ticket className="w-3.5 h-3.5" /> {t("findCare.bookTokenBtn")}
                      </Link>

                      <Link
                        href="/patient/teleconsult"
                        className="px-3.5 py-2 rounded-[8px] bg-blush border border-[rgba(124,45,45,0.15)] text-burgundy-700 hover:bg-rose text-[12.5px] font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> {t("findCare.teleconsultBtn")}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Real-time Resource Map */}
          <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-4 flex flex-col h-[560px] sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-ink-primary">{t("findCare.resourceMap")}</h3>
              <span className="text-[10px] text-available-600 bg-available-50 border border-available-100 rounded px-2 py-0.5 font-semibold">
                {t("findCare.gpsActive")}
              </span>
            </div>

            <div className="flex-1 bg-[#1A1210] rounded-[10px] relative overflow-hidden flex flex-col items-center justify-center p-4 text-center border border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(#7C2D2D_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

              <div className="relative z-10 space-y-4">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-white/20 text-white">
                  <MapPin className="w-7 h-7 text-rose-400 animate-bounce" />
                </div>
                <div>
                  <div className="text-white font-bold text-[14px]">Nandurbar District Map Hub</div>
                  <div className="text-white/70 text-[12px] mt-0.5">3 verified public facilities within 25 km</div>
                </div>
                <div className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 rounded-full px-3 py-1 inline-block">
                  ● Dhadgaon Hub ⟷ Nandurbar Civil Route Open
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[11px] text-ink-tertiary">
              <span>● {t("common.available")} (Civil Hospital)</span>
              <span>▲ {t("common.limited")} (Dhadgaon)</span>
              <span>■ {t("common.emergency")} (108 Hub)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FindCarePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-tertiary">Loading PRAGATI Care Finder...</div>}>
      <FindCareContent />
    </Suspense>
  );
}
