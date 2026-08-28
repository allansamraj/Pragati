// ─── PRAGATI GLOBAL LOCATION SERVICE ─────────────────────────────────────────
// Multi-role geospatial location retrieval, registered facility resolution,
// administrative hierarchies, real device GPS, reverse geocoding, and Haversine distance engine.

import { DEMO_FACILITIES, Facility } from "@/data/facilities";

// ── 0. CENTRAL DEMO ENVIRONMENT CONFIGURATION ──
export interface DemoLocationConfig {
  state: string;
  district: string;
  city: string;
  locality: string;
  latitude: number;
  longitude: number;
  pincode: string;
}

export const DEMO_LOCATION: DemoLocationConfig = {
  state: "Tamil Nadu",
  district: "Chennai",
  city: "Chennai",
  locality: "Chennai, Tamil Nadu",
  latitude: 13.0827,
  longitude: 80.2707,
  pincode: "600001",
};

export interface UserCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  isManual?: boolean;
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
  locality: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  isManual?: boolean;
}

// ── 1. PATIENT LOCATION SCHEMA ──
export interface PatientLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  locality: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  displayName: string;
  source: "CURRENT_GPS" | "MANUAL" | "CACHED" | "DEMO";
  status: "idle" | "loading" | "granted" | "denied" | "error";
  lastUpdated: string;
}

// ── 2. DOCTOR REGISTERED FACILITY LOCATION SCHEMA ──
export interface DoctorLocation {
  doctorId: string;
  doctorName: string;
  registeredFacilityId: string;
  facilityName: string;
  facilityType: string;
  department: string;
  room: string;
  counter: string;
  address: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  currentPersonalLocation?: UserCoordinates;
}

// ── 3. PHARMACY / PROVIDER REGISTERED FACILITY LOCATION SCHEMA ──
export interface ProviderLocation {
  providerId: string;
  providerName: string;
  registeredFacilityId: string;
  facilityName: string;
  facilityType: "PHARMACY" | "DIAGNOSTIC_CENTER" | "CLINIC" | "HOSPITAL";
  department: string;
  address: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  serviceRadiusKm: number;
}

// ── 4. GOVERNMENT ADMINISTRATIVE LOCATION CONTEXT SCHEMA ──
export interface GovernmentLocation {
  state: string;
  district: string;
  block: string;
  facilityId: string;
  availableStates: string[];
  availableDistricts: string[];
  availableBlocks: string[];
}

const REVERSE_CACHE_KEY_PREFIX = "pragati_geocode_v2_";
const LAST_LOCATION_CACHE_KEY = "pragati_last_user_location";

// ─── DEFAULT REGISTERED CONTEXTS ──────────────────────────────────────────────

export const DEFAULT_DOCTOR_LOCATION: DoctorLocation = {
  doctorId: "demo-doc-001",
  doctorName: "Dr. Ananya Natarajan",
  registeredFacilityId: "fac-chn-001",
  facilityName: "Government General Hospital, Chennai",
  facilityType: "Government Multi-Specialty General Hospital",
  department: "Cardiology",
  room: "Cardiology OPD (Room 204)",
  counter: "Counter 3",
  address: "EVR Periyar Salai, Park Town, Near Chennai Central",
  district: "Chennai",
  state: "Tamil Nadu",
  lat: 13.0805,
  lng: 80.2778,
};

export const DEFAULT_PROVIDER_LOCATION: ProviderLocation = {
  providerId: "demo-provider-001",
  providerName: "Chennai Central Pharmacy & Diagnostics",
  registeredFacilityId: "fac-chn-008",
  facilityName: "Chennai Central Pharmacy & Diagnostics",
  facilityType: "PHARMACY",
  department: "Central Dispensing & Labs",
  address: "Central Healthcare Corridor, EVR Salai, Chennai",
  district: "Chennai",
  state: "Tamil Nadu",
  lat: 13.0820,
  lng: 80.2750,
  serviceRadiusKm: 15,
};

