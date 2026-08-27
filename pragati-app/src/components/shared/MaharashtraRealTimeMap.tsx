"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Layers, ShieldCheck, Activity, Users, AlertTriangle, ExternalLink, ChevronRight } from "lucide-react";

export type AccessLevel = "good" | "moderate" | "gap";

export interface DistrictMetric {
  id: string;
  name: string;
  division: string;
  access: AccessLevel;
  score: number;
  lat: number;
  lng: number;
  specialists: string;
  diagnostics: string;
  medicines: string;
  facilitiesCount: number;
  primaryIssue?: string;
  recommendedAction?: string;
}

export const MAHARASHTRA_DISTRICTS: DistrictMetric[] = [
  { id: "mh-mumbai", name: "Mumbai City & Suburban", division: "Konkan", access: "good", score: 92, lat: 19.0760, lng: 72.8777, specialists: "High", diagnostics: "High", medicines: "Optimal", facilitiesCount: 142 },
  { id: "mh-pune", name: "Pune", division: "Pune", access: "good", score: 88, lat: 18.5204, lng: 73.8567, specialists: "High", diagnostics: "High", medicines: "Optimal", facilitiesCount: 118 },
  { id: "mh-nagpur", name: "Nagpur", division: "Nagpur", access: "good", score: 84, lat: 21.1458, lng: 79.0882, specialists: "Moderate", diagnostics: "High", medicines: "Optimal", facilitiesCount: 96 },
  { id: "mh-nashik", name: "Nashik", division: "Nashik", access: "good", score: 78, lat: 19.9975, lng: 73.7898, specialists: "Moderate", diagnostics: "Moderate", medicines: "Optimal", facilitiesCount: 84 },
  { id: "mh-kolhapur", name: "Kolhapur", division: "Pune", access: "good", score: 76, lat: 16.7050, lng: 74.2433, specialists: "Moderate", diagnostics: "Moderate", medicines: "Optimal", facilitiesCount: 68 },
  { id: "mh-aurangabad", name: "Chhatrapati Sambhajinagar", division: "Marathwada", access: "moderate", score: 67, lat: 19.8762, lng: 75.3433, specialists: "Low", diagnostics: "Moderate", medicines: "Moderate", facilitiesCount: 72, primaryIssue: "Specialist vacancy in rural spoke CHCs", recommendedAction: "Route teleconsultation to GMC Aurangabad" },
  { id: "mh-solapur", name: "Solapur", division: "Pune", access: "moderate", score: 63, lat: 17.6599, lng: 75.9064, specialists: "Low", diagnostics: "Moderate", medicines: "Moderate", facilitiesCount: 64, primaryIssue: "Diagnostic wait times in taluka hospitals", recommendedAction: "Deploy tele-radiology pipeline" },
  { id: "mh-chandrapur", name: "Chandrapur", division: "Nagpur", access: "moderate", score: 62, lat: 19.9615, lng: 79.2961, specialists: "Low", diagnostics: "Moderate", medicines: "Moderate", facilitiesCount: 52 },
  { id: "mh-akola", name: "Akola", division: "Amravati", access: "moderate", score: 58, lat: 20.7002, lng: 77.0082, specialists: "Low", diagnostics: "Limited", medicines: "Moderate", facilitiesCount: 46 },
  { id: "mh-palghar", name: "Palghar (Tribal Blocks)", division: "Konkan", access: "moderate", score: 55, lat: 19.6967, lng: 72.7699, specialists: "Low", diagnostics: "Limited", medicines: "Limited", facilitiesCount: 58, primaryIssue: "High travel times in Jawhar & Mokhada", recommendedAction: "Mobile medical units & hub teleconsult" },
  { id: "mh-latur", name: "Latur", division: "Marathwada", access: "gap", score: 48, lat: 18.4088, lng: 76.5604, specialists: "Critical", diagnostics: "Limited", medicines: "Critical Low", facilitiesCount: 54, primaryIssue: "Essential medicine stockouts (Metformin/Insulin)", recommendedAction: "Emergency CMSD warehouse dispatch" },
  { id: "mh-nandurbar", name: "Nandurbar", division: "Nashik", access: "gap", score: 42, lat: 21.3734, lng: 74.2404, specialists: "Critical", diagnostics: "Limited", medicines: "Limited", facilitiesCount: 48, primaryIssue: "Cardiology specialist vacancy (42% coverage)", recommendedAction: "Permanent telemedicine hub linking Civil Hospital" },
  { id: "mh-gadchiroli", name: "Gadchiroli", division: "Nagpur", access: "gap", score: 38, lat: 20.1849, lng: 80.0029, specialists: "Critical", diagnostics: "Critical", medicines: "Limited", facilitiesCount: 39, primaryIssue: "Diagnostic machine downtime & remote spokes", recommendedAction: "Priority technician dispatch & solar backups" },
];

