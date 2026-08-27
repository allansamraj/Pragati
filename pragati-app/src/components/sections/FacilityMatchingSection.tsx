"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, AlertCircle, XCircle,
  MapPin, Clock, ChevronRight
} from "lucide-react";

const MATCH_CRITERIA = ["Need", "Specialist", "Diagnostic", "Availability", "Distance"];

const FACILITIES = [
  {
    rank: 1,
    name: "Nandurbar District Civil Hospital",
    type: "District Hospital",
    distance: "14.2 km",
    travel: "28 min",
    score: 94,
    open: true,
    queue: "18 min",
    reasons: [
      { label: "Cardiologist available", status: "pass" as const },
      { label: "ECG available", status: "pass" as const },
      { label: "Open now", status: "pass" as const },
      { label: "Queue 18 min", status: "pass" as const },
    ],
    isBest: true,
  },
  {
    rank: 2,
    name: "Navapur Sub-district Hospital",
    type: "Sub-district Hospital",
    distance: "28.5 km",
    travel: "44 min",
    score: 78,
    open: true,
    queue: "35 min",
    reasons: [
      { label: "Cardiologist on-call", status: "pass" as const },
      { label: "ECG limited availability", status: "warn" as const },
    ],
    isBest: false,
  },
  {
    rank: 3,
    name: "Dhadgaon Rural Hospital & PHC Hub",
    type: "Rural Hospital",
    distance: "42.0 km",
    travel: "65 min",
    score: 54,
    open: true,
    queue: "12 min",
    reasons: [
      { label: "Specialist via Teleconsult only", status: "fail" as const },
    ],
    isBest: false,
  },
];

type Status = "pass" | "warn" | "fail";

function StatusRow({ label, status }: { label: string; status: Status }) {
  const config: Record<Status, { icon: React.ReactNode; color: string }> = {
    pass: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-available-500" },
    warn: { icon: <AlertCircle className="w-3.5 h-3.5" />, color: "text-limited-500" },
    fail: { icon: <XCircle className="w-3.5 h-3.5" />, color: "text-critical-500" },
  };
  const { icon, color } = config[status];
  return (
    <div className="flex items-center gap-2">
      <span className={color} aria-hidden>{icon}</span>
      <span className="text-[12px] text-ink-secondary">{label}</span>
    </div>
  );
}

export function FacilityMatchingSection() {
  const [selectedFacility, setSelectedFacility] = useState(0);
  const active = FACILITIES[selectedFacility];

  return (
    <section
      id="platform"
      className="section-py bg-surface border-t border-[rgba(124,45,45,0.06)]"
      aria-labelledby="matching-heading"
    >
      <div className="section-container">
        {/* Header */}
        <div className="mb-12">
          <div className="eyebrow mb-4">Smart Facility Matching</div>
          <h2
            id="matching-heading"
            className="text-[clamp(28px,3.5vw,40px)] font-bold text-ink-primary text-balance max-w-[560px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            The nearest hospital isn't always{" "}
            <span className="text-burgundy-700">the right hospital.</span>
          </h2>
          <p className="text-[16px] text-ink-secondary mt-3 max-w-[500px]">
            PRAGATI matches what the patient needs with what healthcare facilities can currently provide.
          </p>
        </div>

        {/* Main matching UI */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">

          {/* LEFT — Patient Need panel */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] shadow-xs overflow-hidden"
          >
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-[rgba(124,45,45,0.07)] bg-blush/30">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary">
                Patient Need
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Care requested */}
              <div>
                <div className="text-[11px] text-ink-tertiary font-medium mb-2">Care requested</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-burgundy-600 flex-shrink-0" aria-hidden />
                    <span className="text-[13px] font-semibold text-ink-primary">Cardiology consultation</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-burgundy-600 flex-shrink-0" aria-hidden />
                    <span className="text-[13px] font-semibold text-ink-primary">ECG</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[rgba(124,45,45,0.07)]" />

              {/* Location */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-tertiary">Location</span>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink-primary">
                  <MapPin className="w-3.5 h-3.5 text-burgundy-600" aria-hidden />
                  Nandurbar, Maharashtra
                </div>
              </div>

              {/* Urgency */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-tertiary">Urgency</span>
                <span className="text-[11px] font-semibold text-limited-500 bg-limited-50 border border-limited-100 rounded px-2 py-0.5">
                  Routine
                </span>
              </div>

              <div className="h-px bg-[rgba(124,45,45,0.07)]" />

              {/* Match criteria */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-2.5">
                  Matched using
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MATCH_CRITERIA.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] font-medium text-ink-secondary bg-surface-2 border border-[rgba(124,45,45,0.08)] rounded px-2 py-1"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Facility results */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            {FACILITIES.map((facility, i) => {
              const isSelected = selectedFacility === i;
              const scoreColor =
                facility.score >= 85 ? "text-available-500" :
                facility.score >= 65 ? "text-limited-500" : "text-critical-500";

              return (
                <button
                  key={facility.rank}
                  onClick={() => setSelectedFacility(i)}
                  className={`w-full text-left rounded-[12px] border p-4 transition-all duration-200 ${
                    isSelected
                      ? "bg-blush border-[rgba(124,45,45,0.25)] shadow-md ring-1 ring-[rgba(124,45,45,0.12)]"
                      : "bg-surface border-[rgba(124,45,45,0.08)] hover:bg-blush/50 hover:border-[rgba(124,45,45,0.15)]"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${facility.name}, ${facility.score}% match`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-[6px] bg-surface border border-[rgba(124,45,45,0.1)] flex items-center justify-center">
                        <span className="text-[12px] font-bold font-mono text-ink-tertiary">
                          {String(facility.rank).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[14px] font-bold text-ink-primary leading-tight">{facility.name}</h3>
                          {facility.isBest && (
                            <span className="text-[9px] font-bold tracking-widest uppercase text-burgundy-700 bg-surface border border-[rgba(124,45,45,0.18)] rounded px-1.5 py-0.5 flex-shrink-0">
                              Best Match
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-tertiary mt-0.5">{facility.type}</div>

                        {/* Distance + travel */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-[11px] text-ink-secondary">
                            <MapPin className="w-3 h-3 text-ink-tertiary" aria-hidden />
                            {facility.distance}
                          </div>
                          <div className="w-px h-3 bg-[rgba(124,45,45,0.1)]" aria-hidden />
                          <div className="flex items-center gap-1 text-[11px] text-ink-secondary">
                            <Clock className="w-3 h-3 text-ink-tertiary" aria-hidden />
                            {facility.travel}
                          </div>
                          {facility.open && (
                            <>
                              <div className="w-px h-3 bg-[rgba(124,45,45,0.1)]" aria-hidden />
                              <div className="flex items-center gap-1 text-[11px] text-available-500 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-available-500" aria-hidden />
                                Open now
                              </div>
                            </>
                          )}
                        </div>

                        {/* Status indicators */}
                        <div className="mt-3 space-y-1.5">
                          {facility.reasons.map((r) => (
                            <StatusRow key={r.label} label={r.label} status={r.status} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Match score */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-[24px] font-bold font-mono ${scoreColor}`}>{facility.score}%</div>
                      <div className="text-[9px] uppercase tracking-widest text-ink-tertiary">match</div>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-burgundy-700 font-semibold justify-end">
                          View <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Footnote */}
            <p className="text-[12px] text-ink-tertiary px-1 pt-1">
              Match scores are calculated using provider-updated availability data. All data shown is for demonstration.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