export const DEFAULT_GOVERNMENT_LOCATION: GovernmentLocation = {
  state: "Tamil Nadu",
  district: "Chennai",
  block: "All Zones",
  facilityId: "ALL",
  availableStates: ["Tamil Nadu", "Maharashtra", "Karnataka", "Delhi NCR", "Gujarat"],
  availableDistricts: [
    "Chennai",
    "Kanchipuram",
    "Chengalpattu",
    "Thiruvallur",
    "Coimbatore",
    "Madurai",
    "Salem",
    "Tiruchirappalli",
    "Nandurbar",
    "Pune",
    "Mumbai City",
  ],
  availableBlocks: [
    "All Zones",
    "Park Town / Central",
    "Teynampet",
    "Anna Nagar",
    "Adyar",
    "Royapuram",
    "Thiru-Vi-Ka Nagar",
    "Kodambakkam",
  ],
};

/**
 * Calculates Great-Circle distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers (rounded to 1 decimal place).
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Formats distance in a human-friendly way:
 * < 1 km when below 1 km, otherwise X.X km
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm)) return "Nearby";
  if (distanceKm < 1.0) {
    if (distanceKm <= 0.2) return "< 300 m";
    if (distanceKm <= 0.5) return "< 600 m";
    return "< 1 km";
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates driving / travel time in minutes based on distance.
 */
export function calculateTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 1) return Math.max(3, Math.round(distanceKm * 4));
  if (distanceKm <= 5) return Math.round(distanceKm * 2.5);
  if (distanceKm <= 20) return Math.round(distanceKm * 2.0);
  return Math.round(distanceKm * 1.6);
}

/**
 * Requests and retrieves the user genuine GPS position via browser / Capacitor Geolocation API.
 * Never invents or hardcodes coordinates when GPS is granted.
 */
export async function getCurrentLocation(): Promise<UserCoordinates> {
  // Check for Capacitor native geolocation if running inside an Android/iOS wrapper
  if (typeof window !== "undefined" && (window as any).Capacitor?.Plugins?.Geolocation) {
    try {
      const pos = await (window as any).Capacitor.Plugins.Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      if (pos?.coords) {
        const coords: UserCoordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isManual: false,
        };
        try {
          sessionStorage.setItem(LAST_LOCATION_CACHE_KEY, JSON.stringify(coords));
        } catch {}
        return coords;
      }
    } catch (capErr) {
      console.warn("Capacitor Geolocation error, falling back to navigator.geolocation:", capErr);
    }
  }

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser/device."));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // 30 sec cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: UserCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isManual: false,
        };

        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_LOCATION_CACHE_KEY, JSON.stringify(coords));
          }
        } catch {}

        resolve(coords);
      },
      (error) => {
        let msg = "Unable to determine your current location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission was denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "GPS position is currently unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Please try again.";
        }
        reject(new Error(msg));
      },
      options
    );
  });
}

/**
 * Checks permission status if Permissions API is supported.
 */
export async function checkLocationPermission(): Promise<"granted" | "prompt" | "denied"> {
  if (typeof window === "undefined" || !navigator.permissions) {
    return "prompt";
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state as any;
  } catch {
    return "prompt";
  }
}

/**
 * Reverse geocodes genuine coordinates (lat, lng) to an accurate locality and city name.
 * Uses Nominatim reverse geocode API with caching and fallback.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  const cacheKey = `${REVERSE_CACHE_KEY_PREFIX}${lat.toFixed(4)}_${lng.toFixed(4)}`;

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
  }

  // Query OpenStreetMap Nominatim reverse geocoder
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Pragati-Healthcare-Platform/1.0",
        },
        signal: controller ? controller.signal : undefined,
      }
    );

    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        addr.city ||
        "";
      const city = addr.city || addr.town || addr.county || addr.district || "";
      const district = addr.county || addr.state_district || city;
      const state = addr.state || "";
      const pincode = addr.postcode || "";

      let displayName = "";
      if (locality && city && locality !== city) {
        displayName = `${locality}, ${city}`;
      } else if (locality && state) {
        displayName = `${locality}, ${state}`;
      } else if (city && state) {
        displayName = `${city}, ${state}`;
      } else {
        displayName = data.display_name?.split(",").slice(0, 2).join(", ") || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
      }

      const result: GeocodedLocation = {
        lat,
        lng,
        displayName: displayName.trim(),
        locality: displayName.trim(),
        city,
        district,
        state,
        pincode,
        isManual: false,
      };

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        }
      } catch {}

      return result;
    }
  } catch {
    // Network or timeout failed
  }

  // Fallback to exact coordinate string representation
  return {
    lat,
    lng,
    displayName: `GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
    locality: `GPS (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
    city: "",
    district: "",
    state: "",
    pincode: "",
    isManual: false,
  };
}

/**
 * Geocodes a freeform search query (e.g. "Chennai", "Coimbatore", "Mumbai", "Nandurbar", "600001") to coordinates.
 */
