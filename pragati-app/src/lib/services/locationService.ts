// ─── PRAGATI LOCATION SERVICE ───────────────────────────────────────────────
// Geospatial location retrieval, native permissions, reverse geocoding, and Haversine distance.

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

const REVERSE_CACHE_KEY_PREFIX = "pragati_geocode_";
const LAST_LOCATION_CACHE_KEY = "pragati_last_user_location";

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
      timeout: 10000,
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
          msg = "GPS signal is currently unavailable.";
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
 * Checks existing location permission state if Supported.
 */
export async function checkLocationPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (typeof window === "undefined" || !navigator.permissions) {
    return "prompt";
  }
  try {
    const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return result.state;
  } catch {
    return "prompt";
  }
}

/**
 * Reverse geocodes coordinates to a human-readable locality name.
 * Uses OpenStreetMap Nominatim with local caching and offline fallback.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `${REVERSE_CACHE_KEY_PREFIX}${roundedLat}_${roundedLng}`;

  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
  }

  // Attempt live reverse geocoding via OpenStreetMap Nominatim API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
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
        addr.city_district ||
        addr.city ||
        addr.county ||
        "Detected Area";
      const city = addr.city || addr.town || addr.county || addr.state_district || "";
      const district = addr.state_district || addr.county || "";
      const state = addr.state || "";
      const pincode = addr.postcode || "";

      const fullDisplay = [locality, city, state].filter(Boolean).join(", ");

      const result: GeocodedLocation = {
        lat,
        lng,
        displayName: fullDisplay || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        locality: locality && city && locality !== city ? `${locality}, ${city}` : locality || city || "Near You",
        city,
        district,
        state,
        pincode,
        isManual: false,
      };

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {
          // ignore
        }
      }

      return result;
    }
  } catch (err) {
    // Network offline or failed -> fallback
  }

  // Fallback estimation based on prominent coordinates
  return deriveFallbackLocality(lat, lng);
}

/**
 * Geocodes a manual text query (locality, PIN code, or city).
 */
