"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Ticket, CalendarDays, Pill, ArrowRight,
  ChevronRight, FileText, Share2, AlertTriangle,
  Clock, Mic, RefreshCw, CheckCircle2, Bot, Video,
  MapPin, Navigation, ExternalLink, Stethoscope, Building2
} from "lucide-react";
import { sessionService } from "@/lib/auth/sessionService";
import { DEMO_PATIENT } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";
import { useLocationContext } from "@/lib/context/LocationContext";

// ─── METRIC CARD ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon, href, accent = false }: {
  label: string; value: string; sub: string; icon: React.ReactNode; href: string; accent?: boolean;
}) {
  return (
    <Link href={href} className={`block p-4 rounded-[12px] border transition-all duration-150 hover:shadow-2xs group ${
      accent ? "bg-burgundy-700 border-burgundy-800" : "bg-surface border-[rgba(124,45,45,0.09)] hover:border-[rgba(124,45,45,0.18)]"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-[7px] flex items-center justify-center ${accent ? "bg-white/15" : "bg-blush border border-[rgba(124,45,45,0.1)]"}`}>
          <span className={accent ? "text-white" : "text-burgundy-700"}>{icon}</span>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 ${accent ? "text-white/40" : "text-ink-tertiary"}`} aria-hidden />
      </div>
      <div className={`text-[22px] font-bold font-mono leading-none mb-1 ${accent ? "text-white" : "text-ink-primary"}`}>{value}</div>
      <div className={`text-[12px] font-semibold ${accent ? "text-white/80" : "text-ink-primary"}`}>{label}</div>
      <div className={`text-[11px] mt-0.5 ${accent ? "text-white/55" : "text-ink-tertiary"}`}>{sub}</div>
    </Link>
  );
}

// ─── UPCOMING CARE ITEM ───────────────────────────────────────────────────────

function CareItem({ date, event, sub, type }: { date: string; event: string; sub: string; type: "appt" | "med" | "diag" }) {
  const dot = { appt: "bg-burgundy-600", med: "bg-available-500", diag: "bg-limited-500" }[type];
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-[rgba(124,45,45,0.06)] last:border-0">
      <div className="w-14 flex-shrink-0 text-right">
        <span className="text-[11px] font-bold text-ink-tertiary">{date}</span>
      </div>
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dot}`} aria-hidden />
        <div>
          <div className="text-[13px] font-semibold text-ink-primary">{event}</div>
          <div className="text-[11px] text-ink-tertiary mt-0.5">{sub}</div>
        </div>
      </div>
    </div>
  );
}

// ─── RECORD ITEM ─────────────────────────────────────────────────────────────

function RecordItem({ date, title, facility }: { date: string; title: string; facility: string }) {
  return (
    <Link href="/patient/records" className="flex items-center gap-3 py-3 border-b border-[rgba(124,45,45,0.06)] last:border-0 hover:bg-blush/30 -mx-5 px-5 transition-colors group">
      <div className="w-8 h-8 rounded-[7px] bg-blush border border-[rgba(124,45,45,0.1)] flex items-center justify-center flex-shrink-0">
        <FileText className="w-3.5 h-3.5 text-burgundy-600" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-primary">{title}</div>
        <div className="text-[11px] text-ink-tertiary">{date} · {facility}</div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-ink-tertiary group-hover:text-ink-secondary transition-colors flex-shrink-0" aria-hidden />
    </Link>
  );
}

// ─── PATIENT DASHBOARD ────────────────────────────────────────────────────────

