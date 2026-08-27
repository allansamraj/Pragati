// ─── PRAGATI GLOBAL LOCATION SERVICE ─────────────────────────────────────────
// Multi-role geospatial location retrieval, registered facility resolution,
// administrative hierarchies, reverse geocoding, and Haversine distance engine.

import { DEMO_FACILITIES, Facility } from "@/data/facilities";

// ── 0. CENTRAL DEMO ENVIRONMENT CONFIGURATION ──
// Switch this configuration object to change prototype deployment regions
// (e.g. Tamil Nadu / Chennai -> Maharashtra / Nandurbar) without rewriting frontend code.
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

const REVERSE_CACHE_KEY_PREFIX = "pragati_geocode_";
const LAST_LOCATION_CACHE_KEY = "pragati_last_user_location";

// ─── DEFAULT REGISTERED CONTEXTS (CHENNAI DEMO CONFIGURATION) ────────────────

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
  const R = 6371; // Earth's mean radius in km
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
 * Estimates driving / travel time in minutes based on distance.
 * Assumes average road conditions (approx. 2.0 - 2.5 min per km).
 */
export function calculateTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 1) return Math.max(3, Math.round(distanceKm * 4));
  if (distanceKm <= 5) return Math.round(distanceKm * 2.5);
  if (distanceKm <= 20) return Math.round(distanceKm * 2.0);
  return Math.round(distanceKm * 1.6);
}

/**
 * Requests and retrieves the user's current GPS position via browser native Geolocation.
 */
export async function getCurrentLocation(): Promise<UserCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser/device."));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000, // 1 minute cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: UserCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isManual: false,
        };

        // Cache last known good GPS
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_LOCATION_CACHE_KEY, JSON.stringify(coords));
          }
        } catch {
          // ignore storage error
        }

        resolve(coords);
      },
      (error) => {
        let msg = "Unable to determine your current location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission was denied.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is currently unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      options
    );
  });
}

/**
 * Requests permission explicitly if Permissions API is supported.
 */
export async function checkLocationPermission(): Promise<"granted" | "prompt" | "denied"> {
  if (typeof window === "undefined" || !navigator.permissions) {
    return "prompt";
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "prompt";
  }
}

