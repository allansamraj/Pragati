"use client";

import React from "react";
import { Phone, MapPin, Clock, AlertTriangle, Navigation, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useLocationContext } from "@/lib/context/LocationContext";

export default function EmergencyPage() {
  const { t } = useLanguage();
  const { locality, nearbyFacilities, getDirectionsUrl, isOffline } = useLocationContext();

  // Filter facilities with emergency capability and sort by proximity
  const emergencyFacilities = nearbyFacilities
    .filter((f) => f.emergencyCapability || f.type.includes("Hospital") || f.type.includes("Community"))
    .slice(0, 3);

  return (
    <div className="max-w-[640px] space-y-6">
      {/* Emergency call — primary action, instant 108 direct dial */}
      <div className="bg-rose-700 rounded-[18px] p-8 text-center shadow-lg text-white">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-8 h-8 text-white animate-bounce" aria-hidden />
        </div>
        <div className="text-[11px] font-black uppercase tracking-widest text-white/80 mb-1">
          EMERGENCY TRIAGE &amp; AMBULANCE
        </div>
        <h1 className="text-[28px] font-black mb-2">{t("emergency.title")}</h1>
        <p className="text-white/90 text-[14.5px] max-w-[460px] mx-auto mb-6">
          If you or someone nearby is experiencing acute chest pain, severe trauma, unconsciousness, or difficulty breathing, call immediately.
        </p>
        <a
          href="tel:108"
          className="inline-flex items-center gap-3 bg-white text-rose-700 text-[20px] font-black px-8 py-4 rounded-[12px] hover:bg-rose transition-all shadow-md active:scale-95"
          aria-label="Call emergency services 108"
        >
          <Phone className="w-6 h-6 animate-pulse" />
          {t("emergency.call108")} (Toll-Free)
        </a>
      </div>

      {/* Nearest emergency facilities */}
      <div className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[16px] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-[15.5px] font-extrabold text-ink-primary">
                Nearest Emergency Facilities ({locality})
              </h2>
            </div>
            <p className="text-[12px] text-ink-secondary mt-0.5">
              24/7 Trauma Centres &amp; ICU units ordered by live travel distance
            </p>
          </div>
          {isOffline && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Cached GPS
            </span>
          )}
        </div>

        <div className="space-y-3">
          {emergencyFacilities.map((f) => (
            <div
              key={f.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-bg border border-[rgba(124,45,45,0.08)] rounded-[12px] hover:border-[rgba(124,45,45,0.16)] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                    24/7 Trauma Active
                  </span>
                  <span className="text-[11px] font-extrabold text-burgundy-700 font-mono">
                    {f.distanceKm} km away
                  </span>
                </div>
                <h3 className="text-[14px] font-extrabold text-ink-primary leading-snug">{f.name}</h3>
                <div className="text-[11.5px] text-ink-secondary mt-0.5">{f.type} · {f.address}</div>
                <div className="flex items-center gap-3 mt-2 text-[11.5px] text-ink-secondary flex-wrap">
                  <div className="flex items-center gap-1 font-semibold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> ICU &amp; 12-Lead ECG Active
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-ink-tertiary" /> ~{f.travelMinutes} mins travel time
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                <a
                  href={`tel:${f.phone.replace(/[^0-9]/g, "") || "108"}`}
                  className="px-3 py-2 bg-white hover:bg-blush border border-[rgba(124,45,45,0.12)] text-rose-700 text-[12px] font-bold rounded-[8px] flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={getDirectionsUrl(f.lat, f.lng, f.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[12px] font-bold rounded-[8px] flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" /> Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