export async function geocodeManualLocation(query: string): Promise<GeocodedLocation> {
  const q = query.trim().toLowerCase();

  const presets: Record<string, GeocodedLocation> = {
    "chennai": {
      lat: 13.0827,
      lng: 80.2707,
      displayName: "Chennai, Tamil Nadu",
      locality: "Chennai, Tamil Nadu",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      isManual: true,
    },
    "park town": {
      lat: 13.0805,
      lng: 80.2778,
      displayName: "Park Town, Chennai",
      locality: "Park Town, Chennai",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600003",
      isManual: true,
    },
    "triplicane": {
      lat: 13.0588,
      lng: 80.2760,
      displayName: "Triplicane, Chennai",
      locality: "Triplicane, Chennai",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600005",
      isManual: true,
    },
    "adyar": {
      lat: 13.0067,
      lng: 80.2570,
      displayName: "Adyar, Chennai",
      locality: "Adyar, Chennai",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600020",
      isManual: true,
    },
    "coimbatore": {
      lat: 11.0168,
      lng: 76.9558,
      displayName: "Coimbatore, Tamil Nadu",
      locality: "Coimbatore, Tamil Nadu",
      city: "Coimbatore",
      district: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641001",
      isManual: true,
    },
    "madurai": {
      lat: 9.9252,
      lng: 78.1198,
      displayName: "Madurai, Tamil Nadu",
      locality: "Madurai, Tamil Nadu",
      city: "Madurai",
      district: "Madurai",
      state: "Tamil Nadu",
      pincode: "625001",
      isManual: true,
    },
    "mumbai": {
      lat: 19.0760,
      lng: 72.8777,
      displayName: "Mumbai, Maharashtra",
      locality: "Mumbai, Maharashtra",
      city: "Mumbai",
      district: "Mumbai City",
      state: "Maharashtra",
      pincode: "400001",
      isManual: true,
    },
    "pune": {
      lat: 18.5204,
      lng: 73.8567,
      displayName: "Pune, Maharashtra",
      locality: "Pune, Maharashtra",
      city: "Pune",
      district: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      isManual: true,
    },
    "nandurbar": {
      lat: 21.3734,
      lng: 74.2404,
      displayName: "Nandurbar, Maharashtra",
      locality: "Nandurbar, Maharashtra",
      city: "Nandurbar",
      district: "Nandurbar",
      state: "Maharashtra",
      pincode: "425412",
      isManual: true,
    },
  };

  for (const [key, val] of Object.entries(presets)) {
    if (q.includes(key)) return val;
  }

  // Live Nominatim Search
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Pragati-Healthcare-Platform/1.0",
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const addr = item.address || {};
        const locality = addr.suburb || addr.neighbourhood || addr.city || addr.town || item.name;
        const city = addr.city || addr.town || addr.county || "";
        const state = addr.state || "";

        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: [locality, city, state].filter(Boolean).slice(0, 2).join(", ") || item.display_name,
          locality: [locality, city].filter(Boolean).join(", ") || item.display_name,
          city,
          district: addr.county || addr.state_district || city,
          state,
          pincode: addr.postcode || "",
          isManual: true,
        };
      }
    }
  } catch {}

  throw new Error(`Location "${query}" could not be resolved. Please enter a valid city or district.`);
}
