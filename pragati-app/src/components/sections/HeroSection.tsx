"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, MapPin, Clock, CheckCircle2, AlertCircle,
  XCircle, ChevronRight, Search, Star, Zap
} from "lucide-react";
import { Button, Badge, StatusBadge, DemoBadge } from "@/components/ui";

// ─── HERO PRODUCT PREVIEW UI ─────────────────────────────────────────────────
// This renders as an actual UI component, not an image

function MatchIndicator({
  icon, label, status,
}: { icon: React.ReactNode; label: string; status: "pass" | "warn" | "fail" }) {
  return (
    <div className="flex items-center gap-2">
      <span className={status === "pass" ? "text-available-500" : status === "warn" ? "text-limited-500" : "text-critical-500"} aria-hidden>
        {status === "pass" ? <CheckCircle2 className="w-3.5 h-3.5" /> : status === "warn" ? <AlertCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      </span>
      <span className="text-[12px] text-ink-secondary font-medium">{label}</span>
    </div>
  );
}

function FacilityMatchCard({
  rank, name, type, distance, travel, matchScore,
  indicators, isSelected, isBest,
}: {
  rank: number; name: string; type: string; distance: string; travel: string;
  matchScore: number; indicators: Array<{ label: string; status: "pass" | "warn" | "fail" }>;
  isSelected?: boolean; isBest?: boolean;
}) {
  const matchColor = matchScore >= 85 ? "text-available-500" : matchScore >= 65 ? "text-limited-500" : "text-critical-500";
  return (
    <div className={`p-3.5 rounded-[10px] border transition-all duration-200 ${isSelected ? "bg-blush border-[rgba(124,45,45,0.25)] shadow-sm" : "bg-surface border-[rgba(124,45,45,0.08)]"}`}>
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-surface-2 border border-[rgba(124,45,45,0.1)] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-ink-tertiary font-mono">
              {String(rank).padStart(2, "0")}
            </span>
          </div>
          <div>
            {isBest && (
              <div className="mb-1">
                <span className="text-[9px] font-bold tracking-widest uppercase text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-1.5 py-0.5">
                  Best Match
                </span>
              </div>
            )}
            <div className="text-[13px] font-bold text-ink-primary leading-tight">{name}</div>
            <div className="text-[11px] text-ink-tertiary mt-0.5">{type}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-[18px] font-bold font-mono ${matchColor}`}>{matchScore}%</div>
          <div className="text-[9px] uppercase tracking-widest text-ink-tertiary">match</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2.5 pb-2.5 border-b border-[rgba(124,45,45,0.07)]">
        <div className="flex items-center gap-1 text-[11px] text-ink-secondary">
          <MapPin className="w-3 h-3 text-ink-tertiary" aria-hidden />
          {distance}
        </div>
        <div className="w-px h-3 bg-[rgba(124,45,45,0.1)]" />
        <div className="flex items-center gap-1 text-[11px] text-ink-secondary">
          <Clock className="w-3 h-3 text-ink-tertiary" aria-hidden />
          {travel}
        </div>
        {isSelected && (
          <>
            <div className="w-px h-3 bg-[rgba(124,45,45,0.1)]" />
            <div className="flex items-center gap-1 text-[11px] text-available-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-available-500" aria-hidden />
              Open now
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {indicators.map((ind) => (
          <MatchIndicator key={ind.label} icon={null} label={ind.label} status={ind.status} />
        ))}
      </div>

      {isSelected && (
        <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-burgundy-700 bg-blush hover:bg-rose rounded-[8px] py-2 transition-colors">
          View Facility <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── SEARCH PREVIEW ──────────────────────────────────────────────────────────

function HeroSearchPanel() {
  return (
    <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-4 shadow-sm mb-3">
      <div className="text-[11px] font-semibold tracking-widest uppercase text-ink-tertiary mb-2">
        Find Available Care
      </div>
      {/* Query input */}
      <div className="bg-blush border border-[rgba(124,45,45,0.15)] rounded-[10px] p-3 mb-2.5">
        <div className="text-[13px] font-medium text-ink-primary">Cardiology consultation + ECG</div>
      </div>
      {/* Location */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[12px] text-ink-secondary bg-surface-2 border border-[rgba(124,45,45,0.08)] rounded-[8px] px-2.5 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-burgundy-600" aria-hidden />
          Nandurbar, Maharashtra
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-ink-secondary bg-surface-2 border border-[rgba(124,45,45,0.08)] rounded-[8px] px-2.5 py-1.5">
          <Zap className="w-3.5 h-3.5 text-limited-500" aria-hidden />
          Routine
        </div>
      </div>
      {/* CTA */}
      <button className="w-full flex items-center justify-center gap-1.5 bg-burgundy-700 text-white text-[13px] font-semibold rounded-[10px] py-2.5 hover:bg-burgundy-800 transition-colors">
        Find Available Care <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── HERO PRODUCT PREVIEW ─────────────────────────────────────────────────────

function HeroProductPreview() {
  return (
    <div className="relative w-full">
      {/* Device chrome */}
      <div
        className="bg-[#F5F0EE] rounded-[20px] p-3 shadow-lg border border-[rgba(124,45,45,0.1)]"
        role="img"
        aria-label="PRAGATI application preview showing facility matching"
      >
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <div className="w-2 h-2 rounded-full bg-[#EDCECE]" aria-hidden />
          <div className="w-2 h-2 rounded-full bg-[#EDCECE]" aria-hidden />
          <div className="w-2 h-2 rounded-full bg-[#EDCECE]" aria-hidden />
          <div className="flex-1 bg-surface border border-[rgba(124,45,45,0.1)] rounded-[4px] py-1 px-3 ml-2 flex items-center gap-1.5">
            <span className="text-[10px] text-ink-tertiary">pragati.health/find-care</span>
            <DemoBadge className="ml-auto" />
          </div>
        </div>

        {/* App content */}
        <div className="bg-bg rounded-[12px] overflow-hidden">
          {/* Inner top nav */}
          <div className="bg-surface border-b border-[rgba(124,45,45,0.08)] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-burgundy-700 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">P</span>
              </div>
              <span className="text-[12px] font-bold text-ink-primary">PRAGATI</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
              <div className="w-5 h-5 rounded-full bg-blush border border-[rgba(124,45,45,0.1)] flex items-center justify-center">
                <span className="text-[9px] font-bold text-burgundy-700">A</span>
              </div>
              Arjun (Nandurbar)
            </div>
          </div>

          <div className="p-3">
            <HeroSearchPanel />

            {/* Results label */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[11px] font-semibold text-ink-secondary">
                4 facilities matched
              </div>
              <div className="text-[10px] text-ink-tertiary">Sorted by match score</div>
            </div>

            {/* Facility results */}
            <div className="flex flex-col gap-2">
              <FacilityMatchCard
                rank={1} name="Nandurbar District Civil Hospital" type="District Hospital"
                distance="14.2 km" travel="28 min" matchScore={94} isSelected isBest
                indicators={[
                  { label: "Cardiologist available", status: "pass" },
                  { label: "ECG available", status: "pass" },
                  { label: "Queue 18 min", status: "pass" },
                ]}
              />
              <FacilityMatchCard
                rank={2} name="Navapur Sub-district Hospital" type="Sub-district Hospital"
                distance="28.5 km" travel="44 min" matchScore={78}
                indicators={[
                  { label: "Cardiologist on-call", status: "pass" },
                  { label: "ECG limited availability", status: "warn" },
                ]}
              />
              <FacilityMatchCard
                rank={3} name="Dhadgaon Rural Hospital & PHC Hub" type="Rural Hospital"
                distance="42.0 km" travel="65 min" matchScore={54}
                indicators={[
                  { label: "Specialist via Teleconsult only", status: "fail" },
                ]}
              />
            </div>

            {/* Matched using */}
            <div className="mt-3 pt-3 border-t border-[rgba(124,45,45,0.07)]">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-ink-tertiary mb-1.5">
                Matched using
              </div>
              <div className="flex flex-wrap gap-1">
                {["Need", "Specialist", "Diagnostic", "Availability", "Distance"].map((t) => (
                  <span key={t} className="text-[10px] font-medium text-ink-secondary bg-blush border border-[rgba(124,45,45,0.1)] rounded px-1.5 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

const METRICS = [
  { value: "1,284+", label: "Facilities in network" },
  { value: "24 min", label: "Average queue visibility" },
  { value: "24/7", label: "Access support" },
];

export function HeroSection() {
  return (
    <section
      id="hero"
      className="pt-[72px] min-h-[680px] flex items-center bg-bg"
      aria-labelledby="hero-heading"
    >
      <div className="section-container w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Content ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-5">
              <Badge variant="muted">Public Healthcare Access</Badge>
              <span className="text-[11px] font-semibold text-burgundy-700 bg-blush border border-burgundy-200/60 px-2 py-0.5 rounded">
                Maharashtra State Network
              </span>
            </div>

            {/* Headline */}
            <h1 id="hero-heading" className="mb-2" style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: "1.06", letterSpacing: "-0.03em", fontWeight: 800, color: "#1A1210" }}>
              Don't just find
              <br />a hospital.
            </h1>
            <div style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: "1.06", letterSpacing: "-0.03em", fontWeight: 800, color: "#7C2D2D" }} className="mb-6">
              Find available care.
            </div>

            {/* Supporting copy */}
            <p className="text-[17px] text-ink-secondary leading-relaxed mb-8 max-w-[480px]">
              PRAGATI helps patients in rural and underserved areas find the right public healthcare facility — based on their need, specialist availability, services, location and current capacity.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 mb-10">
              <Link
                href="/patient/find-care"
                className="inline-flex items-center gap-2 bg-burgundy-700 text-white text-[15px] font-semibold px-5 py-3 rounded-[10px] hover:bg-burgundy-800 transition-colors shadow-sm"
              >
                Find Care <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#platform"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-secondary hover:text-ink-primary transition-colors px-5 py-3"
              >
                Explore Platform
              </Link>
            </div>

            {/* 4 Distinct Role Access Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
              <Link
                href="/login/patient"
                className="p-3 bg-surface border border-[rgba(124,45,45,0.12)] hover:border-burgundy-700 rounded-[10px] transition-all group"
              >
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-burgundy-700 mb-0.5">Patient</div>
                <div className="text-[12px] font-bold text-ink-primary group-hover:text-burgundy-700 flex items-center justify-between">
                  Patient <ArrowRight className="w-3 h-3 text-ink-tertiary group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-ink-tertiary mt-0.5 truncate">Find Care &amp; Tokens</div>
              </Link>

              <Link
                href="/login/doctor"
                className="p-3 bg-emerald-50/60 border border-emerald-200 hover:border-emerald-600 rounded-[10px] transition-all group"
              >
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">Clinical</div>
                <div className="text-[12px] font-bold text-ink-primary group-hover:text-emerald-800 flex items-center justify-between">
                  Doctor <ArrowRight className="w-3 h-3 text-ink-tertiary group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-ink-tertiary mt-0.5 truncate">OPD &amp; Teleconsult</div>
              </Link>

              <Link
                href="/login/provider"
                className="p-3 bg-blush/60 border border-[rgba(124,45,45,0.15)] hover:border-burgundy-700 rounded-[10px] transition-all group"
              >
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-burgundy-800 mb-0.5">Pharmacy</div>
                <div className="text-[12px] font-bold text-ink-primary group-hover:text-burgundy-700 flex items-center justify-between">
                  Provider <ArrowRight className="w-3 h-3 text-ink-tertiary group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-ink-tertiary mt-0.5 truncate">Medicines &amp; Labs</div>
              </Link>

              <Link
                href="/login/government"
                className="p-3 bg-surface border border-[rgba(124,45,45,0.12)] hover:border-burgundy-700 rounded-[10px] transition-all group"
              >
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">State</div>
                <div className="text-[12px] font-bold text-ink-primary group-hover:text-burgundy-700 flex items-center justify-between">
                  Government <ArrowRight className="w-3 h-3 text-ink-tertiary group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-ink-tertiary mt-0.5 truncate">District Heatmaps</div>
              </Link>
            </div>

            {/* Tagline trifecta */}
            <div className="flex items-center gap-4 mb-10">
              {["Find Care", "Manage Care", "Continue Care"].map((t, i) => (
                <React.Fragment key={t}>
                  {i > 0 && <div className="w-1 h-1 rounded-full bg-coral flex-shrink-0" />}
                  <span className="text-[13px] font-semibold text-ink-tertiary tracking-wide">{t}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-8 pt-8 border-t border-[rgba(124,45,45,0.08)]">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <div className="text-[26px] font-bold font-mono text-ink-primary leading-none">{m.value}</div>
                  <div className="text-[12px] text-ink-tertiary mt-0.5">{m.label}</div>
                </div>
              ))}
              <DemoBadge className="ml-auto self-start" />
            </div>
          </motion.div>

          {/* ── RIGHT: Product Preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <HeroProductPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
