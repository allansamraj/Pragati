"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Layers, ShieldCheck, Activity, Users, AlertTriangle, ExternalLink, ChevronRight, Compass } from "lucide-react";
import { useLocationContext } from "@/lib/context/LocationContext";

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

// ─── TAMIL NADU DISTRICTS (CHENNAI DEMO ENVIRONMENT) ───────────────────────────
export const TAMIL_NADU_DISTRICTS: DistrictMetric[] = [
  { id: "tn-chennai", name: "Chennai City & Metro", division: "Northern Hub", access: "good", score: 94, lat: 13.0827, lng: 80.2707, specialists: "High", diagnostics: "High", medicines: "Optimal", facilitiesCount: 148 },
  { id: "tn-coimbatore", name: "Coimbatore", division: "Western Hub", access: "good", score: 89, lat: 11.0168, lng: 76.9558, specialists: "High", diagnostics: "High", medicines: "Optimal", facilitiesCount: 112 },
  { id: "tn-madurai", name: "Madurai", division: "Southern Hub", access: "good", score: 85, lat: 9.9252, lng: 78.1198, specialists: "High", diagnostics: "Moderate", medicines: "Optimal", facilitiesCount: 98 },
  { id: "tn-trichy", name: "Tiruchirappalli", division: "Central Delta", access: "good", score: 82, lat: 10.7905, lng: 78.7047, specialists: "Moderate", diagnostics: "High", medicines: "Optimal", facilitiesCount: 86 },
  { id: "tn-salem", name: "Salem", division: "Western", access: "good", score: 78, lat: 11.6643, lng: 78.1460, specialists: "Moderate", diagnostics: "Moderate", medicines: "Optimal", facilitiesCount: 76 },
  { id: "tn-vellore", name: "Vellore", division: "Northern", access: "moderate", score: 72, lat: 12.9165, lng: 79.1325, specialists: "Moderate", diagnostics: "High", medicines: "Moderate", facilitiesCount: 70 },
  { id: "tn-chengalpattu", name: "Chengalpattu & OMR", division: "Northern Coastal", access: "moderate", score: 68, lat: 12.6841, lng: 79.9836, specialists: "Moderate", diagnostics: "Moderate", medicines: "Moderate", facilitiesCount: 64, primaryIssue: "Suburban workload surge in Tambaram & Kelambakkam", recommendedAction: "Expand UPHC daycare teleconsultation capacity" },
  { id: "tn-tirunelveli", name: "Tirunelveli", division: "Deep South", access: "moderate", score: 65, lat: 8.7139, lng: 77.7567, specialists: "Low", diagnostics: "Moderate", medicines: "Moderate", facilitiesCount: 58 },
  { id: "tn-thiruvallur", name: "Thiruvallur", division: "Northern Industrial", access: "moderate", score: 62, lat: 13.1438, lng: 79.9083, specialists: "Low", diagnostics: "Limited", medicines: "Moderate", facilitiesCount: 56, primaryIssue: "Diagnostic turn-around delays in rural CHCs", recommendedAction: "Deploy tele-radiology pipeline" },
  { id: "tn-villupuram", name: "Villupuram", division: "Central Delta Spoke", access: "gap", score: 48, lat: 11.9401, lng: 79.4861, specialists: "Low", diagnostics: "Limited", medicines: "Critical Low", facilitiesCount: 52, primaryIssue: "Essential medicine stockouts during surge", recommendedAction: "Emergency TNMSC warehouse dispatch" },
  { id: "tn-dharmapuri", name: "Dharmapuri", division: "Western Tribal Blocks", access: "gap", score: 42, lat: 12.1211, lng: 78.1582, specialists: "Critical", diagnostics: "Limited", medicines: "Limited", facilitiesCount: 44, primaryIssue: "Cardiology specialist vacancy (42% coverage)", recommendedAction: "Permanent telemedicine hub linking Chennai GGH" },
  { id: "tn-nilgiris", name: "The Nilgiris", division: "Highland Tribal Sector", access: "gap", score: 39, lat: 11.4102, lng: 76.6950, specialists: "Critical", diagnostics: "Critical", medicines: "Limited", facilitiesCount: 38, primaryIssue: "Diagnostic machine downtime in hilly terrain", recommendedAction: "Mobile medical units & solar tele-link spokes" },
];

