"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  getCurrentLocation,
  reverseGeocode,
  geocodeManualLocation,
  checkLocationPermission,
  calculateDistance,
  calculateTravelMinutes,
  GeocodedLocation,
  UserCoordinates,
} from "@/lib/services/locationService";
import {
  getNearbyFacilities,
  NearbySearchResult,
} from "@/lib/services/facilityService";
import { Facility } from "@/data/facilities";

export type LocationSource = "CURRENT_GPS" | "MANUAL" | "CACHED";
export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";

export interface LocationContextValue {
  // Coordinates & Address
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

  // Nearby Healthcare Network
  nearbyFacilities: Facility[];
  searchRadiusKm: number;
  isExpandedRadius: boolean;
  totalInRadius: number;

  // Actions
  refreshGPS: (isUserTriggered?: boolean) => Promise<void>;
  setManualLocation: (query: string) => Promise<void>;
  clearManualLocation: () => Promise<void>;
  getDistanceTo: (targetLat: number, targetLng: number) => { distanceKm: number; travelMinutes: number };
  getDirectionsUrl: (targetLat: number, targetLng: number, targetName?: string) => string;
  searchNearby: (needQuery?: string, specialty?: string, isEmergency?: boolean) => Promise<NearbySearchResult>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const DEFAULT_FALLBACK_LOCATION: GeocodedLocation = {
  lat: 21.3734,
  lng: 74.2404,
  displayName: "Nandurbar, Maharashtra",
  locality: "Nandurbar, Maharashtra",
  city: "Nandurbar",
  district: "Nandurbar",
  state: "Maharashtra",
  pincode: "425412",
  isManual: false,
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<GeocodedLocation>(DEFAULT_FALLBACK_LOCATION);
  const [source, setSource] = useState<LocationSource>("CACHED");
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(10);
  const [isExpandedRadius, setIsExpandedRadius] = useState<boolean>(false);
  const [totalInRadius, setTotalInRadius] = useState<number>(0);

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

  // Update nearby facilities whenever location changes
  const updateNearbyFacilities = useCallback(async (loc: GeocodedLocation) => {
    try {
      const res = await getNearbyFacilities({
        lat: loc.lat,
        lng: loc.lng,
        locality: loc.locality,
      });
      setNearbyFacilities(res.facilities);
      setSearchRadiusKm(res.searchRadiusKm);
      setIsExpandedRadius(res.isExpandedRadius);
      setTotalInRadius(res.totalInRadius);
    } catch (err) {
      console.warn("Failed to load nearby facilities:", err);
    }
  }, []);

  // Refresh GPS location
  const refreshGPS = useCallback(async (isUserTriggered = false) => {
    if (isUserTriggered) {
      setIsRefreshing(true);
    } else {
      setStatus("loading");
    }
    setError(null);

    try {
      const coords = await getCurrentLocation();
      const geocoded = await reverseGeocode(coords.lat, coords.lng);
      setCurrentLocation(geocoded);
      setSource("CURRENT_GPS");
      setStatus("granted");
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      await updateNearbyFacilities(geocoded);
    } catch (err: any) {
      console.warn("Location error:", err);
      setStatus("error");
      setError(err?.message || "Unable to retrieve device GPS location.");
      // Keep cached location active
    } finally {
      setIsRefreshing(false);
    }
  }, [updateNearbyFacilities]);

  // Initial load: request location or check permissions
  useEffect(() => {
    const init = async () => {
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      const perm = await checkLocationPermission();
      if (perm === "granted") {
        refreshGPS(false);
      } else {
        // Attempt initial request gracefully
        refreshGPS(false);
      }
    };
    init();
  }, [refreshGPS]);

  // Set manual location
  const setManualLocation = useCallback(async (query: string) => {
    setIsRefreshing(true);
    setError(null);
    try {
      const geocoded = await geocodeManualLocation(query);
      setCurrentLocation(geocoded);
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
  }, [updateNearbyFacilities]);

  // Clear manual location and revert to GPS
  const clearManualLocation = useCallback(async () => {
    await refreshGPS(true);
  }, [refreshGPS]);

  // Calculate distance from patient's current location to target coordinates
  const getDistanceTo = useCallback((targetLat: number, targetLng: number) => {
    const dist = calculateDistance(currentLocation.lat, currentLocation.lng, targetLat, targetLng);
    const travel = calculateTravelMinutes(dist);
    return { distanceKm: dist, travelMinutes: travel };
  }, [currentLocation]);

  // Generate Google Maps navigation URL from patient location to target
  const getDirectionsUrl = useCallback((targetLat: number, targetLng: number, targetName?: string) => {
    const origin = `${currentLocation.lat},${currentLocation.lng}`;
    const destination = `${targetLat},${targetLng}`;
    const label = targetName ? ` (${encodeURIComponent(targetName)})` : "";
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${label}&travelmode=driving`;
  }, [currentLocation]);

  // Dynamic search with clinical filter
  const searchNearby = useCallback(async (needQuery?: string, specialty?: string, isEmergency?: boolean) => {
    return getNearbyFacilities({
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      locality: currentLocation.locality,
      needQuery,
      specialty,
      isEmergency,
    });
  }, [currentLocation]);

  const value: LocationContextValue = useMemo(() => ({
    lat: currentLocation.lat,
    lng: currentLocation.lng,
    locality: currentLocation.locality,
    city: currentLocation.city,
    district: currentLocation.district,
    state: currentLocation.state,
    pincode: currentLocation.pincode,
    displayName: currentLocation.displayName,
    source,
    status,
    error,
    isRefreshing,
    isOffline,
    lastUpdated,
    nearbyFacilities,
    searchRadiusKm,
    isExpandedRadius,
    totalInRadius,
    refreshGPS,
    setManualLocation,
    clearManualLocation,
    getDistanceTo,
    getDirectionsUrl,
    searchNearby,
  }), [
    currentLocation,
    source,
    status,
    error,
    isRefreshing,
    isOffline,
    lastUpdated,
    nearbyFacilities,
    searchRadiusKm,
    isExpandedRadius,
    totalInRadius,
    refreshGPS,
    setManualLocation,
    clearManualLocation,
    getDistanceTo,
    getDirectionsUrl,
    searchNearby,
  ]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}
