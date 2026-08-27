"use client";

import React from "react";
import { Phone, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const EMERGENCY_FACILITIES = [
  { name: "Nandurbar District Civil Hospital", type: "District Hospital (24/7 Trauma)", distance: "14.2 km", travel: "28 min", hasEmergency: true },
  { name: "Navapur Sub-district Hospital", type: "Sub-district Hospital", distance: "28.5 km", travel: "44 min", hasEmergency: true },
];

export default function EmergencyPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-[600px]">
      {/* Emergency call — primary action, always prominent */}
      <div className="bg-critical-500 rounded-[18px] p-8 text-center mb-6">
        <AlertTriangle className="w-10 h-10 text-white mx-auto mb-3" aria-hidden />
        <h1 className="text-[28px] font-bold text-white mb-2">{t("emergency.title")}</h1>
        <p className="text-white/80 text-[15px] mb-6">
          {t("emergency.subtitle")}
        </p>
        <a
          href="tel:108"
          className="inline-flex items-center gap-3 bg-white text-critical-500 text-[20px] font-bold px-8 py-4 rounded-[12px] hover:bg-critical-50 transition-colors shadow-md"
          aria-label="Call emergency services 108"
        >
          <Phone className="w-6 h-6" />
          {t("emergency.call108")}
        </a>
      </div>

      {/* Nearest emergency facilities */}
      <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5">
        <h2 className="text-[15px] font-bold text-ink-primary mb-4">{t("emergency.nearestFacilities")}</h2>
        <div className="space-y-3">
          {EMERGENCY_FACILITIES.map((f) => (
            <div key={f.name} className="flex items-start justify-between gap-4 p-4 bg-bg border border-[rgba(124,45,45,0.08)] rounded-[12px]">
              <div>
                <div className="text-[13px] font-bold text-ink-primary mb-1">{f.name}</div>
                <div className="text-[11px] text-ink-tertiary mb-2">{f.type}</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-ink-secondary">
                    <MapPin className="w-3 h-3" aria-hidden />
                    {t("emergency.distance")}: {f.distance}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-ink-secondary">
                    <Clock className="w-3 h-3" aria-hidden />
                    {t("emergency.travel")}: {f.travel}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-[11px] font-semibold text-available-500 bg-available-50 border border-available-100 rounded px-2 py-1 mb-2">
                  {t("common.available")}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-ink-tertiary mt-4">
          {t("common.demoData")}. {t("triage.call108")}.
        </p>
      </div>
    </div>
  );
}
