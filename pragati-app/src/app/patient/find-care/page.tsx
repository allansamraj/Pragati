"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Mic, Globe, ArrowRight,
  CheckCircle2, AlertCircle, Zap, ChevronRight,
  Clock, XCircle, Phone, Video, Ticket, AlertTriangle, ShieldCheck,
  RefreshCw, Navigation, Map as MapIcon, List as ListIcon, X, WifiOff
} from "lucide-react";
import { Facility } from "@/data/facilities";
import { useLanguage } from "@/lib/i18n";
import { RealTimeFacilityMap } from "@/components/shared/RealTimeFacilityMap";
import {
  getCurrentLocation,
  reverseGeocode,
  geocodeManualLocation,
  checkLocationPermission,
  GeocodedLocation
} from "@/lib/services/locationService";
import {
  getNearbyFacilities,
  NearbySearchResult
} from "@/lib/services/facilityService";

type TriageLevel = "routine" | "urgent" | "emergency";

function FindCareContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  // Location States
  const [patientLocation, setPatientLocation] = useState<GeocodedLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied" | "error">("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Manual Location Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Search & Triage States
  const [query, setQuery] = useState("");
  const [specialtyParam, setSpecialtyParam] = useState("");
  const [triageLevel, setTriageLevel] = useState<TriageLevel>("urgent");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("fac-001");

  // Mobile View Toggle
  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");

  // Facility Results
  const [searchResult, setSearchResult] = useState<NearbySearchResult | null>(null);
  const [searchingFacilities, setSearchingFacilities] = useState(false);

  // ── 1. RETRIEVE CURRENT DEVICE GPS ──
  const requestCurrentLocation = useCallback(async (isUserRefresh = false) => {
    if (isUserRefresh) {
      setIsRefreshingLocation(true);
      setLocationToast("Updating location...");
    } else {
      setLocationStatus("loading");
    }
    setLocationError(null);

    try {
      const coords = await getCurrentLocation();
      const geocoded = await reverseGeocode(coords.lat, coords.lng);
      setPatientLocation(geocoded);
      setLocationStatus("granted");

      if (isUserRefresh) {
        setLocationToast("Location updated");
        setTimeout(() => setLocationToast(null), 3000);
      }
    } catch (err: any) {
      console.warn("GPS lookup error:", err);
      setLocationStatus("error");
      setLocationError(err?.message || "Unable to determine your current location.");
      if (isUserRefresh) {
        setLocationToast(null);
      }
    } finally {
      setIsRefreshingLocation(false);
    }
  }, []);

  // ── 2. INITIALIZE LOCATION CHECK ON MOUNT ──
  useEffect(() => {
    const initLocation = async () => {
      // Check if permission already granted or cached
      const perm = await checkLocationPermission();
      if (perm === "granted") {
        requestCurrentLocation(false);
      } else {
        // Fallback: auto-request location or prompt gracefully
        requestCurrentLocation(false);
      }
    };
    initLocation();
  }, [requestCurrentLocation]);

  // ── 3. FETCH NEARBY FACILITIES WHEN LOCATION OR QUERY CHANGES ──
  const refreshFacilities = useCallback(async () => {
    // If location is not available yet, use default central fallback coordinates
    const lat = patientLocation?.lat ?? 21.3734;
    const lng = patientLocation?.lng ?? 74.2404;
    const locality = patientLocation?.locality ?? "Nandurbar, Maharashtra";

    setSearchingFacilities(true);
    try {
      const res = await getNearbyFacilities({
        lat,
        lng,
        locality,
        needQuery: query,
        specialty: specialtyParam,
        isEmergency: triageLevel === "emergency",
      });
      setSearchResult(res);
      if (res.facilities.length > 0) {
        setSelectedFacilityId(res.facilities[0].id);
      }
    } catch (err) {
      console.error("Facility search failed:", err);
    } finally {
      setSearchingFacilities(false);
    }
  }, [patientLocation, query, specialtyParam, triageLevel]);

  useEffect(() => {
    refreshFacilities();
  }, [refreshFacilities]);

  // ── 4. REACT TO URL PARAMS (e.g. ?specialty=cardiology or ?q=...) ──
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

  // ── 5. MANUAL LOCATION SEARCH HANDLER ──
  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setManualLoading(true);
    setManualError(null);
    try {
      const geocoded = await geocodeManualLocation(manualQuery);
      setPatientLocation(geocoded);
      setLocationStatus("granted");
      setLocationError(null);
      setShowManualModal(false);
      setManualQuery("");
      setLocationToast(`Location set to ${geocoded.locality}`);
      setTimeout(() => setLocationToast(null), 3500);
    } catch (err: any) {
      setManualError(err?.message || "Location not found. Please enter a valid PIN or city.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refreshFacilities();
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

  const facilities = searchResult?.facilities || [];
  const searchRadiusKm = searchResult?.searchRadiusKm || 10;
  const isBestMatchMode = searchResult?.isBestMatchMode || false;
  const isOffline = searchResult?.isOffline || false;

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
      {locationStatus === "error" && !patientLocation && (
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
              onClick={() => requestCurrentLocation(true)}
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
              {patientLocation?.isManual ? (
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
              {patientLocation?.locality || "Detecting your location..."}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => requestCurrentLocation(true)}
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
            Last synchronized: {searchResult?.lastSyncTime || "10:15 AM"}
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
              placeholder="Search by symptom, specialty, or test (e.g. 'I need an ECG', 'Cardiology', 'Child fever')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-bg border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-burgundy-700" />
                <span className="text-[12px] font-semibold text-ink-secondary">
                  {patientLocation?.locality || "Current Location"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-bg border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[12px] font-semibold text-ink-secondary capitalize">
                  {triageLevel} Priority
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[13px] font-bold px-5 py-2.5 rounded-[9px] transition-colors shadow-2xs ml-auto cursor-pointer"
            >
              {isBestMatchMode ? "Find Best Matches" : "Find Nearby Facilities"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
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
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div>
          <h2 className="text-[17px] font-extrabold text-ink-primary">
            {isBestMatchMode ? "Best Match Healthcare Facilities" : "Nearby Healthcare Facilities"}
          </h2>
          <p className="text-[12px] text-ink-secondary">
            {searchResult?.isExpandedRadius
              ? `Showing additional facilities within ${searchRadiusKm} km (expanded search)`
              : `Showing healthcare facilities within ${searchRadiusKm} km of your location`}
          </p>
        </div>

        <span className="text-[11.5px] font-bold text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.12)] px-2.5 py-1 rounded-[6px]">
          {facilities.length} Verified Facilities Found
        </span>
      </div>

      {/* ── FACILITY RESULTS & SPATIAL MAP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Ranked Facilities List */}
        <div className={`space-y-4 ${mobileTab === "map" ? "hidden lg:block" : "block"}`}>
          {facilities.map((facility, index) => {
            const isBestMatch = isBestMatchMode && index === 0;

            return (
              <motion.div
                key={facility.id}
                layout
                className={`bg-white rounded-[14px] border transition-all p-5 shadow-2xs ${
                  isBestMatch
                    ? "border-burgundy-600/40 ring-1 ring-burgundy-600/20"
                    : "border-[rgba(124,45,45,0.1)] hover:border-burgundy-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    {isBestMatch && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-2 py-0.5 mb-1.5">
                        ★ BEST MATCH ({facility.matchScore}% Clinical Suitability)
                      </div>
                    )}
                    <h3 className="text-[17px] font-extrabold text-ink-primary">
                      {facility.name}
                    </h3>
                    <div className="text-[12.5px] text-ink-secondary mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-burgundy-700">{facility.distanceKm} km away</span>
                      <span>·</span>
                      <span>{facility.type}</span>
                      <span>·</span>
                      <span>~{facility.travelMinutes} mins travel time</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {facility.matchScore !== undefined ? (
                      <div>
                        <div className="text-[20px] font-extrabold font-mono text-emerald-700">
                          {facility.matchScore}%
                        </div>
                        <div className="text-[9.5px] uppercase tracking-wider text-ink-tertiary font-bold">
                          Suitability
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        ● Open Now
                      </div>
                    )}
                  </div>
                </div>

                {/* Important Available Services Tags */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5 text-[12px] bg-bg p-3 rounded-[10px] border border-[rgba(124,45,45,0.06)]">
                  <div>
                    <span className="text-ink-tertiary block text-[10.5px]">Specialist Doctor</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {facility.doctors[0]?.name ? facility.doctors[0].name.split(",")[0] : "Available"}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-tertiary block text-[10.5px]">12-Lead ECG</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-tertiary block text-[10.5px]">Diagnostic Wait</span>
                    <span className="font-bold text-ink-primary mt-0.5 block">
                      ~{facility.diagnostics[0]?.waitTime || 15} mins wait
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-tertiary block text-[10.5px]">OPD Queue</span>
                    <span className="font-bold text-ink-primary mt-0.5 block">
                      {facility.queue?.estimatedWait || 15} mins wait
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
                  <div className="text-[11.5px] text-ink-tertiary flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {facility.state} Public Health
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/patient/token"
                      className="px-4 py-2 rounded-[8px] bg-burgundy-700 hover:bg-burgundy-800 text-white text-[12.5px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Ticket className="w-3.5 h-3.5" /> Book Token (#{facility.queue?.nowServing || 41})
                    </Link>

                    <Link
                      href="/patient/teleconsult"
                      className="px-3.5 py-2 rounded-[8px] bg-blush border border-[rgba(124,45,45,0.15)] text-burgundy-700 hover:bg-rose text-[12.5px] font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" /> Teleconsult
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Real-time Resource Map */}
        <div className={mobileTab === "list" ? "hidden lg:block" : "block"}>
          <RealTimeFacilityMap
            facilities={facilities}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={setSelectedFacilityId}
            patientCoords={patientLocation}
            searchRadiusKm={searchRadiusKm}
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
                    className="px-3.5 py-2 rounded-[8px] border border-[rgba(124,45,45,0.12)] text-[12px] font-semibold text-ink-secondary"
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
