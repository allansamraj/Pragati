"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Phone, CheckCircle2, AlertCircle, XCircle,
  ArrowRight, RefreshCw, Ticket, Video, ChevronLeft, Navigation
} from "lucide-react";
import { DEMO_FACILITIES } from "@/data/facilities";
import { StatusBadge } from "@/components/ui";
import { useLocationContext } from "@/lib/context/LocationContext";

type Status = "available" | "limited" | "unavailable";

function StatusPill({ status }: { status: Status }) {
  const label = status === "available" ? "Available" : status === "limited" ? "Limited" : "Unavailable";
  const icon = status === "available" ? <CheckCircle2 className="w-3 h-3" /> : status === "limited" ? <AlertCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;
  const cls = status === "available" ? "text-available-500 bg-available-50 border-available-100" :
    status === "limited" ? "text-limited-500 bg-limited-50 border-limited-100" :
    "text-critical-500 bg-critical-50 border-critical-100";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border rounded px-2 py-0.5 ${cls}`} role="status" aria-label={label}>
      <span aria-hidden>{icon}</span>{label}
    </span>
  );
}

export default function FacilityDetailPage({ params }: { params: { id: string } }) {
  const { getDistanceTo, getDirectionsUrl, locality } = useLocationContext();
  const facility = DEMO_FACILITIES.find((f) => f.id === params.id) ?? DEMO_FACILITIES[0];

  const { distanceKm, travelMinutes } = getDistanceTo(facility.lat, facility.lng);

  return (
    <div className="max-w-[900px] space-y-5">
      {/* Back */}
      <Link href="/patient/find-care" className="inline-flex items-center gap-1.5 text-[13px] text-ink-tertiary hover:text-ink-primary transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Care Finder
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-[rgba(124,45,45,0.12)] rounded-[18px] overflow-hidden shadow-2xs"
      >
        <div className="bg-blush/20 border-b border-[rgba(124,45,45,0.08)] px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {(facility.matchScore ?? 0) >= 90 && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-burgundy-700 bg-surface border border-[rgba(124,45,45,0.18)] rounded px-1.5 py-0.5">Best Match</span>
                )}
                <StatusBadge status={facility.isOpen ? "available" : "unavailable"} label={facility.isOpen ? "Open Now" : "Closed"} size="sm" />
              </div>
              <h1 className="text-[22px] font-bold text-ink-primary" style={{ letterSpacing: "-0.015em" }}>{facility.name}</h1>
              <div className="text-[13px] text-ink-tertiary mt-0.5">{facility.type}</div>
              <div className="flex items-center gap-4 mt-3 flex-wrap text-[12px] text-ink-secondary">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-burgundy-600" aria-hidden />{facility.address}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" aria-hidden />{facility.hours}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" aria-hidden />{facility.phone}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="text-[28px] font-bold font-mono text-emerald-700">{facility.matchScore || 94}%</div>
              <div className="text-[9px] uppercase tracking-widest text-ink-tertiary font-bold">Suitability Score</div>
              <div className="text-[12.5px] font-bold text-burgundy-700 mt-1">
                {distanceKm} km from {locality} (~{travelMinutes} min)
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="px-6 py-4 flex items-center gap-3 flex-wrap bg-bg/50">
          <Link
            href="/patient/token"
            className="flex items-center gap-2 bg-burgundy-700 text-white text-[13.5px] font-bold px-5 py-2.5 rounded-[10px] hover:bg-burgundy-800 transition-colors shadow-2xs"
          >
            <Ticket className="w-4 h-4" /> Book Token (#{facility.queue?.nowServing || 41})
          </Link>
          <a
            href={getDirectionsUrl(facility.lat, facility.lng, facility.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-[rgba(124,45,45,0.15)] text-ink-primary hover:text-burgundy-700 text-[13.5px] font-bold px-4 py-2.5 rounded-[10px] hover:bg-blush transition-colors"
          >
            <Navigation className="w-4 h-4 text-burgundy-700" /> Get Directions
          </a>
          {facility.hasTelemedicine && (
            <Link
              href="/patient/teleconsult"
              className="flex items-center gap-2 border border-[rgba(124,45,45,0.15)] text-burgundy-700 text-[13.5px] font-semibold px-4 py-2.5 rounded-[10px] hover:bg-rose transition-colors bg-blush"
            >
              <Video className="w-4 h-4" /> Request Teleconsultation
            </Link>
          )}
        </div>
      </motion.div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Doctors */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs"
        >
          <h2 className="text-[14px] font-bold text-ink-primary mb-4">Specialist Doctors On Duty</h2>
          <div className="space-y-3">
            {facility.doctors.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-2 p-2.5 rounded-[8px] bg-bg border border-[rgba(124,45,45,0.06)]">
                <div>
                  <div className="text-[13px] font-bold text-ink-primary">{doc.name}</div>
                  <div className="text-[11px] text-ink-tertiary">{doc.specialty}</div>
                  {doc.nextSlot && doc.status !== "unavailable" && (
                    <div className="text-[10px] text-available-600 font-medium mt-0.5">Next Slot: {doc.nextSlot}</div>
                  )}
                </div>
                <StatusPill status={doc.status} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Diagnostics */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs"
        >
          <h2 className="text-[14px] font-bold text-ink-primary mb-4">Diagnostics &amp; Lab Capacity</h2>
          <div className="space-y-3">
            {facility.diagnostics.map((diag) => (
              <div key={diag.id} className="flex items-center justify-between gap-2 p-2.5 rounded-[8px] bg-bg border border-[rgba(124,45,45,0.06)]">
                <div>
                  <div className="text-[13px] font-bold text-ink-primary">{diag.name}</div>
                  {diag.waitTime && diag.status !== "unavailable" && (
                    <div className="text-[11px] text-ink-tertiary">Est. wait: {diag.waitTime} mins</div>
                  )}
                </div>
                <StatusPill status={diag.status} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
