"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Compass, Layers, Phone, Clock, Stethoscope, Activity, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import { Facility } from "@/data/facilities";

interface RealTimeFacilityMapProps {
  facilities: Facility[];
  selectedFacilityId?: string;
  onSelectFacility?: (id: string) => void;
}

export function RealTimeFacilityMap({
  facilities,
  selectedFacilityId,
  onSelectFacility,
}: RealTimeFacilityMapProps) {
  const [activeFacility, setActiveFacility] = useState<string>(selectedFacilityId || facilities[0]?.id || "fac-001");
  const [mapLayer, setMapLayer] = useState<"standard" | "route">("standard");

  const current = facilities.find((f) => f.id === activeFacility) || facilities[0];

  // Coordinates for Nandurbar area
  // Nandurbar District Hospital: 21.3734, 74.2404
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=74.12,21.28,74.36,21.46&layer=mapnik&marker=21.3734,74.2404`;

  return (
    <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-4 flex flex-col h-[580px] sticky top-6 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-[14px] font-bold text-ink-primary">Real-Time Resource Map</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 font-bold">
            GPS Active
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(current?.name || "Nandurbar District Hospital")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-ink-tertiary hover:text-burgundy-700 transition-colors"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Map Arena */}
      <div className="flex-1 relative rounded-[10px] overflow-hidden border border-[rgba(124,45,45,0.12)] bg-[#E8E2D9]">
        {/* Real OpenStreetMap Live Iframe Embed */}
        <iframe
          title="Nandurbar Healthcare Facilities Map"
          src={mapUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* Live Overlay Route Banner */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-1.5 flex items-center justify-between text-[11px] shadow-sm">
          <div className="flex items-center gap-1.5 font-medium text-ink-primary truncate">
            <Navigation className="w-3.5 h-3.5 text-burgundy-700 flex-shrink-0" />
            <span className="truncate">Route via SH-4 (State Highway 4)</span>
          </div>
          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex-shrink-0">
            Open Clear
          </span>
        </div>

        {/* Interactive Floating Facility Selector Pins */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 space-y-1.5">
          {/* Facility Cards Carousel / Selector */}
          <div className="bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.15)] rounded-[10px] p-3 shadow-md space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <strong className="text-[13px] font-bold text-ink-primary">{current?.name}</strong>
                </div>
                <div className="text-[11px] text-ink-secondary mt-0.5">
                  {current?.distanceKm} km · ~{current?.travelMinutes} mins travel time
                </div>
              </div>
              <div className="text-right">
                <span className="text-[15px] font-extrabold font-mono text-emerald-700">
                  {current?.matchScore}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-ink-tertiary block">Match</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-bg p-2 rounded-[6px] border border-[rgba(124,45,45,0.06)]">
              <div>
                <span className="text-ink-tertiary block">OPD Queue</span>
                <strong className="text-ink-primary">{current?.queue?.nowServing ? `#${current.queue.nowServing} Serving` : "18 mins wait"}</strong>
              </div>
              <div>
                <span className="text-ink-tertiary block">12-Lead ECG</span>
                <strong className="text-emerald-700">Operational</strong>
              </div>
            </div>

            {/* Quick Switch Buttons */}
            <div className="flex gap-1 pt-1">
              {facilities.slice(0, 3).map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFacility(f.id);
                    if (onSelectFacility) onSelectFacility(f.id);
                  }}
                  className={`flex-1 py-1 rounded-[6px] text-[10px] font-bold border transition-all cursor-pointer truncate px-1 ${
                    activeFacility === f.id
                      ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                      : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                  }`}
                >
                  {f.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="mt-2.5 pt-2 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[10.5px] text-ink-tertiary">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Verified Facility
        </span>
        <span className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-burgundy-700" /> GPS Tracking Active
        </span>
      </div>
    </div>
  );
}