export default function PatientDashboard() {
  const { t } = useLanguage();
  const {
    locality,
    source,
    nearbyFacilities,
    searchRadiusKm,
    refreshGPS,
    isRefreshing,
    getDirectionsUrl
  } = useLocationContext();

  const session = sessionService.get();
  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "Arjun";
  const token = DEMO_PATIENT.activeToken!;

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("patient.dashboard.goodMorning")
      : hour < 17
      ? t("patient.dashboard.goodAfternoon")
      : t("patient.dashboard.goodEvening");

  // Take top 3 facilities closest to patient
  const closestFacilities = nearbyFacilities.slice(0, 3);

  return (
    <div className="space-y-6">

      {/* ── HEADER WITH GLOBAL LOCATION CONTEXT ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-2 py-0.5">
                {t("portal.patient")} Dashboard
              </span>
              <button
                onClick={() => refreshGPS(true)}
                className="text-[11px] font-semibold text-ink-secondary hover:text-burgundy-700 flex items-center gap-1 bg-white border border-[rgba(124,45,45,0.1)] px-2 py-0.5 rounded transition-colors cursor-pointer"
                title="Click to refresh GPS location"
              >
                <MapPin className="w-3 h-3 text-rose-500" />
                <span className="truncate max-w-[160px]">{locality}</span>
                <RefreshCw className={`w-2.5 h-2.5 text-ink-tertiary ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <h1 className="text-[26px] font-extrabold text-ink-primary tracking-tight">
              {greeting}, {firstName}.
            </h1>
            <p className="text-[13.5px] text-ink-secondary mt-0.5">
              Find Care · Live Queue Tokens · Telemedicine · Digital Prescriptions
            </p>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/patient/emergency"
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-bold px-3.5 py-2 rounded-[8px] hover:bg-rose-100 transition-colors shadow-2xs"
            aria-label="Emergency help"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" aria-hidden />
            {t("triage.emergency")} (108)
          </Link>
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <MetricCard
          label={t("patient.dashboard.nextAppt")}
          value="30 Aug"
          sub="10:30 AM · Cardiology"
          icon={<CalendarDays className="w-4 h-4" />}
          href="/patient/appointments"
        />
        <MetricCard
          label={t("patient.dashboard.tokenLabel")}
          value={`#${token.tokenNumber}`}
          sub={`${token.tokenNumber - token.nowServing} ${t("token.ahead")} · ~${token.estimatedWait} ${t("token.min")}`}
          icon={<Ticket className="w-4 h-4" />}
          href="/patient/token"
          accent
        />
        <MetricCard
          label={t("patient.dashboard.medications")}
          value="2"
          sub="Next dose: 1:00 PM"
          icon={<Pill className="w-4 h-4" />}
          href="/patient/prescriptions"
        />
        <MetricCard
          label="Nearby Care"
          value={`${closestFacilities.length} Hubs`}
          sub={`Within ${searchRadiusKm} km of you`}
          icon={<Building2 className="w-4 h-4" />}
          href="/patient/find-care"
        />
      </motion.div>

      {/* ── HEALTHCARE NEAR YOU (LOCATION-AWARE REAL-TIME HUBS) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.07 }}
        className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[16px] p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-[15.5px] font-extrabold text-ink-primary">
                Healthcare Near You ({locality})
              </h2>
            </div>
            <p className="text-[12px] text-ink-secondary mt-0.5">
              Public hospitals &amp; clinics dynamically sorted by distance from your coordinates
            </p>
          </div>
          <Link
            href="/patient/find-care"
            className="text-[12.5px] font-bold text-burgundy-700 hover:underline flex items-center gap-1"
          >
            Explore Map &amp; All {nearbyFacilities.length} Facilities <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {closestFacilities.map((fac) => (
            <div
              key={fac.id}
              className="p-4 rounded-[12px] bg-bg border border-[rgba(124,45,45,0.08)] flex flex-col justify-between hover:border-[rgba(124,45,45,0.18)] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                  {fac.isPmJayEmpaneled || fac.ownership === "private_empaneled" ? (
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                      💳 PM-JAY Cashless
                    </span>
                  ) : fac.ownership === "private" ? (
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      🏥 Private
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-burgundy-700 bg-white px-1.5 py-0.5 rounded border border-[rgba(124,45,45,0.1)]">
                      {fac.type}
                    </span>
                  )}
                  <span className="text-[11px] font-extrabold text-burgundy-700 font-mono">
                    {fac.distanceKm} km away
                  </span>
                </div>
                <h3 className="font-bold text-[14px] text-ink-primary leading-snug">{fac.name}</h3>
                <p className="text-[11.5px] text-ink-secondary mt-0.5">
                  ~{fac.travelMinutes} mins travel time · {fac.hours}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[rgba(124,45,45,0.06)] flex items-center justify-between gap-2">
                <Link
                  href="/patient/find-care"
                  className="text-[11.5px] font-bold text-burgundy-700 hover:underline"
                >
                  View Details →
                </Link>
                <a
                  href={getDirectionsUrl(fac.lat, fac.lng, fac.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[6px] text-[11px] font-semibold text-ink-secondary flex items-center gap-1 transition-colors"
                >
                  <Navigation className="w-3 h-3 text-burgundy-700" /> Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── PRAGATI AI CARE VIDEO & CONSENT FEATURED CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="bg-gradient-to-r from-[#2A1E1C] to-[#1A1210] border border-[rgba(124,45,45,0.25)] rounded-[14px] p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-[10px] bg-burgundy-700/80 border border-white/20 flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5">
            <Bot className="w-6 h-6 text-rose-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-300 bg-white/10 rounded-full px-2.5 py-0.5 border border-white/15">
                AI CARE CONSULTATION
              </span>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Session Ready · 30 Aug
              </span>
            </div>
            <h2 className="text-[17px] font-bold text-white leading-snug">
              Diagnostic Coronary Angiogram &amp; Informed Consent
            </h2>
            <p className="text-[12.5px] text-white/80 mt-0.5">
              Supervising: <strong>Dr. Ananya Rao</strong> · Nandurbar District Civil Hospital (Cath Lab)
            </p>
          </div>
        </div>

        <Link
          href="/patient/ai-consultation"
          className="px-5 py-3 bg-burgundy-700 hover:bg-burgundy-600 text-white rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all flex-shrink-0 hover:scale-[1.02]"
        >
          <Video className="w-4 h-4" /> Start AI Consultation →
        </Link>
      </motion.div>

      {/* ── FIND CARE SEARCH QUICK BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs"
      >
        <h2 className="text-[14px] font-bold text-ink-primary mb-3">Find Care Near You</h2>
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-ink-tertiary" aria-hidden />
          <input
            type="text"
            placeholder="Search by symptom or specialty (e.g. 'I need an ECG', 'Cardiology', 'Child fever')..."
            className="w-full h-11 pl-10 pr-12 rounded-[10px] bg-bg border border-[rgba(124,45,45,0.12)] text-[14px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 focus:ring-2 focus:ring-burgundy-600/10 transition-all"
            aria-label="Search for healthcare services"
          />
          <Link href="/patient/find-care?specialty=cardiology" className="absolute right-3 top-2.5 p-1 text-ink-tertiary hover:text-burgundy-700 transition-colors">
            <Mic className="w-4 h-4 text-burgundy-700" />
          </Link>
        </div>
        <Link
          href="/patient/find-care"
          className="flex items-center justify-center gap-2 w-full h-10 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[13.5px] font-bold rounded-[10px] transition-colors shadow-2xs"
        >
          Match Nearest Available Facilities <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* ── CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* Left */}
        <div className="space-y-5">

          {/* Upcoming care */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[14px] font-bold text-ink-primary">{t("appt.upcoming")}</h2>
              <Link href="/patient/appointments" className="text-[12px] text-burgundy-700 font-semibold hover:underline">{t("common.viewAll")}</Link>
            </div>
            <CareItem date={t("common.today")} event="Metformin 500mg" sub="Take with meals — twice daily" type="med" />
            <CareItem date="30 Aug" event="Cardiology Consultation" sub="10:30 AM · Dr. Ananya Rao · Nandurbar Civil Hospital" type="appt" />
            <CareItem date="02 Sep" event="Blood Test (Fasting)" sub="8:00 AM · Pathology · Nandurbar Civil Hospital" type="diag" />
            <CareItem date="15 Sep" event="General Checkup" sub="Dr. Rao · Nandurbar Civil Hospital" type="appt" />
          </motion.div>

          {/* Token status */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-bold text-ink-primary">{t("patient.dashboard.activeToken")}</h2>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                <RefreshCw className="w-3 h-3" aria-hidden />
                {t("token.refresh")}
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-center flex-shrink-0">
                <div className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1">{t("token.yourToken")}</div>
                <div className="text-[56px] font-bold font-mono text-burgundy-700 leading-none" aria-label={`Token number ${token.tokenNumber}`}>
                  #{token.tokenNumber}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2.5">
                {[
                  { label: t("token.nowServing"), value: `#${token.nowServing}` },
                  { label: t("token.ahead"), value: String(token.tokenNumber - token.nowServing) },
                  { label: t("token.estimatedWait"), value: `${token.estimatedWait} ${t("token.min")}` },
                  { label: t("token.specialty"), value: "Cardiology" },
                ].map((s) => (
                  <div key={s.label} className="bg-bg border border-[rgba(124,45,45,0.07)] rounded-[8px] p-2.5 text-center">
                    <div className="text-[15px] font-bold font-mono text-ink-primary">{s.value}</div>
                    <div className="text-[10px] text-ink-tertiary mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/patient/token" className="flex items-center justify-center gap-2 mt-4 h-9 bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[13px] font-semibold text-burgundy-700 hover:bg-rose transition-colors">
              {t("token.title")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* Recent records */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] px-5 py-4 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-bold text-ink-primary">{t("records.title")}</h2>
              <Link href="/patient/records" className="text-[12px] text-burgundy-700 font-semibold hover:underline">{t("common.viewAll")}</Link>
            </div>
            <RecordItem date="25 Aug" title={t("records.prescriptions")} facility="Dr. Ananya Rao" />
            <RecordItem date="24 Aug" title="ECG Report" facility="Cardiology" />
            <RecordItem date="23 Aug" title={t("records.consultations")} facility="Dr. Ananya Rao" />
          </motion.div>

          {/* Referral */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-bold text-ink-primary">{t("ref.title")}</h2>
              <Link href="/patient/referrals" className="text-[12px] text-burgundy-700 font-semibold hover:underline">{t("common.viewAll")}</Link>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 text-center bg-blush border border-[rgba(124,45,45,0.1)] rounded-[8px] p-2.5">
                <div className="text-[10px] text-ink-tertiary">{t("ref.from")}</div>
                <div className="text-[12px] font-bold text-ink-primary mt-0.5">Dhadgaon Rural PHC Hub</div>
              </div>
              <ArrowRight className="w-4 h-4 text-burgundy-600 flex-shrink-0" aria-hidden />
              <div className="flex-1 text-center bg-blush border border-[rgba(124,45,45,0.1)] rounded-[8px] p-2.5">
                <div className="text-[10px] text-ink-tertiary">{t("ref.to")}</div>
                <div className="text-[12px] font-bold text-ink-primary mt-0.5">Nandurbar Civil Hospital</div>
              </div>
            </div>
            <div className="space-y-2">
              {[t("ref.status.created"), t("ref.status.accepted"), t("ref.status.scheduled")].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-available-500 flex-shrink-0" aria-hidden />
                  <span className="text-[12px] text-ink-primary font-medium">{step}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-[rgba(124,45,45,0.15)] flex-shrink-0" aria-hidden />
                <span className="text-[12px] text-ink-tertiary">{t("ref.status.arrived")}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[rgba(124,45,45,0.06)] text-[11px] text-ink-tertiary">
              {t("ref.apptOn")}: 30 Aug 2026 · 10:30 AM
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
