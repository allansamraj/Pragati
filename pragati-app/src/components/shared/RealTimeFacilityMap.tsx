"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Compass, Layers, Phone, Clock, Stethoscope, Activity, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import { Facility } from "@/data/facilities";

interface RealTimeFacilityMapProps {
  facilities: Facility[];
  selectedFacilityId?: string;
  onSelectFacility?: (id: string) => void;
  patientCoords?: { lat: number; lng: number; locality?: string; isManual?: boolean } | null;
  searchRadiusKm?: number;
}

export function RealTimeFacilityMap({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  patientCoords,
  searchRadiusKm = 10,
}: RealTimeFacilityMapProps) {
  const [activeFacilityId, setActiveFacilityId] = useState<string>(selectedFacilityId || facilities[0]?.id || "fac-001");

  const current = facilities.find((f) => f.id === activeFacilityId) || facilities[0];

  // Base coordinates for centering map: prioritize patient's GPS, fallback to first facility
  const centerLat = patientCoords?.lat || current?.lat || 21.3734;
  const centerLng = patientCoords?.lng || current?.lng || 74.2404;

  // Calculate bounding box based on search radius (~0.01 deg approx 1.1 km)
  const degSpan = Math.max(0.08, (searchRadiusKm / 111) * 1.5);
  const minLat = (centerLat - degSpan).toFixed(4);
  const maxLat = (centerLat + degSpan).toFixed(4);
  const minLng = (centerLng - degSpan * 1.2).toFixed(4);
  const maxLng = (centerLng + degSpan * 1.2).toFixed(4);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${centerLat},${centerLng}`;

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
            {patientCoords?.isManual ? "Manual Pin" : "GPS Active"}
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((current?.name || "") + " " + (current?.address || ""))}`}
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
          key={`${centerLat}_${centerLng}_${searchRadiusKm}`}
          title="Nearby Healthcare Facilities Map"
          src={mapUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* Live Overlay: Patient Location & Search Radius */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-1.5 flex items-center justify-between text-[11px] shadow-sm">
          <div className="flex items-center gap-1.5 font-medium text-ink-primary truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">
              {patientCoords?.locality ? `Near ${patientCoords.locality}` : "Using Current Location"}
            </span>
          </div>
          <span className="text-burgundy-700 font-bold text-[10px] bg-blush border border-[rgba(124,45,45,0.15)] px-1.5 py-0.5 rounded flex-shrink-0">
            {searchRadiusKm} km Radius
          </span>
        </div>

        {/* Interactive Floating Facility Selector Pins */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 space-y-1.5">
          {/* Facility Cards Carousel / Selector */}
          <div className="bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.15)] rounded-[10px] p-3 shadow-md space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <strong className="text-[13px] font-bold text-ink-primary truncate block">
                    {current?.name}
                  </strong>
                </div>
                <div className="text-[11px] text-ink-secondary mt-0.5">
                  <strong className="text-burgundy-700">{current?.distanceKm} km away</strong> · ~{current?.travelMinutes} mins travel time
                </div>
              </div>

              {current?.matchScore !== undefined ? (
                <div className="text-right flex-shrink-0">
                  <span className="text-[15px] font-extrabold font-mono text-emerald-700">
                    {current.matchScore}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-ink-tertiary block">Match</span>
                </div>
              ) : (
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    ● Open
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-bg p-2 rounded-[6px] border border-[rgba(124,45,45,0.06)]">
              <div>
                <span className="text-ink-tertiary block">OPD Queue</span>
                <strong className="text-ink-primary">
                  {current?.queue?.nowServing ? `#${current.queue.nowServing} Serving` : "10 mins wait"}
                </strong>
              </div>
              <div>
                <span className="text-ink-tertiary block">12-Lead ECG</span>
                <strong className="text-emerald-700">
                  {current?.diagnostics?.some((d) => d.name.toLowerCase().includes("ecg")) ? "Available" : "At Hub"}
                </strong>
              </div>
            </div>

            {/* Quick Switch Buttons */}
            <div className="flex gap-1 pt-1 overflow-x-auto">
              {facilities.slice(0, 4).map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFacilityId(f.id);
                    if (onSelectFacility) onSelectFacility(f.id);
                  }}
                  className={`flex-1 py-1 rounded-[6px] text-[10px] font-bold border transition-all cursor-pointer truncate px-1 flex-shrink-0 ${
                    activeFacilityId === f.id
                      ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                      : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                  }`}
                >
                  {f.name.split(" ")[0]} ({f.distanceKm}km)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="mt-2.5 pt-2 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[10.5px] text-ink-tertiary">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Patient Location
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Nearby Facility
        </span>
      </div>
    </div>
  );
}
