"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, ChevronRight, Navigation, Plus, Building2 } from "lucide-react";
import Link from "next/link";
import { DEMO_PATIENT } from "@/data/patient";
import { StatusBadge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { useLocationContext } from "@/lib/context/LocationContext";

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const { locality, nearbyFacilities, getDistanceTo, getDirectionsUrl } = useLocationContext();
  const appointments = DEMO_PATIENT.upcomingAppointments;

  const timeline = [
    { date: t("common.today"), event: "Metformin 500mg", type: "medication", sub: "Take with meals · Both doses", facility: "" },
    { date: "30 Aug", event: "Cardiology Follow-up", type: "appointment", sub: "10:30 AM · Dr. Ananya Rao", facility: "Nandurbar District Civil Hospital" },
    { date: "02 Sep", event: "Blood Test (Fasting)", type: "diagnostic", sub: "8:00 AM · Pathology", facility: "Nandurbar District Civil Hospital" },
    { date: "15 Sep", event: "General Medicine Checkup", type: "appointment", sub: "11:00 AM · Dr. Prakash More", facility: "Nandurbar District Civil Hospital" },
  ];

  const typeConfig: Record<string, { cls: string; label: string }> = {
    appointment: { cls: "text-burgundy-700 bg-blush border-[rgba(124,45,45,0.12)]", label: t("patient.nav.appointments") },
    diagnostic:  { cls: "text-limited-500 bg-limited-50 border-limited-100", label: t("remind.diagnostic") },
    medication:  { cls: "text-available-500 bg-available-50 border-available-100", label: t("remind.medication") },
  };

  return (
    <div className="max-w-[800px] space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="eyebrow mb-1">{t("patient.nav.appointments")}</div>
          <h1 className="text-[26px] font-bold text-ink-primary tracking-tight">
            {t("appt.title")}
          </h1>
          <p className="text-[13px] text-ink-secondary mt-0.5">
            Upcoming clinical visits, consultations, and diagnostic follow-ups
          </p>
        </div>

        <Link
          href="/patient/find-care"
          className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[12.5px] font-bold rounded-[8px] flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Book New Care
        </Link>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs">
        <h2 className="text-[15px] font-bold text-ink-primary mb-4">{t("appt.upcoming")}</h2>
        <div className="space-y-3">
          {appointments.map((appt, i) => {
            // Find facility coordinates if matching in dataset
            const matchedFacility = nearbyFacilities.find((f) => f.name.includes("Nandurbar") || f.name.includes("Civil")) || nearbyFacilities[0];
            const dist = matchedFacility?.distanceKm ?? 2.4;
            const travel = matchedFacility?.travelMinutes ?? 10;

            return (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-[12px] bg-bg border border-[rgba(124,45,45,0.08)] hover:border-[rgba(124,45,45,0.16)] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[10px] bg-blush border border-[rgba(124,45,45,0.12)] flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-[18px] font-bold font-mono text-burgundy-700 leading-none">
                      {appt.date.split("-")[2]}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-ink-tertiary">
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(appt.date.split("-")[1]) - 1]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[13.5px] font-bold text-ink-primary">{appt.type}</h3>
                      <StatusBadge status={appt.status === "confirmed" ? "available" : "pending"} label={appt.status === "confirmed" ? t("appt.confirmed") : t("appt.pending")} size="sm" />
                    </div>
                    <div className="text-[12px] font-semibold text-ink-secondary">{appt.specialty}</div>
                    {appt.doctor && <div className="text-[11.5px] text-ink-tertiary">{appt.doctor}</div>}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11.5px] text-ink-secondary">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-ink-tertiary" aria-hidden /> {appt.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-burgundy-700" aria-hidden /> {appt.facility}
                      </div>
                      <span className="font-bold text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.1)] px-1.5 py-0.2 rounded text-[10.5px]">
                        {dist} km from you (~{travel} min)
                      </span>
                    </div>
                    {appt.notes && (
                      <div className="mt-2 text-[11px] text-ink-tertiary italic">{appt.notes}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                  <a
                    href={getDirectionsUrl(matchedFacility?.lat ?? 21.3734, matchedFacility?.lng ?? 74.2404, appt.facility)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-[8px] bg-white hover:bg-blush border border-[rgba(124,45,45,0.12)] text-[11.5px] font-bold text-ink-secondary hover:text-burgundy-700 flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-burgundy-700" /> Directions
                  </a>
                  <Link
                    href="/patient/token"
                    className="px-3 py-1.5 rounded-[8px] bg-burgundy-700 hover:bg-burgundy-800 text-white text-[11.5px] font-bold transition-colors shadow-2xs"
                  >
                    View Token
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Appointment Discovery / Nearby Available Clinics */}
      <div className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-ink-primary">
              Book Appointment Near You ({locality})
            </h2>
            <p className="text-[11.5px] text-ink-secondary">
              Available public health outpatient departments ordered by proximity
            </p>
          </div>
          <Link href="/patient/find-care" className="text-[12px] font-bold text-burgundy-700 hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {nearbyFacilities.slice(0, 2).map((fac) => (
            <div key={fac.id} className="p-3.5 rounded-[10px] bg-bg border border-[rgba(124,45,45,0.08)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-burgundy-700">{fac.type}</span>
                <h4 className="text-[13px] font-bold text-ink-primary leading-tight mt-0.5">{fac.name}</h4>
                <div className="text-[11px] text-ink-tertiary mt-0.5 font-mono font-semibold">
                  {fac.distanceKm} km away · Open for OPD
                </div>
              </div>
              <Link
                href={`/patient/find-care?q=${encodeURIComponent(fac.name)}`}
                className="px-3 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[6px] text-[11.5px] font-bold shadow-2xs flex-shrink-0"
              >
                Book
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Full care timeline */}
      <div className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs">
        <h2 className="text-[15px] font-bold text-ink-primary mb-4">{t("appt.title")}</h2>
        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {timeline.map((item) => {
            const config = typeConfig[item.type] ?? typeConfig.appointment;
            return (
              <div key={item.date + item.event} className="flex items-start gap-4 py-4">
                <div className="w-14 flex-shrink-0">
                  <div className="text-[11px] font-bold text-ink-tertiary">{item.date}</div>
                </div>
                <div className="w-px self-stretch bg-[rgba(124,45,45,0.07)] flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[13px] font-semibold text-ink-primary">{item.event}</div>
                    <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${config.cls}`}>{config.label}</span>
                  </div>
                  <div className="text-[12px] text-ink-secondary mt-0.5">{item.sub}</div>
                  {item.facility && <div className="text-[11px] text-ink-tertiary mt-0.5">{item.facility}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
