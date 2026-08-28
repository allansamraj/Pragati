"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Mic, Globe, ArrowRight,
  CheckCircle2, AlertCircle, Zap, ChevronRight,
  Clock, XCircle, Phone, Video, Ticket, AlertTriangle, ShieldCheck,
  RefreshCw, Navigation, Map as MapIcon, List as ListIcon, X, WifiOff,
  Filter, Building2, ArrowUpDown
} from "lucide-react";
import { Facility } from "@/data/facilities";
import { useLanguage } from "@/lib/i18n";
import { RealTimeFacilityMap } from "@/components/shared/RealTimeFacilityMap";
import { useLocationContext } from "@/lib/context/LocationContext";
import { NearbySearchResult } from "@/lib/services/facilityService";
import { formatDistance } from "@/lib/services/locationService";

type TriageLevel = "routine" | "urgent" | "emergency";

function FindCareContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  // Centralized Global Location Context
  const {
    lat,
    lng,
    locality,
    source,
    status: locationStatus,
    error: locationError,
    isRefreshing: isRefreshingLocation,
    isOffline,
    lastUpdated,
    refreshGPS,
    setManualLocation,
    clearManualLocation,
    getDirectionsUrl,
    searchNearby,
  } = useLocationContext();

  // Toast
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Manual Location Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Search, Sort & Triage States
  const [query, setQuery] = useState("");
  const [specialtyParam, setSpecialtyParam] = useState("");
  const [triageLevel, setTriageLevel] = useState<TriageLevel>("urgent");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("fac-001");
  const [customRadiusKm, setCustomRadiusKm] = useState<number | undefined>(undefined);
  const [ownershipFilter, setOwnershipFilter] = useState<"all" | "government" | "private">("all");
  const [sortMode, setSortMode] = useState<"nearest" | "best_match">("nearest");
  const [selectedDetailFacility, setSelectedDetailFacility] = useState<Facility | null>(null);

  // Mobile View Toggle
  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");

  // Facility Results
  const [searchResult, setSearchResult] = useState<NearbySearchResult | null>(null);
  const [searchingFacilities, setSearchingFacilities] = useState(false);

  // ── REFRESH FACILITIES WHEN LOCATION, QUERY, RADIUS OR SORT CHANGES ──
  const executeSearch = useCallback(async (searchQuery?: string) => {
    const activeQuery = searchQuery !== undefined ? searchQuery : query;
    setSearchingFacilities(true);
    try {
      const res = await searchNearby(
        activeQuery,
        specialtyParam,
        triageLevel === "emergency",
        ownershipFilter === "all" ? "ALL" : ownershipFilter === "government" ? "GOVERNMENT" : "PRIVATE",
        sortMode,
        customRadiusKm
      );
      setSearchResult(res);
      if (res.facilities.length > 0) {
        setSelectedFacilityId(res.facilities[0].id);
      }
    } catch (err) {
      console.error("Facility search failed:", err);
    } finally {
      setSearchingFacilities(false);
    }
  }, [searchNearby, query, specialtyParam, triageLevel, ownershipFilter, sortMode, customRadiusKm]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  // ── REACT TO URL PARAMS (e.g. ?specialty=cardiology or ?q=...) ──
  useEffect(() => {
    const specialty = searchParams?.get("specialty");
    const q = searchParams?.get("q");

    if (specialty === "general" || specialty === "phc") {
      setTriageLevel("routine");
      setSpecialtyParam("General Medicine");
      setQuery("Routine Primary Health Check & Blood Pressure");
    } else if (specialty === "cardiology") {
      setTriageLevel("urgent");
      setSpecialtyParam("Cardiology");
      setQuery("Cardiology Specialist OPD & 12-Lead ECG");
    } else if (specialty === "emergency") {
      setTriageLevel("emergency");
      setSpecialtyParam("Emergency");
      setQuery("Acute Emergency Trauma & 108 Dispatch");
    } else if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  // ── MANUAL LOCATION SUBMIT ──
  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setManualLoading(true);
    setManualError(null);
    try {
      await setManualLocation(manualQuery);
      setShowManualModal(false);
      setManualQuery("");
      setLocationToast(`Location set to manual pin`);
      setTimeout(() => setLocationToast(null), 3500);
    } catch (err: any) {
      setManualError(err?.message || "Location not found. Please enter a valid PIN or city.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleRefreshGPS = async () => {
    setLocationToast("Updating location...");
    await refreshGPS(true);
    setLocationToast("Location updated");
    setTimeout(() => setLocationToast(null), 3000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleTriageSelect = (level: TriageLevel, sampleQueryKey: string) => {
    setTriageLevel(level);
    setQuery(t(sampleQueryKey));
    if (level === "emergency") {
      setSpecialtyParam("Emergency");
    } else if (level === "routine") {
      setSpecialtyParam("General Medicine");
    } else {
      setSpecialtyParam("Cardiology");
    }
  };

  // 1. Clinical Recommendation Facilities (left list)
  let facilities = searchResult?.facilities || [];
  if (customRadiusKm !== undefined) {
    facilities = facilities.filter((f) => (f.distanceKm ?? 999) <= customRadiusKm);
  }
  if (ownershipFilter === "government") {
    facilities = facilities.filter(
      (f) => f.ownershipSector === "GOVERNMENT" || f.ownership === "government" || f.facilityType.startsWith("GOVERNMENT")
    );
  } else if (ownershipFilter === "private") {
    facilities = facilities.filter(
      (f) =>
        f.ownershipSector === "PRIVATE" ||
        f.ownership === "private" ||
        f.ownership === "private_empaneled" ||
        f.facilityType.startsWith("PRIVATE") ||
        f.facilityType === "DIAGNOSTIC_CENTER" ||
        f.facilityType === "PHARMACY"
    );
  }

  // 2. Map Discovery Facilities (right map) - ALL nearby healthcare facilities
  let mapFacilities = searchResult?.allNearbyFacilities || searchResult?.facilities || [];
  if (customRadiusKm !== undefined) {
    mapFacilities = mapFacilities.filter((f) => (f.distanceKm ?? 999) <= customRadiusKm);
  }
  if (ownershipFilter === "government") {
    mapFacilities = mapFacilities.filter(
      (f) => f.ownershipSector === "GOVERNMENT" || f.ownership === "government" || f.facilityType.startsWith("GOVERNMENT")
    );
  } else if (ownershipFilter === "private") {
    mapFacilities = mapFacilities.filter(
      (f) =>
        f.ownershipSector === "PRIVATE" ||
        f.ownership === "private" ||
        f.ownership === "private_empaneled" ||
        f.facilityType.startsWith("PRIVATE") ||
        f.facilityType === "DIAGNOSTIC_CENTER" ||
        f.facilityType === "PHARMACY"
    );
  }

  const effectiveRadiusKm = customRadiusKm ?? searchResult?.searchRadiusKm ?? 5;
  const isBestMatchMode = searchResult?.isBestMatchMode || false;


  return (
    <div className="max-w-[1240px] space-y-5">
      {/* ── LIVE LOCATION TOAST ── */}
      <AnimatePresence>
        {locationToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-burgundy-900 text-white rounded-[10px] text-[12.5px] font-bold shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{locationToast}</span>
            </div>
            <button onClick={() => setLocationToast(null)} className="text-white/60 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOCATION PERMISSION / ERROR BANNER (WHEN NOT DETECTED) ── */}
      {locationStatus === "error" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[13.5px] block font-bold">Unable to determine your current location.</strong>
              <p className="text-[12px] text-amber-800 mt-0.5">
                Allow device GPS permission or enter your locality / PIN code manually to find nearby hospitals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRefreshGPS}
              className="px-3.5 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[8px] text-[12px] font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 rounded-[8px] text-[12px] font-bold transition-colors cursor-pointer"
            >
              Enter Location Manually
            </button>
          </div>
        </div>
      )}

      {/* ── CURRENT LOCATION HEADER ── */}
      <div className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center flex-shrink-0 text-burgundy-700">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-burgundy-700">
                Near You
              </span>
              {source === "MANUAL" ? (
                <span className="text-[10px] text-ink-tertiary font-medium bg-bg px-1.5 py-0.2 rounded border border-[rgba(124,45,45,0.08)]">
                  Using selected location
                </span>
              ) : (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Using your current location
                </span>
              )}
            </div>
            <h2 className="text-[16px] font-extrabold text-ink-primary mt-0.5">
              {locality}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleRefreshGPS}
            disabled={isRefreshingLocation}
            className="px-3.5 py-1.5 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[12px] font-bold text-ink-primary flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-burgundy-700 ${isRefreshingLocation ? "animate-spin" : ""}`} />
            {isRefreshingLocation ? "Updating..." : "Use Current Location"}
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[12px] font-bold text-burgundy-700 transition-colors cursor-pointer"
          >
            Change
          </button>
        </div>
      </div>

      {/* ── OFFLINE STATUS BANNER ── */}
      {isOffline && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[10px] flex items-center justify-between text-amber-900 text-[12px] font-semibold">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>LAST KNOWN DATA (Offline Mode) · Device GPS active</span>
          </div>
          <span className="text-[11px] font-mono text-amber-800">
            Last synchronized: {lastUpdated || "10:15 AM"}
          </span>
        </div>
      )}

      {/* ── 3-TIER TRIAGE SELECTOR ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleTriageSelect("routine", "findCare.sampleRoutine")}
          className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
            triageLevel === "routine"
              ? "bg-emerald-50 border-emerald-500 shadow-2xs ring-1 ring-emerald-500"
              : "bg-white border-[rgba(124,45,45,0.1)] hover:bg-blush/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[13px] font-bold text-ink-primary">🟢 Routine Primary Care</span>
          </div>
          <p className="text-[11.5px] text-ink-secondary">
            General Medicine, routine checkup, blood sugar, PHC OPD
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleTriageSelect("urgent", "findCare.sampleUrgent")}
          className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
            triageLevel === "urgent"
              ? "bg-amber-50 border-amber-500 shadow-2xs ring-1 ring-amber-500"
              : "bg-white border-[rgba(124,45,45,0.1)] hover:bg-blush/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[13px] font-bold text-ink-primary">🟡 Urgent Clinical Care</span>
          </div>
          <p className="text-[11.5px] text-ink-secondary">
            Exertional chest discomfort, 12-Lead ECG, Specialist OPD
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleTriageSelect("emergency", "findCare.sampleEmergency")}
          className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
            triageLevel === "emergency"
              ? "bg-rose-50 border-rose-500 shadow-2xs ring-1 ring-rose-500"
              : "bg-white border-[rgba(124,45,45,0.1)] hover:bg-rose-50/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[13px] font-bold text-rose-700">🔴 Emergency / Trauma</span>
          </div>
          <p className="text-[11.5px] text-ink-secondary">
            Severe acute distress, 24/7 ICU &amp; 108 Ambulance
          </p>
        </button>
      </div>

      {/* ── EMERGENCY IMMEDIATE BANNER ── */}
      {triageLevel === "emergency" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-700 text-white rounded-[14px] p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Phone className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                EMERGENCY CARE NEAR YOU
              </div>
              <div className="text-[18px] font-black">Severe Acute Symptoms Detected</div>
              <p className="text-[12.5px] text-white/90 mt-0.5">
                Immediate clinical stabilization required. Dispatching 108 emergency ambulance does not require internet or search.
              </p>
            </div>
          </div>
          <a
            href="tel:108"
            className="inline-flex items-center justify-center gap-2 bg-white text-rose-700 hover:bg-rose px-6 py-3 rounded-[10px] font-bold text-[14px] transition-colors shadow-sm flex-shrink-0"
          >
            <Phone className="w-4 h-4" /> Call 108 Now (Toll-Free)
          </a>
        </motion.div>
      )}

      {/* ── SEARCH INPUT BOX ── */}
      <div id="triage-input" className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-2xs">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-ink-tertiary" aria-hidden />
            <textarea
              id="care-search"
              className="w-full bg-bg border border-[rgba(124,45,45,0.12)] rounded-[10px] text-[14px] text-ink-primary placeholder:text-ink-tertiary pl-10 pr-12 py-3 resize-none focus:outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600/20 transition-all"
              rows={2}
              placeholder="Search by symptom, specialty, test, or hospital name (e.g. 'JS Global', 'I need an ECG', 'Cardiology', 'Apollo')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  executeSearch(query);
                }
              }}
            />
            <div className="absolute right-3 top-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setQuery("I need an ECG and Cardiology OPD consultation");
                  setSpecialtyParam("Cardiology");
                }}
                className="p-1.5 rounded-[6px] hover:bg-blush text-ink-tertiary hover:text-burgundy-700 transition-colors cursor-pointer"
                title="Voice Input (AI Clinical Triage)"
              >
                <Mic className="w-4 h-4 text-burgundy-700" />
              </button>
            </div>
          </div>

            {/* Radius, Ownership & Sort Filters */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-ink-tertiary mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Distance:
                </span>
                {[
                  { label: "Within 2 km", val: 2 },
                  { label: "Within 5 km", val: 5 },
                  { label: "Within 10 km", val: 10 },
                  { label: "Within 25 km", val: 25 },
                  { label: "Any distance", val: undefined },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setCustomRadiusKm(chip.val)}
                    className={`px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border transition-colors cursor-pointer ${
                      customRadiusKm === chip.val
                        ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                        : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Sort Order Selector (Nearest vs Best Match) */}
              <div className="flex items-center gap-1.5 flex-wrap border-t border-[rgba(124,45,45,0.06)] pt-2">
                <span className="text-[11px] font-bold text-ink-tertiary mr-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" /> Sort Mode:
                </span>
                <button
                  type="button"
                  onClick={() => setSortMode("nearest")}
                  className={`px-3 py-1 rounded-[6px] text-[11px] font-bold border transition-colors cursor-pointer ${
                    sortMode === "nearest"
                      ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                      : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                  }`}
                >
                  📍 Nearest First (Proximity)
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode("best_match")}
                  className={`px-3 py-1 rounded-[6px] text-[11px] font-bold border transition-colors cursor-pointer ${
                    sortMode === "best_match"
                      ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                      : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                  }`}
                >
                  ⭐ Best Clinical Match
                </button>
              </div>

              {/* Facility Sector Filter Chips (ALL, GOVERNMENT, PRIVATE) */}
              <div className="flex items-center gap-1.5 flex-wrap border-t border-[rgba(124,45,45,0.06)] pt-2">
                <span className="text-[11px] font-bold text-ink-tertiary mr-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Facility Type:
                </span>
                {[
                  { label: "ALL (Public & Private)", val: "all" },
                  { label: "🏛️ GOVERNMENT (Free Care)", val: "government" },
                  { label: "🏥 PRIVATE (Hospitals & Clinics)", val: "private" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setOwnershipFilter(chip.val as any)}
                    className={`px-3 py-1 rounded-[6px] text-[11px] font-semibold border transition-colors cursor-pointer ${
                      ownershipFilter === chip.val
                        ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                        : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[13px] font-bold px-5 py-2.5 rounded-[9px] transition-colors shadow-2xs ml-auto cursor-pointer mt-1"
            >
              {sortMode === "best_match" ? "Find Best Matches" : "Find Nearby Facilities"} <ArrowRight className="w-4 h-4" />
            </button>
        </form>
      </div>

      {/* ── MOBILE VIEW TOGGLE TABS (Map vs List) ── */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-bg border border-[rgba(124,45,45,0.1)] rounded-[10px]">
        <button
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2 rounded-[8px] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "list" ? "bg-white text-ink-primary shadow-2xs" : "text-ink-secondary"
          }`}
        >
          <ListIcon className="w-3.5 h-3.5" /> List View ({facilities.length})
        </button>
        <button
          onClick={() => setMobileTab("map")}
          className={`flex-1 py-2 rounded-[8px] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "map" ? "bg-white text-ink-primary shadow-2xs" : "text-ink-secondary"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" /> Resource Map
        </button>
      </div>

      {/* ── RESULTS HEADER & SEARCH RADIUS ── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-[17px] font-extrabold text-ink-primary">
              {specialtyParam || query ? "Clinical Recommendations" : "Nearby Healthcare Facilities"}
            </h2>
            <p className="text-[12px] text-ink-secondary">
              {specialtyParam || query
                ? `Showing matching healthcare facilities for ${specialtyParam || query} within ${effectiveRadiusKm} km (${mapFacilities.length} total on map)`
                : `Showing healthcare facilities within ${effectiveRadiusKm} km of your location`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11.5px] font-bold text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.12)] px-2.5 py-1 rounded-[6px]">
              {facilities.length} Clinical Matches
            </span>
            <span className="text-[11.5px] font-bold text-ink-primary bg-surface border border-[rgba(124,45,45,0.12)] px-2.5 py-1 rounded-[6px]">
              {mapFacilities.length} on Map
            </span>
          </div>
        </div>

        {searchResult?.isExpandedRadius && customRadiusKm === undefined && facilities.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[10px] flex items-center gap-2 text-amber-900 text-[12px] font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Showing verified facilities within {effectiveRadiusKm} km because fewer direct specialty matches were found within 5 km.</span>
          </div>
        )}
      </div>

      {/* ── FACILITY RESULTS & SPATIAL MAP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Ranked Facilities List */}
        <div className={`space-y-4 ${mobileTab === "map" ? "hidden lg:block" : "block"}`}>
          {facilities.length === 0 ? (
            <div className="bg-white rounded-[14px] border border-[rgba(124,45,45,0.1)] p-8 text-center space-y-3 shadow-2xs">
              <Building2 className="w-10 h-10 text-ink-tertiary mx-auto opacity-60" />
              <h3 className="text-[16px] font-bold text-ink-primary">
                0 clinical matches found {specialtyParam ? `for ${specialtyParam}` : ""} within {effectiveRadiusKm} km.
              </h3>
              <p className="text-[13px] text-ink-secondary max-w-md mx-auto">
                {mapFacilities.length > 0
                  ? `Nearby healthcare facilities (${mapFacilities.length} active hospitals, clinics, and centres) are still displayed on the map to your right.`
                  : "Try expanding your search distance or allowing GPS permissions to find facilities in adjacent areas."}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {mapFacilities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSpecialtyParam("");
                      setOwnershipFilter("all");
                    }}
                    className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[8px] text-[12.5px] font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Show All {mapFacilities.length} Facilities on List
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCustomRadiusKm(10)}
                  className="px-4 py-2 bg-blush hover:bg-rose text-burgundy-700 border border-[rgba(124,45,45,0.15)] rounded-[8px] text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  Expand to 10 km
                </button>
              </div>
            </div>
          ) : (

            facilities.map((facility, index) => {
              const isBestMatch = isBestMatchMode && (facility.matchScore ?? 0) >= 80 && index === 0;
              const isSelected = selectedFacilityId === facility.id;

              return (
                <motion.div
                  key={facility.id}
                  layout
                  onClick={() => setSelectedFacilityId(facility.id)}
                  className={`bg-white rounded-[14px] border transition-all p-5 shadow-2xs cursor-pointer ${
                    isSelected
                      ? "border-burgundy-600/60 ring-2 ring-burgundy-600/20"
                      : isBestMatch
                      ? "border-burgundy-600/40 ring-1 ring-burgundy-600/20"
                      : "border-[rgba(124,45,45,0.1)] hover:border-burgundy-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        {facility.recommendationLabel ? (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider rounded px-2 py-0.5 ${
                            facility.matchTier === "BEST_SPECIALTY_MATCH"
                              ? "text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)]"
                              : facility.matchTier === "NEARBY_GENERAL_CARE"
                              ? "text-amber-800 bg-amber-50 border border-amber-200"
                              : "text-neutral-700 bg-neutral-100 border border-neutral-200"
                          }`}>
                            {facility.recommendationLabel} ({facility.matchScore}% Suitability)
                          </span>
                        ) : isBestMatch ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-2 py-0.5">
                            ★ BEST SPECIALTY MATCH ({facility.matchScore}% Clinical Suitability)
                          </span>
                        ) : null}
                        {facility.ownershipSector === "GOVERNMENT" ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-burgundy-800 bg-rose-50 border border-burgundy-200 rounded px-2 py-0.5">
                            🏛️ GOVERNMENT
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
                            🏥 PRIVATE
                          </span>
                        )}
                        {facility.isPmJayEmpaneled && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded px-2 py-0.5 flex items-center gap-1">
                            💳 PM-JAY Cashless
                          </span>
                        )}
                      </div>
                      <h3 className="text-[17px] font-extrabold text-ink-primary">
                        {facility.name}
                      </h3>
                      <div className="text-[12.5px] text-ink-secondary mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-burgundy-700">{formatDistance(facility.distanceKm)} away</span>
                        <span>·</span>
                        <span>{facility.type}</span>
                        <span>·</span>
                        <span>~{facility.travelMinutes} mins travel time</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {facility.matchScore !== undefined ? (
                        <div>
                          <div className={`text-[20px] font-extrabold font-mono ${
                            (facility.matchScore ?? 0) >= 75 ? "text-emerald-700" : "text-amber-700"
                          }`}>
                            {facility.matchScore}%
                          </div>
                          <div className="text-[9.5px] uppercase tracking-wider text-ink-tertiary font-bold">
                            Suitability
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          ● Verified
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Important Available Services Tags */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5 text-[12px] bg-bg p-3 rounded-[10px] border border-[rgba(124,45,45,0.06)]">
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">Clinical Care</span>
                      <span className="font-bold text-ink-primary flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${facility.isDirectSpecialtyMatch ? "text-emerald-700" : "text-ink-tertiary"}`} />
                        {facility.doctors && facility.doctors.length > 0
                          ? facility.doctors[0].name.split(",")[0]
                          : facility.isDirectSpecialtyMatch
                          ? (facility.specialties && facility.specialties.length > 0 ? facility.specialties[0] : "Specialty Care")
                          : "General OPD"}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">Facility Type</span>
                      <span className="font-bold text-ink-primary flex items-center gap-1 mt-0.5 truncate">
                        {facility.category === "EYE_HOSPITAL" ? "Eye & Vision Care" :
                         facility.category === "SKIN_CLINIC" ? "Dermatology Clinic" :
                         facility.category === "DENTAL_CLINIC" ? "Dental Clinic" :
                         facility.category === "CARDIOLOGY_CLINIC" ? "Cardiology Centre" :
                         facility.category === "DIAGNOSTIC_CENTER" ? "Diagnostic Lab" :
                         facility.category === "PRIMARY_HEALTH_CENTRE" ? "Urban Health Centre" :
                         facility.category === "HOSPITAL" || facility.category === "GOVERNMENT_HOSPITAL" ? "Hospital" :
                         facility.type || "Healthcare Centre"}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">Operating Hours</span>
                      <span className={`font-bold mt-0.5 block ${facility.isOpen === true ? "text-emerald-700" : "text-ink-primary"}`}>
                        {facility.openingHours || (facility.isOpen === true ? "Open Now" : facility.isOpen === false ? "Closed Now" : "Standard OPD Hours")}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-tertiary block text-[10.5px]">Emergency Care</span>
                      <span className={`font-bold mt-0.5 block ${facility.emergencyAvailable || facility.emergencyCapability ? "text-emerald-700" : "text-ink-secondary"}`}>
                        {facility.emergencyAvailable || facility.emergencyCapability ? "24/7 Emergency Active" : "Outpatient OPD"}
                      </span>
                    </div>
                  </div>

                  {/* Match reasons / warnings */}
                  {facility.matchReasons && facility.matchReasons.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[11px]">
                      {facility.matchReasons.map((r) => (
                        <span key={r} className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded px-2 py-0.5 font-medium">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[rgba(124,45,45,0.08)] flex-wrap">
                    <div className="text-[11.5px] text-ink-tertiary flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{facility.accreditation || (facility.ownershipSector === "GOVERNMENT" ? "Government Public Healthcare · Free Care" : "Ayushman Bharat PM-JAY & Private Network")}</span>
                      </div>
                      <span className="text-[10px] font-mono text-ink-tertiary bg-bg px-1.5 py-0.2 rounded border border-[rgba(124,45,45,0.1)]">
                        {facility.source || "Official Health Directory"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailFacility(facility);
                        }}
                        className="px-3 py-2 rounded-[8px] bg-white hover:bg-blush border border-[rgba(124,45,45,0.15)] text-burgundy-700 text-[12px] font-bold transition-colors cursor-pointer"
                      >
                        View Details
                      </button>

                      <a
                        href={getDirectionsUrl(facility.lat, facility.lng, facility.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 rounded-[8px] bg-white hover:bg-blush border border-[rgba(124,45,45,0.15)] text-ink-secondary hover:text-burgundy-700 text-[12px] font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-burgundy-700" /> Directions
                      </a>

                      <Link
                        href="/patient/token"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3.5 py-2 rounded-[8px] bg-burgundy-700 hover:bg-burgundy-800 text-white text-[12px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Ticket className="w-3.5 h-3.5" /> {facility.queue?.nowServing ? `Book Token (#${facility.queue.nowServing})` : "Book Token"}
                      </Link>

                      <Link
                        href="/patient/teleconsult"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 rounded-[8px] bg-blush border border-[rgba(124,45,45,0.15)] text-burgundy-700 hover:bg-rose text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Teleconsult
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right: Real-time Resource Map */}
        <div className={mobileTab === "list" ? "hidden lg:block" : "block"}>
          <RealTimeFacilityMap
            facilities={mapFacilities}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={setSelectedFacilityId}
            patientCoords={{ lat, lng, locality, isManual: source === "MANUAL" }}
            searchRadiusKm={effectiveRadiusKm}
          />
        </div>
      </div>

      {/* ── MANUAL LOCATION MODAL ── */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[16px] max-w-[480px] w-full shadow-2xl border border-[rgba(124,45,45,0.2)] overflow-hidden"
            >
              <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink-primary flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-burgundy-700" /> Enter Location Manually
                </span>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="p-1 rounded hover:bg-blush text-ink-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleManualLocationSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-ink-secondary block mb-1.5">
                    Enter locality, PIN code, town, or city
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Perungudi Chennai, Nandurbar, Mumbai, 600096"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    className="w-full h-10 px-3 bg-bg border border-[rgba(124,45,45,0.15)] rounded-[8px] text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600"
                  />
                  {manualError && (
                    <p className="text-[11.5px] text-rose-600 mt-1 font-medium">{manualError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-ink-tertiary uppercase block">
                    Quick Sample Locations:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {["Perungudi, Chennai", "Nandurbar", "Mumbai", "Pune", "Dhadgaon"].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setManualQuery(loc)}
                        className="px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-bg hover:bg-blush border border-[rgba(124,45,45,0.1)] text-ink-secondary cursor-pointer"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="px-3.5 py-2 rounded-[8px] border border-[rgba(124,45,45,0.12)] text-[12px] font-semibold text-ink-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={manualLoading}
                    className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white font-bold text-[12px] rounded-[8px] shadow-2xs cursor-pointer"
                  >
                    {manualLoading ? "Locating..." : "Set Location"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FACILITY DETAILS POPUP MODAL ── */}
      <AnimatePresence>
        {selectedDetailFacility && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[18px] max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[rgba(124,45,45,0.15)] shadow-2xl p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[rgba(124,45,45,0.08)] pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        selectedDetailFacility.ownershipSector === "GOVERNMENT"
                          ? "bg-rose-50 text-burgundy-800 border-burgundy-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}
                    >
                      {selectedDetailFacility.ownershipSector === "GOVERNMENT" ? "🏛️ GOVERNMENT" : "🏥 PRIVATE"}
                    </span>
                    {selectedDetailFacility.isPmJayEmpaneled && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                        💳 PM-JAY Cashless Eligible
                      </span>
                    )}
                  </div>
                  <h3 className="text-[18px] font-extrabold text-ink-primary">
                    {selectedDetailFacility.name}
                  </h3>
                  <p className="text-[12px] text-ink-tertiary mt-0.5">
                    {selectedDetailFacility.type} · {selectedDetailFacility.distanceKm} km from your location (~{selectedDetailFacility.travelMinutes} mins travel)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDetailFacility(null)}
                  className="p-1.5 rounded-full hover:bg-blush text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Freshness */}
              <div className="grid grid-cols-2 gap-2 text-[12px] bg-bg p-3 rounded-[10px] border border-[rgba(124,45,45,0.06)]">
                <div>
                  <span className="text-ink-tertiary block text-[10px] uppercase font-bold">Operating Hours</span>
                  <span className="font-bold text-ink-primary mt-0.5 block">{selectedDetailFacility.hours}</span>
                </div>
                <div>
                  <span className="text-ink-tertiary block text-[10px] uppercase font-bold">Data Freshness</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{selectedDetailFacility.lastUpdated || "Live Telemetry"}</span>
                </div>
                <div>
                  <span className="text-ink-tertiary block text-[10px] uppercase font-bold">Live OPD Queue</span>
                  <span className="font-bold text-ink-primary mt-0.5 block">
                    Now Serving #{selectedDetailFacility.queue?.nowServing || 24} · ~{selectedDetailFacility.queue?.estimatedWait || 12} min wait
                  </span>
                </div>
                <div>
                  <span className="text-ink-tertiary block text-[10px] uppercase font-bold">Emergency Unit</span>
                  <span className={`font-bold mt-0.5 block ${selectedDetailFacility.emergencyCapability ? "text-emerald-700" : "text-ink-tertiary"}`}>
                    {selectedDetailFacility.emergencyCapability ? "24/7 Trauma Active" : "Daycare / OPD Only"}
                  </span>
                </div>
              </div>

              {/* Doctors & Specialists */}
              {selectedDetailFacility.doctors && selectedDetailFacility.doctors.length > 0 ? (
                <div>
                  <h4 className="text-[12.5px] font-bold text-ink-primary mb-1.5">Specialists on Duty:</h4>
                  <div className="space-y-1.5">
                    {selectedDetailFacility.doctors.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-[12px] bg-white p-2 rounded-[8px] border border-[rgba(124,45,45,0.08)]">
                        <div>
                          <span className="font-bold text-ink-primary">{doc.name}</span>
                          <span className="text-ink-tertiary ml-1.5">({doc.specialty})</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {doc.status === "available" ? "● Available" : "On Call"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedDetailFacility.specialties && selectedDetailFacility.specialties.length > 0 ? (
                <div>
                  <h4 className="text-[12.5px] font-bold text-ink-primary mb-1.5">Specialty Clinical Coverage:</h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDetailFacility.specialties.map((s) => (
                      <span key={s} className="text-[11.5px] bg-white border border-[rgba(124,45,45,0.1)] px-2.5 py-1 rounded-[6px] text-ink-primary font-medium">
                        ● {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Diagnostics */}
              {selectedDetailFacility.diagnostics && selectedDetailFacility.diagnostics.length > 0 ? (
                <div>
                  <h4 className="text-[12.5px] font-bold text-ink-primary mb-1.5">Available Diagnostics:</h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDetailFacility.diagnostics.map((diag) => (
                      <span key={diag.id} className="text-[11.5px] bg-bg border border-[rgba(124,45,45,0.1)] px-2.5 py-1 rounded-[6px] text-ink-primary font-medium">
                        ✓ {diag.name} {diag.waitTime ? `(~${diag.waitTime}m wait)` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ) : selectedDetailFacility.services && selectedDetailFacility.services.length > 0 ? (
                <div>
                  <h4 className="text-[12.5px] font-bold text-ink-primary mb-1.5">Available Clinical Services:</h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDetailFacility.services.map((s) => (
                      <span key={s} className="text-[11.5px] bg-bg border border-[rgba(124,45,45,0.1)] px-2.5 py-1 rounded-[6px] text-ink-primary font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[rgba(124,45,45,0.08)]">
                <a
                  href={getDirectionsUrl(selectedDetailFacility.lat, selectedDetailFacility.lng, selectedDetailFacility.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[9px] text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Navigation className="w-4 h-4" /> Directions
                </a>
                <a
                  href={`tel:${selectedDetailFacility.phone}`}
                  className="px-4 py-2.5 bg-white hover:bg-blush border border-[rgba(124,45,45,0.15)] text-ink-primary rounded-[9px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-burgundy-700" /> Call Facility
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FindCarePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-tertiary">Loading PRAGATI Care Finder...</div>}>
      <FindCareContent />
    </Suspense>
  );
}