// ─── CHENNAI URBAN HEALTH ZONES ────────────────────────────────────────────────
export const CHENNAI_ZONES: DistrictMetric[] = [
  { id: "chn-central", name: "Park Town / Central Zone", division: "Chennai Central", access: "good", score: 96, lat: 13.0827, lng: 80.2707, specialists: "Optimal", diagnostics: "Optimal", medicines: "Optimal", facilitiesCount: 32 },
  { id: "chn-triplicane", name: "Triplicane & Royapettah", division: "Chennai Central-South", access: "good", score: 92, lat: 13.0583, lng: 80.2747, specialists: "High", diagnostics: "High", medicines: "Optimal", facilitiesCount: 28 },
  { id: "chn-teynampet", name: "Teynampet & T. Nagar", division: "Chennai South-Central", access: "good", score: 88, lat: 13.0418, lng: 80.2341, specialists: "High", diagnostics: "High", medicines: "Optimal", facilitiesCount: 26 },
  { id: "chn-annanagar", name: "Anna Nagar & Kilpauk", division: "Chennai West", access: "good", score: 86, lat: 13.0850, lng: 80.2101, specialists: "High", diagnostics: "Moderate", medicines: "Optimal", facilitiesCount: 24 },
  { id: "chn-adyar", name: "Adyar & Mylapore", division: "Chennai South", access: "good", score: 84, lat: 13.0012, lng: 80.2565, specialists: "Moderate", diagnostics: "High", medicines: "Optimal", facilitiesCount: 22 },
  { id: "chn-north", name: "Stanley / North Chennai", division: "Chennai North", access: "moderate", score: 68, lat: 13.1075, lng: 80.2872, specialists: "Moderate", diagnostics: "Moderate", medicines: "Moderate", facilitiesCount: 16, primaryIssue: "High OPD patient density in northern dispensaries", recommendedAction: "Deploy additional evening token counters" },
];

