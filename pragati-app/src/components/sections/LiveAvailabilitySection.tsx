"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle, Clock, RefreshCw } from "lucide-react";

type Status = "available" | "limited" | "unavailable";

function StatusPill({ status, label }: { status: Status; label: string }) {
  const config: Record<Status, { icon: React.ReactNode; cls: string }> = {
    available:   { icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: "text-available-500 bg-available-50 border-available-100" },
    limited:     { icon: <AlertCircle className="w-3.5 h-3.5" />,  cls: "text-limited-500 bg-limited-50 border-limited-100" },
    unavailable: { icon: <XCircle className="w-3.5 h-3.5" />,      cls: "text-critical-500 bg-critical-50 border-critical-100" },
  };
  const { icon, cls } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold border rounded px-2 py-0.5 ${cls}`} role="status">
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}

const DOCTORS = [
  { name: "Dr. Ananya Rao",    specialty: "Cardiology",    status: "available"   as Status, slot: "10:30 AM" },
  { name: "Dr. Meera Shah",    specialty: "Paediatrics",   status: "available"   as Status, slot: "11:00 AM" },
  { name: "Dr. Priya Krishnan",specialty: "Gynaecology",   status: "unavailable" as Status },
  { name: "Dr. Ramesh Kumar",  specialty: "General Med.",  status: "available"   as Status, slot: "10:00 AM" },
];

const DIAGNOSTICS = [
  { name: "ECG",       status: "available"   as Status, wait: "15 min" },
  { name: "X-Ray",     status: "available"   as Status, wait: "20 min" },
  { name: "CT Scan",   status: "limited"     as Status, wait: "45 min" },
  { name: "Blood Work",status: "available"   as Status, wait: "10 min" },
];

const MEDICINES = [
  { name: "Metoprolol 50mg",   status: "available" as Status },
  { name: "Aspirin 75mg",      status: "available" as Status },
  { name: "Atorvastatin 20mg", status: "limited"   as Status },
];

export function LiveAvailabilitySection() {
  return (
    <section
      id="facilities"
      className="section-py bg-bg border-t border-[rgba(124,45,45,0.06)]"
      aria-labelledby="availability-heading"
    >
      <div className="section-container">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-end mb-12">
          <div>
            <div className="eyebrow mb-4">Live Availability</div>
            <h2
              id="availability-heading"
              className="text-[clamp(28px,3.5vw,40px)] font-bold text-ink-primary text-balance"
              style={{ letterSpacing: "-0.02em" }}
            >
              Know before you travel.
            </h2>
            <p className="text-[16px] text-ink-secondary mt-3 max-w-[440px]">
              Provider-updated availability of doctors, diagnostics and medicines — before you make the journey.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <div className="flex items-center gap-2 text-[13px] text-ink-tertiary bg-surface border border-[rgba(124,45,45,0.08)] rounded-[8px] px-3 py-2">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden />
              Provider updated 3 min ago
            </div>
          </div>
        </div>

        {/* Facility operations panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[18px] shadow-md overflow-hidden"
        >
          {/* Panel header */}
          <div className="px-6 py-4 border-b border-[rgba(124,45,45,0.08)] flex items-center justify-between bg-blush/20">
            <div>
              <h3 className="text-[16px] font-bold text-ink-primary">Nandurbar District Civil Hospital</h3>
              <p className="text-[12px] text-ink-tertiary mt-0.5">District Hospital · Nandurbar, Maharashtra</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-available-500 font-semibold bg-available-50 border border-available-100 rounded px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-available-500" aria-hidden />
                Open Now
              </div>
              <div className="text-[11px] text-ink-tertiary bg-surface border border-[rgba(124,45,45,0.08)] rounded px-2 py-1">
                Mon–Sat, 8AM–8PM
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[rgba(124,45,45,0.07)]">

            {/* DOCTORS */}
            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-4">
                Doctors
              </div>
              <div className="space-y-3">
                {DOCTORS.map((d) => (
                  <div key={d.name} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-ink-primary leading-tight truncate">{d.name}</div>
                      <div className="text-[11px] text-ink-tertiary mt-0.5">{d.specialty}</div>
                      {d.slot && (
                        <div className="flex items-center gap-1 text-[10px] text-ink-tertiary mt-1">
                          <Clock className="w-3 h-3" aria-hidden />
                          Next: {d.slot}
                        </div>
                      )}
                    </div>
                    <StatusPill status={d.status} label={d.status === "available" ? "Available" : d.status === "limited" ? "Limited" : "Unavailable"} />
                  </div>
                ))}
              </div>
            </div>

            {/* DIAGNOSTICS */}
            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-4">
                Diagnostics
              </div>
              <div className="space-y-3">
                {DIAGNOSTICS.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[12px] font-semibold text-ink-primary">{d.name}</div>
                      {d.wait && (
                        <div className="text-[10px] text-ink-tertiary mt-0.5">Wait: {d.wait}</div>
                      )}
                    </div>
                    <StatusPill status={d.status} label={d.status === "available" ? "Available" : d.status === "limited" ? "Limited" : "Unavailable"} />
                  </div>
                ))}
              </div>
            </div>

            {/* MEDICINES */}
            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-4">
                Key Medicines
              </div>
              <div className="space-y-3">
                {MEDICINES.map((m) => (
                  <div key={m.name} className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-ink-primary">{m.name}</div>
                    <StatusPill status={m.status} label={m.status === "available" ? "Available" : m.status === "limited" ? "Limited" : "Unavailable"} />
                  </div>
                ))}
                <p className="text-[11px] text-ink-tertiary pt-1">Selected essential medicines. Full list in facility detail.</p>
              </div>
            </div>

            {/* QUEUE */}
            <div className="p-5 bg-blush/10">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-4">
                OPD Queue
              </div>

              <div className="text-center mb-4">
                <div className="text-[11px] text-ink-tertiary mb-1">Now serving</div>
                <div className="text-[42px] font-bold font-mono text-ink-primary leading-none">#41</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface border border-[rgba(124,45,45,0.08)] rounded-[8px] p-2.5 text-center">
                  <div className="text-[20px] font-bold font-mono text-ink-primary">6</div>
                  <div className="text-[10px] text-ink-tertiary mt-0.5">Ahead of #47</div>
                </div>
                <div className="bg-surface border border-[rgba(124,45,45,0.08)] rounded-[8px] p-2.5 text-center">
                  <div className="text-[20px] font-bold font-mono text-ink-primary">18</div>
                  <div className="text-[10px] text-ink-tertiary mt-0.5">Min est. wait</div>
                </div>
              </div>

              {/* Visual queue tokens */}
              <div className="flex flex-wrap gap-1.5 mb-3" role="list" aria-label="Current queue tokens">
                {[41, 42, 43, 44, 45, 46, 47].map((t) => (
                  <div
                    key={t}
                    role="listitem"
                    aria-label={t === 47 ? `Token ${t} — your position` : `Token ${t}`}
                    className={`queue-token text-[10px] ${
                      t === 41 ? "bg-available-500 text-white" :
                      t === 47 ? "bg-burgundy-700 text-white ring-2 ring-burgundy-700/30" :
                      "bg-surface border border-[rgba(124,45,45,0.1)] text-ink-tertiary"
                    }`}
                  >
                    {t === 47 ? "YOU" : `#${t}`}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                <RefreshCw className="w-3 h-3" aria-hidden />
                Provider updated 3 min ago
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
