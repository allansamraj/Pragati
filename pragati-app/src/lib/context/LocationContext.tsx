"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getCurrentLocation,
  reverseGeocode,
  geocodeManualLocation,
  checkLocationPermission,
  calculateDistance,
  calculateTravelMinutes,
  GeocodedLocation,
  UserCoordinates,
  PatientLocation,
  DoctorLocation,
  ProviderLocation,
  GovernmentLocation,
  DEFAULT_DOCTOR_LOCATION,
  DEFAULT_PROVIDER_LOCATION,
  DEFAULT_GOVERNMENT_LOCATION,
  DEMO_LOCATION,
} from "@/lib/services/locationService";
import {
  getNearbyFacilities,
  NearbySearchResult,
} from "@/lib/services/facilityService";
import { Facility } from "@/data/facilities";
import { UserRole } from "@/lib/auth/types";

export type LocationSource = "CURRENT_GPS" | "MANUAL" | "CACHED" | "DEMO";
export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";

export interface RoleLocationSummary {
  role: UserRole;
  primaryLabel: string;
  secondaryLabel: string;
  badgeLabel: string;
  lat: number;
  lng: number;
  sourceType: "GPS" | "REGISTERED_FACILITY" | "ADMINISTRATIVE_REGION";
  canChangeLocation: boolean;
}

export interface LocationContextValue {
  // ── 1. PATIENT LOCATION (GPS / User Selected) ──
  lat: number;
  lng: number;
  locality: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  displayName: string;
  source: LocationSource;
  status: LocationStatus;
  error: string | null;
  isRefreshing: boolean;
  isOffline: boolean;
  lastUpdated: string;
  patientLocation: PatientLocation;

  // Nearby Healthcare Network for Patient
  nearbyFacilities: Facility[];
  searchRadiusKm: number;
  isExpandedRadius: boolean;
  totalInRadius: number;

  // Patient Actions
  refreshGPS: (isUserTriggered?: boolean) => Promise<void>;
  setManualLocation: (query: string) => Promise<void>;
  clearManualLocation: () => Promise<void>;

  // ── 2. DOCTOR REGISTERED FACILITY LOCATION ──
  doctorLocation: DoctorLocation;
  setDoctorRegisteredFacility: (facilityId: string) => void;

  // ── 3. PROVIDER REGISTERED BUSINESS LOCATION ──
  providerLocation: ProviderLocation;
  setProviderRegisteredFacility: (facilityId: string) => void;

  // ── 4. GOVERNMENT ADMINISTRATIVE REGION ──
  governmentLocation: GovernmentLocation;
  setGovernmentState: (state: string) => void;
  setGovernmentDistrict: (district: string) => void;
  setGovernmentBlock: (block: string) => void;
  setGovernmentFacility: (facilityId: string) => void;

