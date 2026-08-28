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

function getCategoryBadge(f: Facility): { icon: string; label: string; colorClass: string } {
  const name = f.name.toLowerCase();
  const type = (f.type || "").toLowerCase();
  const cat = (f as any).category || "";

  if (f.ownershipSector === "GOVERNMENT" || f.ownership === "government") {
    return { icon: "🏛️", label: "Govt Health Centre", colorClass: "bg-rose-50 text-rose-800 border-rose-200" };
  }
  if (name.includes("dental") || type.includes("dental") || cat === "DENTAL_CLINIC") {
    return { icon: "🦷", label: "Dental Care", colorClass: "bg-teal-50 text-teal-800 border-teal-200" };
  }
  if (name.includes("eye") || name.includes("optic") || name.includes("vision") || type.includes("eye") || cat === "EYE_HOSPITAL" || cat === "OPTICAL_SHOP") {
    return { icon: "👁️", label: "Eye & Vision", colorClass: "bg-indigo-50 text-indigo-800 border-indigo-200" };
  }
  if (name.includes("pharmacy") || type.includes("pharmacy") || f.facilityType === "PHARMACY" || cat === "PHARMACY") {
    return { icon: "💊", label: "Pharmacy", colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  }
  if (name.includes("lab") || name.includes("diagnostic") || name.includes("scan") || f.facilityType === "DIAGNOSTIC_CENTER" || cat === "DIAGNOSTIC_CENTER") {
    return { icon: "🧪", label: "Diagnostic Lab", colorClass: "bg-purple-50 text-purple-800 border-purple-200" };
  }
  if (name.includes("hospital") || type.includes("hospital") || cat === "HOSPITAL") {
    return { icon: "🏥", label: "Hospital", colorClass: "bg-blue-50 text-blue-800 border-blue-200" };
  }
  return { icon: "🏨", label: "Clinic", colorClass: "bg-amber-50 text-amber-800 border-amber-200" };
}

export function RealTimeFacilityMap({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  patientCoords,
  searchRadiusKm = 10,
}: RealTimeFacilityMapProps) {
  const [activeFacilityId, setActiveFacilityId] = useState<string>(selectedFacilityId || facilities[0]?.id || "");

  useEffect(() => {
    if (selectedFacilityId) {
      setActiveFacilityId(selectedFacilityId);
    } else if (facilities.length > 0 && !facilities.some((f) => f.id === activeFacilityId)) {
      setActiveFacilityId(facilities[0].id);
    }
  }, [selectedFacilityId, facilities]);

  const current = facilities.find((f) => f.id === activeFacilityId) || facilities[0];

  // Base coordinates for centering map: focus on selected facility or patient coords
  const centerLat = current?.lat ?? patientCoords?.lat ?? 12.8696;
  const centerLng = current?.lng ?? patientCoords?.lng ?? 80.2200;

  // Calculate local bounding box based on focus (~0.025 deg is ~2.7 km local view)
  const degSpan = Math.max(0.025, (searchRadiusKm / 111) * 0.85);
  const minLat = (centerLat - degSpan).toFixed(4);
  const maxLat = (centerLat + degSpan).toFixed(4);
  const minLng = (centerLng - degSpan * 1.2).toFixed(4);
  const maxLng = (centerLng + degSpan * 1.2).toFixed(4);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${centerLat},${centerLng}`;

  const currentBadge = current ? getCategoryBadge(current) : null;
  const directionsUrl = current
    ? `https://www.google.com/maps/dir/?api=1&destination=${current.lat},${current.lng}`
    : "#";

  return (
    <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-4 flex flex-col h-[600px] sticky top-6 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-[14px] font-bold text-ink-primary">Real-Time Healthcare Map</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 font-bold">
            {facilities.length} Active on Map
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
            {searchRadiusKm} km Map Radius
          </span>
        </div>

        {/* Interactive Floating Facility Selector & Compact Info Card */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 space-y-2">
          {current && (
            <div className="bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.15)] rounded-[10px] p-3 shadow-md space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${currentBadge?.colorClass}`}>
                      <span>{currentBadge?.icon}</span>
                      <span>{currentBadge?.label}</span>
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      current.ownershipSector === "GOVERNMENT" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}>
                      {current.ownershipSector === "GOVERNMENT" ? "🏛️ GOVT" : "🏥 PRIVATE"}
                    </span>
                  </div>
                  <strong className="text-[13px] font-bold text-ink-primary leading-tight block truncate">
                    {current.name}
                  </strong>
                  <div className="text-[11px] text-ink-secondary mt-0.5">
                    <strong className="text-burgundy-700">{formatDistance(current.distanceKm)}</strong> · ~{current.travelMinutes || Math.round((current.distanceKm || 1) * 3)} mins travel time
                  </div>
                  {current.address && (
                    <div className="text-[10.5px] text-ink-tertiary truncate mt-0.5">
                      📍 {current.address}
                    </div>
                  )}
                </div>

                {/* Open Status or Suitability */}
                <div className="text-right flex-shrink-0">
                  {current.isOpen === true ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded block">
                      ● Open Now
                    </span>
                  ) : current.isOpen === false ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded block">
                      ● Closed
                    </span>
                  ) : current.openingHours ? (
                    <span className="text-[9.5px] font-medium text-ink-tertiary bg-bg border border-[rgba(124,45,45,0.1)] px-1.5 py-0.5 rounded block max-w-[90px] truncate">
                      {current.openingHours}
                    </span>
                  ) : null}
                  {current.matchScore !== undefined && current.matchScore > 0 && (
                    <span className="text-[11px] font-extrabold font-mono text-emerald-700 block mt-1">
                      {current.matchScore}% Match
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Directions & View in List */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-[rgba(124,45,45,0.08)]">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[6px] text-[11px] font-bold transition-colors shadow-2xs"
                >
                  <Navigation className="w-3 h-3" /> Directions
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectFacility) onSelectFacility(current.id);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blush hover:bg-rose text-burgundy-700 rounded-[6px] text-[11px] font-bold transition-colors border border-[rgba(124,45,45,0.12)] cursor-pointer"
                >
                  View Details
                </button>
              </div>

              {/* Quick Facility Category Pins Selector */}
              {facilities.length > 1 && (
                <div className="flex gap-1 pt-1 overflow-x-auto">
                  {facilities.slice(0, 7).map((f) => {
                    const badge = getCategoryBadge(f);
                    const isActive = activeFacilityId === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setActiveFacilityId(f.id);
                          if (onSelectFacility) onSelectFacility(f.id);
                        }}
                        title={`${f.name} (${formatDistance(f.distanceKm)})`}
                        className={`py-1 px-2 rounded-[6px] text-[10px] font-bold border transition-all cursor-pointer truncate flex-shrink-0 flex items-center gap-1 ${
                          isActive
                            ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                            : "bg-white text-ink-secondary border-[rgba(124,45,45,0.12)] hover:bg-blush"
                        }`}
                      >
                        <span>{badge.icon}</span>
                        <span className="truncate max-w-[70px]">{f.name.split(" ")[0]}</span>
                        <span className="opacity-75 font-mono text-[9px]">({formatDistance(f.distanceKm)})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Category Legend */}
      <div className="mt-2.5 pt-2 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-between text-[10px] text-ink-tertiary flex-wrap gap-1">
        <span className="flex items-center gap-0.5">🏥 Hospital</span>
        <span className="flex items-center gap-0.5">🏨 Clinic</span>
        <span className="flex items-center gap-0.5">🏛️ Govt PHC</span>
        <span className="flex items-center gap-0.5">🦷 Dental</span>
        <span className="flex items-center gap-0.5">👁️ Eye Care</span>
        <span className="flex items-center gap-0.5">💊 Pharmacy</span>
      </div>
    </div>
  );
}

