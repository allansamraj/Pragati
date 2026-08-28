"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Compass, Phone, Clock, Stethoscope, Activity, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import { Facility } from "@/data/facilities";
import { formatDistance } from "@/lib/services/locationService";

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
  const [activeFacilityId, setActiveFacilityId] = useState<string>(selectedFacilityId || facilities[0]?.id || "fac-chn-001");

  useEffect(() => {
    if (selectedFacilityId) {
      setActiveFacilityId(selectedFacilityId);
    } else if (facilities.length > 0 && !facilities.some((f) => f.id === activeFacilityId)) {
      setActiveFacilityId(facilities[0].id);
    }
  }, [selectedFacilityId, facilities]);

  const current = facilities.find((f) => f.id === activeFacilityId) || facilities[0];

  // Base coordinates for centering map: focus on selected facility
  const centerLat = current?.lat ?? patientCoords?.lat ?? 13.0827;
  const centerLng = current?.lng ?? patientCoords?.lng ?? 80.2707;

  // Calculate local bounding box based on focus (~0.02 deg is ~2.2 km local view)
  const degSpan = 0.025;
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
          {current && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${current.lat},${current.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-ink-tertiary hover:text-burgundy-700 transition-colors"
              title="Open in Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Map Arena */}
      <div className="flex-1 relative rounded-[10px] overflow-hidden border border-[rgba(124,45,45,0.12)] bg-[#E8E2D9]">
        {/* Real OpenStreetMap Live Iframe Embed */}
        <iframe
          key={`${centerLat}_${centerLng}_${activeFacilityId}`}
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
              {patientCoords?.locality ? `Near ${patientCoords.locality}` : "Using Device Coordinates"}
            </span>
          </div>
          <span className="text-burgundy-700 font-bold text-[10px] bg-blush border border-[rgba(124,45,45,0.15)] px-1.5 py-0.5 rounded flex-shrink-0">
            {searchRadiusKm} km Radius
          </span>
        </div>

        {/* Interactive Floating Facility Selector Pins */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 space-y-1.5">
          {current && (
            <div className="bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.15)] rounded-[10px] p-3 shadow-md space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <strong className="text-[13px] font-bold text-ink-primary truncate block">
                      {current.name}
                    </strong>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      current.ownershipSector === "GOVERNMENT" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}>
                      {current.ownershipSector === "GOVERNMENT" ? "🏛️ GOVT" : "🏥 PRIVATE"}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-secondary mt-0.5">
                    <strong className="text-burgundy-700">{formatDistance(current.distanceKm)} away</strong> · ~{current.travelMinutes} mins travel time
                  </div>
                </div>

                {current.matchScore !== undefined ? (
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
                  <span className="text-ink-tertiary block">OPD Status</span>
                  <strong className="text-ink-primary">
                    {current.queue?.nowServing ? `Token #${current.queue.nowServing} Serving` : "Counter Token OPD"}
                  </strong>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Emergency</span>
                  <strong className={current.emergencyAvailable || current.emergencyCapability ? "text-emerald-700" : "text-ink-secondary"}>
                    {current.emergencyAvailable || current.emergencyCapability ? "24/7 Available" : "Daycare OPD"}
                  </strong>
                </div>
              </div>

              {/* Quick Switch Buttons */}
              <div className="flex gap-1 pt-1 overflow-x-auto">
                {facilities.slice(0, 5).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFacilityId(f.id);
                      if (onSelectFacility) onSelectFacility(f.id);
                    }}
                    className={`flex-1 py-1 rounded-[6px] text-[10px] font-bold border transition-all cursor-pointer truncate px-1.5 flex-shrink-0 ${
                      activeFacilityId === f.id
                        ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                        : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                    }`}
                  >
                    {f.name.split(" ")[0]} ({formatDistance(f.distanceKm)})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="mt-2.5 pt-2 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[10.5px] text-ink-tertiary">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Patient Location
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Government
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" /> Private
        </span>
      </div>
    </div>
  );
}