export async function geocodeManualLocation(query: string): Promise<GeocodedLocation> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Please enter a location or PIN code.");
  }

  // Check common demo locations first for instant response
  const knownLocations: Record<string, GeocodedLocation> = {
    perungudi: { lat: 12.9654, lng: 80.2461, displayName: "Perungudi, Chennai, Tamil Nadu", locality: "Perungudi, Chennai", city: "Chennai", district: "Chennai", state: "Tamil Nadu", pincode: "600096", isManual: true },
    chennai: { lat: 13.0827, lng: 80.2785, displayName: "Chennai Central, Tamil Nadu", locality: "Chennai", city: "Chennai", state: "Tamil Nadu", pincode: "600003", isManual: true },
    nandurbar: { lat: 21.3734, lng: 74.2404, displayName: "Nandurbar, Maharashtra", locality: "Nandurbar City", city: "Nandurbar", state: "Maharashtra", pincode: "425412", isManual: true },
    navapur: { lat: 21.1685, lng: 73.7915, displayName: "Navapur, Nandurbar, Maharashtra", locality: "Navapur", city: "Navapur", state: "Maharashtra", pincode: "425418", isManual: true },
    dhadgaon: { lat: 21.6500, lng: 74.2215, displayName: "Dhadgaon, Nandurbar, Maharashtra", locality: "Dhadgaon", city: "Nandurbar", state: "Maharashtra", pincode: "425414", isManual: true },
    mumbai: { lat: 19.0760, lng: 72.8777, displayName: "Mumbai, Maharashtra", locality: "Mumbai", city: "Mumbai", state: "Maharashtra", pincode: "400001", isManual: true },
    pune: { lat: 18.5204, lng: 73.8567, displayName: "Pune, Maharashtra", locality: "Pune", city: "Pune", state: "Maharashtra", pincode: "411001", isManual: true },
    bengaluru: { lat: 12.9716, lng: 77.5946, displayName: "Bengaluru, Karnataka", locality: "Bengaluru", city: "Bengaluru", state: "Karnataka", pincode: "560001", isManual: true },
    bangalore: { lat: 12.9716, lng: 77.5946, displayName: "Bengaluru, Karnataka", locality: "Bengaluru", city: "Bengaluru", state: "Karnataka", pincode: "560001", isManual: true },
    delhi: { lat: 28.6139, lng: 77.2090, displayName: "New Delhi, Delhi", locality: "New Delhi", city: "Delhi", state: "Delhi", pincode: "110001", isManual: true },
    "600096": { lat: 12.9654, lng: 80.2461, displayName: "Perungudi PIN 600096, Chennai", locality: "Perungudi, Chennai", city: "Chennai", state: "Tamil Nadu", pincode: "600096", isManual: true },
    "425412": { lat: 21.3734, lng: 74.2404, displayName: "Nandurbar PIN 425412, Maharashtra", locality: "Nandurbar", city: "Nandurbar", state: "Maharashtra", pincode: "425412", isManual: true },
  };

  const lower = trimmed.toLowerCase();
  for (const [key, loc] of Object.entries(knownLocations)) {
    if (lower.includes(key) || key.includes(lower)) {
      return loc;
    }
  }

  // Attempt Nominatim Search
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ", India")}&limit=1&addressdetails=1`,
      {
        headers: { "Accept-Language": "en" },
      }
    );

    if (res.ok) {
      const results = await res.json();
      if (results && results.length > 0) {
        const item = results[0];
        const addr = item.address || {};
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.town ||
          addr.city ||
          trimmed;

        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name,
          locality: locality,
          city: addr.city || addr.town || "",
          district: addr.state_district || addr.county || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
          isManual: true,
        };
      }
    }
  } catch {
    // ignore
  }

  throw new Error(`Could not find coordinates for "${trimmed}". Please try entering a PIN code or nearby city name.`);
}

/**
 * Offline fallback locality derivation from rough coordinate clusters.
 */
function deriveFallbackLocality(lat: number, lng: number): GeocodedLocation {
  if (lat > 12.5 && lat < 13.5 && lng > 79.8 && lng < 80.5) {
    return { lat, lng, displayName: "Chennai Region, Tamil Nadu", locality: "Chennai Metro Area", city: "Chennai", state: "Tamil Nadu", isManual: false };
  }
  if (lat > 21.0 && lat < 22.0 && lng > 73.5 && lng < 75.0) {
    return { lat, lng, displayName: "Nandurbar District, Maharashtra", locality: "Nandurbar District", city: "Nandurbar", state: "Maharashtra", isManual: false };
  }
  if (lat > 18.8 && lat < 19.4 && lng > 72.7 && lng < 73.2) {
    return { lat, lng, displayName: "Mumbai Region, Maharashtra", locality: "Mumbai Metropolitan", city: "Mumbai", state: "Maharashtra", isManual: false };
  }
  if (lat > 18.3 && lat < 18.8 && lng > 73.6 && lng < 74.1) {
    return { lat, lng, displayName: "Pune Region, Maharashtra", locality: "Pune Urban Area", city: "Pune", state: "Maharashtra", isManual: false };
  }
  if (lat > 12.8 && lat < 13.2 && lng > 77.4 && lng < 77.8) {
    return { lat, lng, displayName: "Bengaluru Urban, Karnataka", locality: "Bengaluru", city: "Bengaluru", state: "Karnataka", isManual: false };
  }
  if (lat > 28.4 && lat < 28.9 && lng > 76.9 && lng < 77.4) {
    return { lat, lng, displayName: "Delhi NCR Region", locality: "New Delhi", city: "Delhi", state: "Delhi", isManual: false };
  }

  return {
    lat,
    lng,
    displayName: `Coordinates (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
    locality: `Current Location (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
    isManual: false,
  };
}