// ─── MAHARASHTRA DISTRICTS (DEPLOYMENT READY) ──────────────────────────────────
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
  const { governmentLocation, patientLocation } = useLocationContext();
  const state = governmentLocation?.state || "Tamil Nadu";
  const isTamilNadu = state.toLowerCase().includes("tamil") || state.toLowerCase().includes("chennai");

  const [zoneView, setZoneView] = useState<"state" | "city">("state");
  const [zoomLevel, setZoomLevel] = useState<"exact" | "district" | "state">("exact");
  const [customGps, setCustomGps] = useState<{ lat: number; lng: number; name: string } | null>(null);

  const activeDistrictList = isTamilNadu
    ? (zoneView === "city" ? CHENNAI_ZONES : TAMIL_NADU_DISTRICTS)
    : MAHARASHTRA_DISTRICTS;

  // Derive default focus matching governmentLocation.district (e.g. Chennai)
  const defaultFocus = isTamilNadu
    ? (zoneView === "city" 
        ? CHENNAI_ZONES[0] 
        : (TAMIL_NADU_DISTRICTS.find(d => d.name.toLowerCase().includes(governmentLocation?.district?.toLowerCase() || "chennai")) || TAMIL_NADU_DISTRICTS[0]))
    : MAHARASHTRA_DISTRICTS[0];

  const [activeDistrict, setActiveDistrict] = useState<DistrictMetric>(
    activeDistrictList.find((d) => d.id === selectedId) || defaultFocus
  );
  const [filter, setFilter] = useState<"all" | AccessLevel>("all");

  useEffect(() => {
    if (selectedId) {
      const match = activeDistrictList.find((d) => d.id === selectedId);
      if (match) setActiveDistrict(match);
    } else {
      setActiveDistrict(defaultFocus);
    }
  }, [zoneView, state, selectedId, governmentLocation?.district]);

  const filteredDistricts = activeDistrictList.filter(
    (d) => filter === "all" || d.access === filter
  );

  const currentTarget = customGps || {
    lat: activeDistrict.lat,
    lng: activeDistrict.lng,
    name: activeDistrict.name,
  };

  // Calculate precise bounding box centered exactly on the location:
  // - "exact": ~2-4 km radius (shows local street grid, landmarks, hospital campus)
  // - "district": ~20-30 km radius (shows whole district and surrounding talukas)
  // - "state": broad state overview
  let deltaLng = 0.035;
  let deltaLat = 0.025;

  if (zoomLevel === "exact") {
    deltaLng = zoneView === "city" ? 0.025 : 0.045;
    deltaLat = zoneView === "city" ? 0.018 : 0.035;
  } else if (zoomLevel === "district") {
    deltaLng = 0.22;
    deltaLat = 0.18;
  } else {
    // Statewide overview
    if (isTamilNadu) {
      deltaLng = 2.4;
      deltaLat = 2.8;
    } else {
      deltaLng = 4.2;
      deltaLat = 3.2;
    }
  }

  const minLng = (currentTarget.lng - deltaLng).toFixed(4);
  const minLat = (currentTarget.lat - deltaLat).toFixed(4);
  const maxLng = (currentTarget.lng + deltaLng).toFixed(4);
  const maxLat = (currentTarget.lat + deltaLat).toFixed(4);

  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  const mapIframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${currentTarget.lat},${currentTarget.lng}`;

  const handleSelect = (d: DistrictMetric) => {
    setCustomGps(null);
    setActiveDistrict(d);
    if (onSelectDistrict) onSelectDistrict(d);
  };

  const handleDetectLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "Current GPS Location",
          });
          setZoomLevel("exact");
        },
        () => {
          // Fallback to patient / demo GPS location
          setCustomGps({
            lat: patientLocation.lat,
            lng: patientLocation.lng,
            name: `${patientLocation.locality}, ${patientLocation.district}`,
          });
          setZoomLevel("exact");
        },
        { timeout: 5000 }
      );
    } else {
      setCustomGps({
        lat: patientLocation.lat,
        lng: patientLocation.lng,
        name: `${patientLocation.locality}, ${patientLocation.district}`,
      });
      setZoomLevel("exact");
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Filter Bar & Scope Switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {isTamilNadu && (
            <div className="flex items-center bg-bg border border-[rgba(124,45,45,0.12)] p-0.5 rounded-[8px] mr-1">
              <button
                onClick={() => { setZoneView("state"); setCustomGps(null); }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                  zoneView === "state" && !customGps
                    ? "bg-burgundy-700 text-white shadow-2xs"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                Tamil Nadu ({TAMIL_NADU_DISTRICTS.length})
              </button>
              <button
                onClick={() => { setZoneView("city"); setCustomGps(null); }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                  zoneView === "city" && !customGps
                    ? "bg-burgundy-700 text-white shadow-2xs"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                Chennai Urban Zones ({CHENNAI_ZONES.length})
              </button>
            </div>
          )}

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
              {lvl === "all" ? `All (${activeDistrictList.length})` : lvl === "good" ? "● Good (75%+)" : lvl === "moderate" ? "● Moderate (50-74%)" : "● High Gap (<50%)"}
            </button>
          ))}
        </div>

        {/* Zoom Scope Controls */}
        <div className="flex items-center gap-1.5 bg-white border border-[rgba(124,45,45,0.12)] p-1 rounded-[8px]">
          <button
            onClick={() => setZoomLevel("exact")}
            className={`text-[10.5px] font-bold px-2.5 py-1 rounded-[5px] transition-all cursor-pointer flex items-center gap-1 ${
              zoomLevel === "exact"
                ? "bg-burgundy-700 text-white shadow-2xs"
                : "text-ink-secondary hover:bg-blush"
            }`}
            title="Focus directly on exact town / local health hub"
          >
            🎯 Exact Local View
          </button>
          <button
            onClick={() => setZoomLevel("district")}
            className={`text-[10.5px] font-bold px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
              zoomLevel === "district"
                ? "bg-burgundy-700 text-white shadow-2xs"
                : "text-ink-secondary hover:bg-blush"
            }`}
            title="View full district catchment"
          >
            📍 District View
          </button>
          <button
            onClick={() => setZoomLevel("state")}
            className={`text-[10.5px] font-bold px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
              zoomLevel === "state"
                ? "bg-burgundy-700 text-white shadow-2xs"
                : "text-ink-secondary hover:bg-blush"
            }`}
            title="View entire state overview"
          >
            🌐 State View
          </button>
        </div>
      </div>

      {/* Real Map Canvas Container */}
      <div className="relative bg-[#E8E2D9] rounded-[12px] overflow-hidden border border-[rgba(124,45,45,0.12)] h-[460px] shadow-2xs">
        {/* Real OpenStreetMap Live Iframe Embed Centered on Exact Location */}
        <iframe
          key={`${currentTarget.lat}-${currentTarget.lng}-${zoomLevel}`}
          title={`${currentTarget.name} Healthcare Surveillance Map`}
          src={mapIframeSrc}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* Live Top Ribbon with Exact GPS Coordinates */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-2 flex items-center justify-between shadow-sm text-[11.5px]">
          <div className="flex items-center gap-2 font-bold text-ink-primary truncate">
            <Navigation className="w-3.5 h-3.5 text-burgundy-700 flex-shrink-0" />
            <span>Exact Location: <strong className="text-burgundy-800">{currentTarget.name}</strong></span>
            <span className="text-[10px] font-mono text-ink-tertiary bg-bg px-1.5 py-0.5 rounded border border-[rgba(124,45,45,0.1)]">
              {currentTarget.lat.toFixed(4)}°N, {currentTarget.lng.toFixed(4)}°E
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${ACCESS_CONFIG[activeDistrict.access].badge}`}>
              {activeDistrict.score}% Accessibility
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDetectLocation}
              className="text-[11px] font-bold text-ink-primary bg-bg hover:bg-blush border border-[rgba(124,45,45,0.15)] rounded-[6px] px-2.5 py-1 flex items-center gap-1 transition-colors cursor-pointer"
              title="Detect and center current location"
            >
              <Compass className="w-3 h-3 text-rose-600" />
              <span>My GPS</span>
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${currentTarget.lat},${currentTarget.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-burgundy-700 hover:underline flex items-center gap-1"
            >
              Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Floating District Selector Cards on Bottom */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 space-y-2">
          {/* Selected District Telemetry Card */}
          <div className="bg-white/95 backdrop-blur-md border border-[rgba(124,45,45,0.15)] rounded-[10px] p-3.5 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[14px] text-ink-primary">{activeDistrict.name}</h4>
                  <span className="text-[10px] font-semibold text-ink-tertiary">({activeDistrict.division})</span>
                  <span className="text-[10px] font-mono text-ink-secondary bg-bg px-1.5 py-0.5 rounded border border-[rgba(124,45,45,0.08)]">
                    GPS: {activeDistrict.lat.toFixed(4)}, {activeDistrict.lng.toFixed(4)}
                  </span>
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

            {/* Quick District / Zone Buttons */}
            <div className="flex gap-1 pt-2 overflow-x-auto pb-0.5">
              {filteredDistricts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelect(d)}
                  className={`px-2.5 py-1 rounded-[6px] text-[10.5px] font-bold border transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                    activeDistrict.id === d.id && !customGps
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