const ACCESS_CONFIG: Record<AccessLevel, { badge: string; border: string; bg: string; text: string }> = {
  good: { badge: "bg-emerald-100 text-emerald-800 border-emerald-300", border: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  moderate: { badge: "bg-amber-100 text-amber-800 border-amber-300", border: "border-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  gap: { badge: "bg-rose-100 text-rose-800 border-rose-300", border: "border-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
};

interface MapProps {
  onSelectDistrict?: (d: DistrictMetric) => void;
  selectedId?: string;
}

export function MaharashtraRealTimeMap({ onSelectDistrict, selectedId }: MapProps) {
  const [activeDistrict, setActiveDistrict] = useState<DistrictMetric>(
    MAHARASHTRA_DISTRICTS.find((d) => d.id === selectedId) || MAHARASHTRA_DISTRICTS[11] // Nandurbar default
  );
  const [filter, setFilter] = useState<"all" | AccessLevel>("all");

  const filteredDistricts = MAHARASHTRA_DISTRICTS.filter(
    (d) => filter === "all" || d.access === filter
  );

  // OpenStreetMap embed coordinates bounding Maharashtra state:
  // bbox=72.6, 15.6, 80.9, 22.1
  const mapIframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=72.6,15.6,80.9,22.1&layer=mapnik&marker=${activeDistrict.lat},${activeDistrict.lng}`;

  const handleSelect = (d: DistrictMetric) => {
    setActiveDistrict(d);
    if (onSelectDistrict) onSelectDistrict(d);
  };

  return (
    <div className="space-y-3">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "good", "moderate", "gap"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`text-[11.5px] font-bold px-3 py-1.5 rounded-[7px] border transition-all cursor-pointer ${
                filter === lvl
                  ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                  : "bg-white border-[rgba(124,45,45,0.12)] text-ink-secondary hover:bg-blush"
              }`}
            >
              {lvl === "all" ? "All Districts (13)" : lvl === "good" ? "● Good (75%+)" : lvl === "moderate" ? "● Moderate (50-74%)" : "● High Gap (<50%)"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-tertiary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;75%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 50–74%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;50%
          </span>
        </div>
      </div>

      {/* Real Map Canvas Container */}
      <div className="relative bg-[#E8E2D9] rounded-[12px] overflow-hidden border border-[rgba(124,45,45,0.12)] h-[440px] shadow-2xs">
        {/* Real OpenStreetMap Live Iframe Embed */}
        <iframe
          title="Maharashtra Healthcare Surveillance Map"
          src={mapIframeSrc}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* Live Top Ribbon */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-2 flex items-center justify-between shadow-sm text-[11.5px]">
          <div className="flex items-center gap-2 font-bold text-ink-primary truncate">
            <Navigation className="w-3.5 h-3.5 text-burgundy-700 flex-shrink-0" />
            <span>State Surveillance Focus: {activeDistrict.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${ACCESS_CONFIG[activeDistrict.access].badge}`}>
              {activeDistrict.score}% Accessibility
            </span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeDistrict.name + ", Maharashtra")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-burgundy-700 hover:underline flex items-center gap-1 flex-shrink-0"
          >
            Google Maps <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Floating District Selector Cards on Bottom */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 space-y-2">
          {/* Selected District Telemetry Card */}
          <div className="bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.15)] rounded-[10px] p-3.5 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[14px] text-ink-primary">{activeDistrict.name} District</h4>
                  <span className="text-[10px] font-semibold text-ink-tertiary">({activeDistrict.division} Div)</span>
                </div>
                <div className="text-[11.5px] text-ink-secondary mt-0.5">
                  Facilities: <strong>{activeDistrict.facilitiesCount} Monitored</strong> · Specialists: <strong>{activeDistrict.specialists}</strong> · Medicines: <strong>{activeDistrict.medicines}</strong>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-[22px] font-extrabold font-mono leading-none ${ACCESS_CONFIG[activeDistrict.access].text}`}>
                  {activeDistrict.score}%
                </div>
                <span className="text-[9px] uppercase tracking-wider text-ink-tertiary">Capacity</span>
              </div>
            </div>

            {activeDistrict.primaryIssue && (
              <div className="mt-2 pt-2 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[11px] gap-2">
                <span className="text-rose-700 font-medium truncate">
                  ⚠ {activeDistrict.primaryIssue}
                </span>
                <span className="text-burgundy-700 font-bold flex-shrink-0">
                  → {activeDistrict.recommendedAction}
                </span>
              </div>
            )}

            {/* Quick District Buttons */}
            <div className="flex gap-1 pt-2 overflow-x-auto pb-0.5">
              {filteredDistricts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelect(d)}
                  className={`px-2.5 py-1 rounded-[6px] text-[10.5px] font-bold border transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                    activeDistrict.id === d.id
                      ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                      : "bg-white text-ink-secondary border-[rgba(124,45,45,0.12)] hover:bg-blush"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${d.access === "good" ? "bg-emerald-500" : d.access === "moderate" ? "bg-amber-500" : "bg-rose-500"}`} />
                  {d.name.split(" ")[0]} ({d.score}%)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
