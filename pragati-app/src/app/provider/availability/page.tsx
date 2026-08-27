"use client";
import React, { useState } from "react";

type DStatus = "available" | "unavailable" | "limited";
const DOCTORS: { id: string; name: string; specialty: string; status: DStatus; nextSlot: string; patients: number }[] = [
  { id: "d1", name: "Dr. Ananya Rao",     specialty: "Cardiology",      status: "available",   nextSlot: "10:30 AM", patients: 41 },
  { id: "d2", name: "Dr. Meera Shah",      specialty: "Paediatrics",    status: "available",   nextSlot: "11:00 AM", patients: 28 },
  { id: "d3", name: "Dr. Priya Krishnan",  specialty: "Gynaecology",    status: "unavailable", nextSlot: "–",         patients: 0  },
  { id: "d4", name: "Dr. Ramesh Kumar",    specialty: "General Med",    status: "available",   nextSlot: "10:00 AM", patients: 52 },
  { id: "d5", name: "Dr. Sunita Nair",     specialty: "Dermatology",    status: "limited",     nextSlot: "12:00 PM", patients: 15 },
];
const STATUS_CFG: Record<DStatus, { dot: string; label: string; btn: string }> = {
  available:   { dot: "bg-available-500", label: "Available",   btn: "bg-available-50 border-available-100 text-available-600" },
  limited:     { dot: "bg-limited-500",   label: "Limited",     btn: "bg-limited-50 border-limited-100 text-limited-600" },
  unavailable: { dot: "bg-critical-500",  label: "Unavailable", btn: "bg-critical-50 border-critical-100 text-critical-500" },
};

export default function AvailabilityPage() {
  const [doctors, setDoctors] = useState(DOCTORS);
  const [saved, setSaved] = useState<string | null>(null);

  const cycle = (id: string) => {
    const order: DStatus[] = ["available", "limited", "unavailable"];
    setDoctors((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: order[(order.indexOf(d.status) + 1) % 3] } : d)
    );
  };
  const save = () => { setSaved("Saved"); setTimeout(() => setSaved(null), 2000); };

  return (
    <div className="max-w-[700px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-1">Provider</p>
          <h1 className="text-[24px] font-bold text-ink-primary" style={{ letterSpacing: "-0.02em" }}>Doctor Availability</h1>
        </div>
        <button onClick={save} className="bg-burgundy-700 hover:bg-burgundy-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[8px] transition-colors">
          {saved ?? "Save Changes"}
        </button>
      </div>
      <div className="bg-surface border border-[rgba(124,45,45,0.09)] rounded-[14px] overflow-hidden">
        <div className="px-5 py-3 border-b border-[rgba(124,45,45,0.06)] text-[11px] text-ink-tertiary">
          Click a doctor&apos;s status to cycle: Available → Limited → Unavailable
        </div>
        <div className="divide-y divide-[rgba(124,45,45,0.05)]">
          {doctors.map((d) => {
            const cfg = STATUS_CFG[d.status];
            return (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ink-primary">{d.name}</div>
                  <div className="text-[11px] text-ink-tertiary">{d.specialty} · Next: {d.nextSlot} · {d.patients} today</div>
                </div>
                <button
                  onClick={() => cycle(d.id)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-[7px] border transition-colors ${cfg.btn}`}
                  aria-label={`${d.name} status: ${cfg.label}. Click to change.`}
                >
                  {cfg.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[12px] text-ink-tertiary">Availability updates are visible to patients through PRAGATI. Update before OPD starts.</p>
    </div>
  );
}