  // ── 5. UNIFIED ROLE RESOLVER & GEOSPATIAL HELPERS ──
  getRoleLocationSummary: (role: UserRole) => RoleLocationSummary;
  getDistanceTo: (targetLat: number, targetLng: number) => { distanceKm: number; travelMinutes: number };
  getDirectionsUrl: (targetLat: number, targetLng: number, targetName?: string) => string;
  searchNearby: (
    needQuery?: string,
    specialty?: string,
    isEmergency?: boolean,
    facilityType?: "ALL" | "GOVERNMENT" | "PRIVATE",
    sortBy?: "nearest" | "best_match",
    customRadiusKm?: number
  ) => Promise<NearbySearchResult>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const DEFAULT_PATIENT_FALLBACK: GeocodedLocation = {
  lat: DEMO_LOCATION.latitude,
  lng: DEMO_LOCATION.longitude,
  displayName: DEMO_LOCATION.locality,
  locality: DEMO_LOCATION.locality,
  city: DEMO_LOCATION.city,
  district: DEMO_LOCATION.district,
  state: DEMO_LOCATION.state,
  pincode: DEMO_LOCATION.pincode,
  isManual: false,
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
  // ── 1. PATIENT STATE ──
  const [patientLoc, setPatientLoc] = useState<GeocodedLocation>(DEFAULT_PATIENT_FALLBACK);
  const [source, setSource] = useState<LocationSource>("DEMO");
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(10);
  const [isExpandedRadius, setIsExpandedRadius] = useState<boolean>(false);
  const [totalInRadius, setTotalInRadius] = useState<number>(0);

  // ── 2. DOCTOR STATE ──
  const [doctorLoc, setDoctorLoc] = useState<DoctorLocation>(DEFAULT_DOCTOR_LOCATION);

  // ── 3. PROVIDER STATE ──
  const [providerLoc, setProviderLoc] = useState<ProviderLocation>(DEFAULT_PROVIDER_LOCATION);

  // ── 4. GOVERNMENT STATE ──
  const [govLoc, setGovLoc] = useState<GovernmentLocation>(DEFAULT_GOVERNMENT_LOCATION);

  // Monitor online / offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Update nearby facilities whenever patient location changes
  const updateNearbyFacilities = useCallback(async (loc: GeocodedLocation) => {
    try {
      const result = await getNearbyFacilities({
        lat: loc.lat,
        lng: loc.lng,
        locality: loc.locality,
        initialRadiusKm: 10,
        facilityType: "ALL",
      });
      setNearbyFacilities(result.facilities);
      setSearchRadiusKm(result.searchRadiusKm);
      setIsExpandedRadius(result.isExpandedRadius);
      setTotalInRadius(result.totalInRadius);
    } catch (err) {
      console.error("Failed to update nearby facilities for location:", err);
    }
  }, []);

  // Refresh Patient GPS
  const refreshGPS = useCallback(
    async (isUserTriggered = false) => {
      if (typeof window === "undefined") return;

      setIsRefreshing(true);
      if (isUserTriggered) {
        setStatus("loading");
      }
      setError(null);

      try {
        const coords = await getCurrentLocation();
        const geocoded = await reverseGeocode(coords.lat, coords.lng);
        setPatientLoc(geocoded);
        setSource("CURRENT_GPS");
        setStatus("granted");
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        await updateNearbyFacilities(geocoded);
      } catch (err: any) {
        console.warn("GPS lookup fallback to DEMO_LOCATION:", err.message);
        setStatus("denied");
        setError(err.message || "Location access unavailable.");

        // Fallback to DEMO_LOCATION
        setSource("DEMO");
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        await updateNearbyFacilities(DEFAULT_PATIENT_FALLBACK);
      } finally {
        setIsRefreshing(false);
      }
    },
    [updateNearbyFacilities]
  );

  // Auto-request location on initial load
  useEffect(() => {
    refreshGPS(false);
  }, [refreshGPS]);

  // Set Manual Location for Patient
  const setManualLocation = useCallback(
    async (query: string) => {
      setIsRefreshing(true);
      setError(null);
      try {
        const geocoded = await geocodeManualLocation(query);
        setPatientLoc(geocoded);
        setSource("MANUAL");
        setStatus("granted");
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        await updateNearbyFacilities(geocoded);
      } catch (err: any) {
        setError(err?.message || "Location search failed.");
        throw err;
      } finally {
        setIsRefreshing(false);
      }
    },
    [updateNearbyFacilities]
  );

  // Clear manual location and revert to GPS
  const clearManualLocation = useCallback(async () => {
    await refreshGPS(true);
  }, [refreshGPS]);

  // Doctor Action
  const setDoctorRegisteredFacility = useCallback((facilityId: string) => {
    // In future: look up facility by ID
    setDoctorLoc((prev) => ({
      ...prev,
      registeredFacilityId: facilityId,
    }));
  }, []);

  // Provider Action
  const setProviderRegisteredFacility = useCallback((facilityId: string) => {
    setProviderLoc((prev) => ({
      ...prev,
      registeredFacilityId: facilityId,
    }));
  }, []);

  // Government Actions
  const setGovernmentState = useCallback((state: string) => {
    setGovLoc((prev) => ({ ...prev, state }));
  }, []);

  const setGovernmentDistrict = useCallback((district: string) => {
    setGovLoc((prev) => ({ ...prev, district }));
  }, []);

  const setGovernmentBlock = useCallback((block: string) => {
    setGovLoc((prev) => ({ ...prev, block }));
  }, []);

  const setGovernmentFacility = useCallback((facilityId: string) => {
    setGovLoc((prev) => ({ ...prev, facilityId }));
  }, []);

  // Calculate distance from patient's current location to target coordinates
  const getDistanceTo = useCallback(
    (targetLat: number, targetLng: number) => {
      const dist = calculateDistance(patientLoc.lat, patientLoc.lng, targetLat, targetLng);
      const travel = calculateTravelMinutes(dist);
      return { distanceKm: dist, travelMinutes: travel };
    },
    [patientLoc]
  );

  // Generate Google Maps navigation URL from patient location to target
  const getDirectionsUrl = useCallback(
    (targetLat: number, targetLng: number, targetName?: string) => {
      const origin = `${patientLoc.lat},${patientLoc.lng}`;
      const destination = `${targetLat},${targetLng}`;
      const label = targetName ? ` (${encodeURIComponent(targetName)})` : "";
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${label}&travelmode=driving`;
    },
    [patientLoc]
  );

  // Dynamic search with clinical filter & distance sorting
  const searchNearby = useCallback(
    async (
      needQuery?: string,
      specialty?: string,
      isEmergency?: boolean,
      facilityType: "ALL" | "GOVERNMENT" | "PRIVATE" = "ALL",
      sortBy: "nearest" | "best_match" = "nearest",
      customRadiusKm?: number
    ) => {
      return getNearbyFacilities({
        lat: patientLoc.lat,
        lng: patientLoc.lng,
        locality: patientLoc.locality,
        needQuery,
        specialty,
        isEmergency,
        facilityType,
        sortBy,
        customRadiusKm,
      });
    },
    [patientLoc]
  );

  // ── UNIFIED ROLE RESOLVER ──
  const getRoleLocationSummary = useCallback(
    (role: UserRole): RoleLocationSummary => {
      switch (role) {
        case "doctor":
          return {
            role: "doctor",
            primaryLabel: doctorLoc.facilityName,
            secondaryLabel: `${doctorLoc.district}, ${doctorLoc.state} · ${doctorLoc.department}`,
            badgeLabel: `${doctorLoc.room} (${doctorLoc.counter})`,
            lat: doctorLoc.lat,
            lng: doctorLoc.lng,
            sourceType: "REGISTERED_FACILITY",
            canChangeLocation: false,
          };
        case "provider":
          return {
            role: "provider",
            primaryLabel: providerLoc.facilityName,
            secondaryLabel: `${providerLoc.district}, ${providerLoc.state} · Service Radius: ${providerLoc.serviceRadiusKm} km`,
            badgeLabel: "Registered Business Location",
            lat: providerLoc.lat,
            lng: providerLoc.lng,
            sourceType: "REGISTERED_FACILITY",
            canChangeLocation: false,
          };
        case "government":
          return {
            role: "government",
            primaryLabel: `${govLoc.state} State Health Command`,
            secondaryLabel: `District: ${govLoc.district} · Block: ${govLoc.block}`,
            badgeLabel: "Administrative Region",
            lat: 19.7515,
            lng: 75.7139,
            sourceType: "ADMINISTRATIVE_REGION",
            canChangeLocation: true,
          };
        case "patient":
        default:
          return {
            role: "patient",
            primaryLabel: patientLoc.locality,
            secondaryLabel: patientLoc.displayName,
            badgeLabel:
              source === "CURRENT_GPS"
                ? "GPS Detected"
                : source === "MANUAL"
                ? "Manually Selected"
                : "Demo Location",
            lat: patientLoc.lat,
            lng: patientLoc.lng,
            sourceType: "GPS",
            canChangeLocation: true,
          };
      }
    },
    [doctorLoc, providerLoc, govLoc, patientLoc, source]
  );

  const patientLocationData: PatientLocation = useMemo(
    () => ({
      lat: patientLoc.lat,
      lng: patientLoc.lng,
      locality: patientLoc.locality,
      city: patientLoc.city,
      district: patientLoc.district,
      state: patientLoc.state,
      pincode: patientLoc.pincode,
      displayName: patientLoc.displayName,
      source,
      status,
      lastUpdated,
    }),
    [patientLoc, source, status, lastUpdated]
  );

  const value: LocationContextValue = useMemo(
    () => ({
      lat: patientLoc.lat,
      lng: patientLoc.lng,
      locality: patientLoc.locality,
      city: patientLoc.city,
      district: patientLoc.district,
      state: patientLoc.state,
      pincode: patientLoc.pincode,
      displayName: patientLoc.displayName,
      source,
      status,
      error,
      isRefreshing,
      isOffline,
      lastUpdated,
      patientLocation: patientLocationData,

      nearbyFacilities,
      searchRadiusKm,
      isExpandedRadius,
      totalInRadius,

      refreshGPS,
      setManualLocation,
      clearManualLocation,

      doctorLocation: doctorLoc,
      setDoctorRegisteredFacility,

      providerLocation: providerLoc,
      setProviderRegisteredFacility,

      governmentLocation: govLoc,
      setGovernmentState,
      setGovernmentDistrict,
      setGovernmentBlock,
      setGovernmentFacility,

      getRoleLocationSummary,
      getDistanceTo,
      getDirectionsUrl,
      searchNearby,
    }),
    [
      patientLoc,
      source,
      status,
      error,
      isRefreshing,
      isOffline,
      lastUpdated,
      patientLocationData,
      nearbyFacilities,
      searchRadiusKm,
      isExpandedRadius,
      totalInRadius,
      refreshGPS,
      setManualLocation,
      clearManualLocation,
      doctorLoc,
      setDoctorRegisteredFacility,
      providerLoc,
      setProviderRegisteredFacility,
      govLoc,
      setGovernmentState,
      setGovernmentDistrict,
      setGovernmentBlock,
      setGovernmentFacility,
      getRoleLocationSummary,
      getDistanceTo,
      getDirectionsUrl,
      searchNearby,
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

export const useLocationContext = useLocation;
