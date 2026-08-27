"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { DEMO_PATIENT } from "@/data/patient";
import { StatusBadge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";

export default function AppointmentsPage() {
  const { t } = useLanguage();
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
    <div className="max-w-[760px]">
      <div className="eyebrow mb-2">{t("patient.nav.appointments")}</div>
      <h1 className="text-[26px] font-bold text-ink-primary mb-6" style={{ letterSpacing: "-0.02em" }}>
        {t("appt.title")}
      </h1>

      {/* Upcoming appointments */}
      <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 mb-5">
        <h2 className="text-[15px] font-bold text-ink-primary mb-4">{t("appt.upcoming")}</h2>
        <div className="space-y-3">
          {appointments.map((appt, i) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="flex items-start gap-4 p-4 rounded-[12px] bg-bg border border-[rgba(124,45,45,0.08)] hover:border-[rgba(124,45,45,0.16)] transition-colors"
            >
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
                  <h3 className="text-[13px] font-bold text-ink-primary">{appt.type}</h3>
                  <StatusBadge status={appt.status === "confirmed" ? "available" : "pending"} label={appt.status === "confirmed" ? t("appt.confirmed") : t("appt.pending")} size="sm" />
                </div>
                <div className="text-[12px] text-ink-secondary">{appt.specialty}</div>
                {appt.doctor && <div className="text-[11px] text-ink-tertiary">{appt.doctor}</div>}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-[11px] text-ink-tertiary">
                    <Clock className="w-3 h-3" aria-hidden /> {appt.time}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-ink-tertiary">
                    <MapPin className="w-3 h-3" aria-hidden /> {appt.facility}
                  </div>
                </div>
                {appt.notes && (
                  <div className="mt-2 text-[11px] text-ink-tertiary italic">{appt.notes}</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full care timeline */}
      <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5">
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