/**
 * Reverse geocodes coordinates (lat, lng) to a clean, human-readable locality name.
 * Uses client-side reverse geocoding with localStorage caching + fallback heuristic.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  const cacheKey = `${REVERSE_CACHE_KEY_PREFIX}${lat.toFixed(3)}_${lng.toFixed(3)}`;

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
  }

  // Known location heuristics (Chennai, Uthandi, Nandurbar, Mumbai, Pune, etc.)
  const knownLocations = [
    {
      name: "Chennai, Tamil Nadu",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      lat: 13.0827,
      lng: 80.2707,
    },
    {
      name: "Uthandi, Chennai",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600119",
      lat: 12.8681,
      lng: 80.2454,
    },
    {
      name: "Perungudi, Chennai",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600096",
      lat: 12.9654,
      lng: 80.2461,
    },
    {
      name: "Nandurbar, Maharashtra",
      city: "Nandurbar",
      district: "Nandurbar",
      state: "Maharashtra",
      pincode: "425412",
      lat: 21.3734,
      lng: 74.2404,
    },
    {
      name: "Navapur, Nandurbar",
      city: "Navapur",
      district: "Nandurbar",
      state: "Maharashtra",
      pincode: "425418",
      lat: 21.1685,
      lng: 73.7915,
    },
    {
      name: "Dhadgaon, Nandurbar",
      city: "Dhadgaon",
      district: "Nandurbar",
      state: "Maharashtra",
      pincode: "425414",
      lat: 21.8285,
      lng: 74.2235,
    },
    {
      name: "Bandra, Mumbai",
      city: "Mumbai",
      district: "Mumbai Suburban",
      state: "Maharashtra",
      pincode: "400050",
      lat: 19.0596,
      lng: 72.8295,
    },
    {
      name: "Shivaji Nagar, Pune",
      city: "Pune",
      district: "Pune",
      state: "Maharashtra",
      pincode: "411005",
      lat: 18.5314,
      lng: 73.8446,
    },
  ];

  for (const loc of knownLocations) {
    const dist = calculateDistance(lat, lng, loc.lat, loc.lng);
    if (dist < 15) {
      const result: GeocodedLocation = {
        lat,
        lng,
        displayName: loc.name,
        locality: loc.name,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        isManual: false,
      };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        }
      } catch {
        // ignore
      }
      return result;
    }
  }

  // Fallback via OpenStreetMap Nominatim reverse geocode if network permits
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: { "Accept-Language": "en" },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.village ||
        addr.town ||
        addr.city ||
        "Local Area";
      const city = addr.city || addr.town || addr.county || addr.district || "";
      const state = addr.state || "";
      const pincode = addr.postcode || "";
      const district = addr.county || addr.state_district || city;

      const displayName = [locality, city, state].filter(Boolean).slice(0, 2).join(", ");

      const result: GeocodedLocation = {
        lat,
        lng,
        displayName: displayName || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        locality: displayName || "Near You",
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
      } catch {
        // ignore
      }
      return result;
    }
  } catch {
    // Network failed or blocked
  }

  // Final heuristic fallback based on DEMO_LOCATION
  return {
    lat,
    lng,
    displayName: DEMO_LOCATION.locality,
    locality: DEMO_LOCATION.locality,
    city: DEMO_LOCATION.city,
    district: DEMO_LOCATION.district,
    state: DEMO_LOCATION.state,
    pincode: DEMO_LOCATION.pincode,
    isManual: false,
  };
}

/**
 * Geocodes a freeform search query (e.g. "Chennai", "Uthandi", "Nandurbar", "Mumbai", "600001") to coordinates.
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
    "uthandi": {
      lat: 12.8681,
      lng: 80.2454,
      displayName: "Uthandi, Chennai",
      locality: "Uthandi, Chennai",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "600119",
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
    "navapur": {
      lat: 21.1685,
      lng: 73.7915,
      displayName: "Navapur, Nandurbar",
      locality: "Navapur, Nandurbar",
      city: "Navapur",
      district: "Nandurbar",
      state: "Maharashtra",
      pincode: "425418",
      isManual: true,
    },
    "dhadgaon": {
      lat: 21.8285,
      lng: 74.2235,
      displayName: "Dhadgaon, Nandurbar",
      locality: "Dhadgaon, Nandurbar",
      city: "Dhadgaon",
      district: "Nandurbar",
      state: "Maharashtra",
      pincode: "425414",
      isManual: true,
    },
    "mumbai": {
      lat: 19.076,
      lng: 72.8777,
      displayName: "Mumbai, Maharashtra",
      locality: "Mumbai, Maharashtra",
      city: "Mumbai",
      district: "Mumbai",
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
  };

  for (const [key, val] of Object.entries(presets)) {
    if (q.includes(key)) {
      return val;
    }
  }

  // Fallback via Nominatim Search API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ", India"
      )}&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const list = await res.json();
      if (list && list.length > 0) {
        const item = list[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        return {
          lat,
          lng,
          displayName: item.display_name.split(",").slice(0, 2).join(", "),
          locality: item.display_name.split(",")[0] || query,
          isManual: true,
        };
      }
    }
  } catch {
    // ignore
  }

  // Default fallback to DEMO_LOCATION
  return {
    lat: DEMO_LOCATION.latitude,
    lng: DEMO_LOCATION.longitude,
    displayName: `${query}`,
    locality: query,
    state: DEMO_LOCATION.state,
    isManual: true,
  };
}

/**
 * Returns physical facility location details by ID.
 */
export function getFacilityLocation(facilityId: string): {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
} | null {
  const fac = DEMO_FACILITIES.find((f) => f.id === facilityId);
  if (!fac) return null;
  return {
    id: fac.id,
    name: fac.name,
    address: fac.address,
    district: fac.district,
    state: fac.state,
    lat: fac.lat,
    lng: fac.lng,
  };
}

/**
 * Returns the registered work location for a doctor.
 */
export function getDoctorRegisteredLocation(doctorId?: string): DoctorLocation {
  return DEFAULT_DOCTOR_LOCATION;
}

/**
 * Returns the registered business location for a pharmacy / provider.
 */
export function getProviderRegisteredLocation(providerId?: string): ProviderLocation {
  return DEFAULT_PROVIDER_LOCATION;
}

/**
 * Returns the administrative location hierarchy for government users.
 */
export function getGovernmentLocationContext(): GovernmentLocation {
  return DEFAULT_GOVERNMENT_LOCATION;
}
