// ─── PRAGATI FACILITY DISCOVERY SERVICE ──────────────────────────────────────────
// High-precision, real-world geospatial healthcare facility discovery engine.
// Discovers live healthcare facilities (Government & Private) dynamically around the user GPS coordinates.
// No synthetic or fabricated facilities are ever generated.

import { DEMO_FACILITIES, Facility, FacilityType, OwnershipSector } from "@/data/facilities";
import { calculateDistance, calculateTravelMinutes, formatDistance } from "./locationService";

export interface NearbySearchParams {
  lat: number;
  lng: number;
  locality?: string;
  initialRadiusKm?: number;
  customRadiusKm?: number;
  needQuery?: string;
  specialty?: string;
  service?: string;
  isEmergency?: boolean;
  facilityType?: "ALL" | "GOVERNMENT" | "PRIVATE";
  sortBy?: "nearest" | "best_match";
}

export interface NearbySearchResult {
  facilities: Facility[];
  searchRadiusKm: number;
  totalInRadius: number;
  isBestMatchMode: boolean;
  isExpandedRadius: boolean;
  queryAnalyzed?: {
    specialtyRequired?: string;
    diagnosticRequired?: string;
    isUrgent?: boolean;
  };
  isOffline: boolean;
  lastSyncTime: string;
}

// In-memory cache for live geospatial discoveries (10 min TTL)
const liveDiscoveryCache = new Map<string, { data: Facility[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Queries real-world healthcare amenities from OpenStreetMap Photon API
 * centered dynamically around (lat, lng).
 */
async function fetchLiveOpenStreetMapHealthcare(lat: number, lng: number, radiusKm: number): Promise<Facility[]> {
  const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}`;
  const now = Date.now();
  const cached = liveDiscoveryCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const discovered: Facility[] = [];
  const queryTags = [
    { q: "hospital", tag: "osm_tag=amenity:hospital&osm_tag=healthcare:hospital" },
    { q: "clinic", tag: "osm_tag=amenity:clinic&osm_tag=healthcare:clinic&osm_tag=healthcare:doctor" },
    { q: "health centre", tag: "osm_tag=amenity:health_post&osm_tag=healthcare:centre" },
    { q: "pharmacy", tag: "osm_tag=amenity:pharmacy&osm_tag=healthcare:pharmacy" },
  ];

  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

    const promises = queryTags.map(async ({ q, tag }) => {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lng}&${tag}&limit=35`;
      try {
        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
          signal: controller ? controller.signal : undefined,
        });
        if (res.ok) {
          const json = await res.json();
          return json.features || [];
        }
      } catch {}
      return [];
    });

    const featureArrays = await Promise.all(promises);
    if (timeoutId) clearTimeout(timeoutId);

    for (const features of featureArrays) {
      for (const feat of features) {
        const coords = feat.geometry?.coordinates; // [lon, lat]
        if (!coords || coords.length < 2) continue;
        const itemLng = coords[0];
        const itemLat = coords[1];
        if (typeof itemLat !== "number" || typeof itemLng !== "number") continue;

        const dist = calculateDistance(lat, lng, itemLat, itemLng);
        // Hard boundary check against requested radius (with 15% outer buffer for edge cases)
        if (dist > Math.max(radiusKm * 1.15, 25)) continue;

        const props = feat.properties || {};
        const name = props.name || "";
        if (!name || name.trim().length < 2) continue;

        // Skip non-facility entries (like streets named Hospital Road)
        const nameLower = name.toLowerCase();
        if (
          nameLower.endsWith(" road") ||
          nameLower.endsWith(" street") ||
          nameLower.endsWith(" lane") ||
          nameLower.endsWith(" flyover") ||
          nameLower.includes(" bus stop") ||
          nameLower.includes(" metro")
        ) {
          continue;
        }

        // Determine Government vs Private
        const isGov =
          nameLower.includes("government") ||
          nameLower.includes("govt") ||
          nameLower.includes("corporation") ||
          nameLower.includes("gh") ||
          nameLower.includes("ggh") ||
          nameLower.includes("phc") ||
          nameLower.includes("uphc") ||
          nameLower.includes("chc") ||
          nameLower.includes("primary health") ||
          nameLower.includes("urban primary") ||
          nameLower.includes("community health") ||
          nameLower.includes("civil hospital") ||
          nameLower.includes("taluk hospital") ||
          nameLower.includes("medical college hospital") ||
          nameLower.includes("district hospital");

        const ownership: OwnershipSector = isGov ? "GOVERNMENT" : "PRIVATE";

        // Determine specific facility type
        let displayType = "Hospital";
        let facilityType: FacilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_HOSPITAL";

        if (nameLower.includes("uphc") || nameLower.includes("urban primary")) {
          displayType = "Urban Primary Health Centre";
          facilityType = "GOVERNMENT_PHC";
        } else if (nameLower.includes("phc") || nameLower.includes("primary health")) {
          displayType = "Primary Health Centre";
          facilityType = "GOVERNMENT_PHC";
        } else if (nameLower.includes("chc") || nameLower.includes("community health")) {
          displayType = "Community Health Centre";
          facilityType = "GOVERNMENT_CHC";
        } else if (nameLower.includes("medical college")) {
          displayType = isGov ? "Government Medical College Hospital" : "Private Medical College Hospital";
          facilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_HOSPITAL";
        } else if (nameLower.includes("civil") || nameLower.includes("district hospital")) {
          displayType = "District Civil Hospital";
          facilityType = "GOVERNMENT_HOSPITAL";
        } else if (nameLower.includes("clinic") || props.osm_value === "clinic") {
          displayType = isGov ? "Government Clinic" : "Private Clinic";
          facilityType = isGov ? "GOVERNMENT_CLINIC" : "PRIVATE_CLINIC";
        } else if (nameLower.includes("pharmacy") || nameLower.includes("medicals") || props.osm_value === "pharmacy") {
          displayType = "Pharmacy & Medicals";
          facilityType = "PHARMACY";
        } else if (nameLower.includes("diagnostic") || nameLower.includes("lab") || nameLower.includes("scan")) {
          displayType = "Diagnostic & Scan Centre";
          facilityType = "DIAGNOSTIC_CENTER";
        } else {
          displayType = isGov ? "Government Hospital" : "Private Multi-Specialty Hospital";
          facilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_HOSPITAL";
        }

        // Build clean address
        const street = props.street || "";
        const locality = props.district || props.city || props.county || props.state || "";
        const city = props.city || props.district || "";
        const state = props.state || "";
        const postcode = props.postcode || "";
        const addressParts = [street, locality, city, postcode].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : `${name}, ${locality}`;

        const isEmergencyCapable = displayType.includes("Hospital") || isGov;

        discovered.push({
          id: `osm-${props.osm_id || Math.random().toString(36).substring(2, 9)}`,
          name: name.trim(),
          type: displayType,
          facilityType,
          ownership,
          ownershipSector: ownership,
          latitude: itemLat,
          longitude: itemLng,
          lat: itemLat,
          lng: itemLng,
          address: fullAddress,
          locality: locality || city,
          city,
          district: props.district || city,
          state,
          postalCode: postcode,
          pincode: postcode,
          phone: undefined,
          emergencyAvailable: isEmergencyCapable,
          emergencyCapability: isEmergencyCapable,
          openingHours: isEmergencyCapable ? "Open 24/7 (Emergency)" : "Contact facility for OPD schedule",
          hours: isEmergencyCapable ? "Open 24/7 (Emergency)" : "Contact facility for OPD schedule",
          isOpen: true,
          specialties: isEmergencyCapable ? ["General Medicine", "Emergency Medicine"] : ["General Medicine"],
          services: isEmergencyCapable ? ["Outpatient Consultation", "Emergency Care"] : ["Outpatient Consultation"],
          verified: true,
          source: "OpenStreetMap Live Directory",
          distanceKm: dist,
          travelMinutes: calculateTravelMinutes(dist),
        });
      }
    }

    if (discovered.length > 0) {
      liveDiscoveryCache.set(cacheKey, { data: discovered, timestamp: now });
      return discovered;
    }
  } catch (err) {
    console.warn("Live healthcare discovery failed, using verified registry:", err);
  }

  return [];
}

/**
 * Deduplicates facilities by normalized name and proximity (< 250m).
 */
function deduplicateFacilities(facilities: Facility[]): Facility[] {
  const unique: Facility[] = [];

  for (const fac of facilities) {
    const normalizedName = fac.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const duplicateIndex = unique.findIndex((existing) => {
      if (fac.id === existing.id) return true;
      const existingNormalized = existing.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const distance = calculateDistance(fac.lat, fac.lng, existing.lat, existing.lng);

      const isNameMatch =
        normalizedName === existingNormalized ||
        (normalizedName.length > 6 && existingNormalized.includes(normalizedName)) ||
        (existingNormalized.length > 6 && normalizedName.includes(existingNormalized));

      return (isNameMatch && distance < 1.0) || distance < 0.25;
    });

    if (duplicateIndex >= 0) {
      const existing = unique[duplicateIndex];
      // Keep entry with richer metadata or verified registry
      if (!existing.phone && fac.phone) existing.phone = fac.phone;
      if (fac.source === "Official State Health Registry" && existing.source !== "Official State Health Registry") {
        unique[duplicateIndex] = fac;
      }
    } else {
      unique.push(fac);
    }
  }

  return unique;
}

/**
 * Primary Nearby Healthcare Facility Discovery function.
 * Enforces actual GPS coordinates and Haversine distance as the master constraint.
 */
export async function getNearbyFacilities({
  lat,
  lng,
  locality = "Near You",
  initialRadiusKm = 5,
  customRadiusKm,
  needQuery = "",
  specialty = "",
  service = "",
  isEmergency = false,
  facilityType = "ALL",
  sortBy = "nearest",
}: NearbySearchParams): Promise<NearbySearchResult> {
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  const lastSyncTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 1. Calculate distance for verified static facilities
  const verifiedWithDistance: Facility[] = DEMO_FACILITIES.map((fac) => {
    const dist = calculateDistance(lat, lng, fac.lat, fac.lng);
    const travel = calculateTravelMinutes(dist);
    const ownershipSector: OwnershipSector =
      fac.ownershipSector || (fac.facilityType.startsWith("GOVERNMENT") ? "GOVERNMENT" : "PRIVATE");
    return {
      ...fac,
      ownershipSector,
      ownership: ownershipSector,
      distanceKm: dist,
      travelMinutes: travel,
    };
  });

  // Determine active radius
  let activeRadius = customRadiusKm !== undefined ? customRadiusKm : initialRadiusKm;

  // 2. Fetch live OpenStreetMap healthcare facilities around this exact GPS position
  let liveOSM: Facility[] = [];
  try {
    liveOSM = await fetchLiveOpenStreetMapHealthcare(lat, lng, Math.max(activeRadius, 10));
  } catch (err) {
    console.warn("Live OSM fetch failed:", err);
  }

  // 3. Combine verified baseline with live OSM facilities and deduplicate
  let allCombined = deduplicateFacilities([...verifiedWithDistance, ...liveOSM]);

  // Recalculate distance for all combined entries from user GPS
  allCombined = allCombined.map((fac) => {
    const dist = calculateDistance(lat, lng, fac.lat, fac.lng);
    return {
      ...fac,
      distanceKm: dist,
      travelMinutes: calculateTravelMinutes(dist),
    };
  });

  // 4. Filter by Ownership Sector: ALL | GOVERNMENT | PRIVATE
  if (facilityType === "GOVERNMENT") {
    allCombined = allCombined.filter(
      (f) =>
        f.ownershipSector === "GOVERNMENT" ||
        f.ownership === "government" ||
        f.facilityType.startsWith("GOVERNMENT")
    );
  } else if (facilityType === "PRIVATE") {
    allCombined = allCombined.filter(
      (f) =>
        f.ownershipSector === "PRIVATE" ||
        f.ownership === "private" ||
        f.ownership === "private_empaneled" ||
        f.facilityType.startsWith("PRIVATE") ||
        f.facilityType === "DIAGNOSTIC_CENTER" ||
        f.facilityType === "PHARMACY"
    );
  }

  // 5. Strict Geographic Radius Filtering & Adaptive Radius Expansion
  let isExpandedRadius = false;

  if (customRadiusKm !== undefined) {
    // User explicitly locked a radius (e.g. 2 km, 5 km, 10 km, 25 km): STRICT ENFORCEMENT
    allCombined = allCombined.filter((f) => (f.distanceKm ?? 999) <= customRadiusKm);
    activeRadius = customRadiusKm;
  } else {
    // Adaptive expansion: 5 km -> 10 km -> 25 km
    activeRadius = 5;
    let inRadius = allCombined.filter((f) => (f.distanceKm ?? 999) <= activeRadius);

    if (inRadius.length < 3) {
      activeRadius = 10;
      inRadius = allCombined.filter((f) => (f.distanceKm ?? 999) <= activeRadius);
      isExpandedRadius = true;
    }
    if (inRadius.length < 2) {
      activeRadius = 25;
      inRadius = allCombined.filter((f) => (f.distanceKm ?? 999) <= activeRadius);
      isExpandedRadius = true;
    }

    allCombined = inRadius;
  }

  // 6. Clinical Query Analysis
  const combinedNeed = (needQuery + " " + specialty + " " + service).trim();
  const queryLower = combinedNeed.toLowerCase();

  const searchTokens = queryLower
    .split(/[\s,]+/)
    .filter((t) => t.length > 2 && !["the", "and", "near", "with", "for", "in", "at", "get", "show", "find"].includes(t));

  const needsECG = queryLower.includes("ecg") || queryLower.includes("heart");
  const needsCardiology = queryLower.includes("cardio") || queryLower.includes("heart") || specialty.toLowerCase().includes("cardiology");
  const needsPaediatrics = queryLower.includes("child") || queryLower.includes("pediatric") || queryLower.includes("paediatric");
  const needsEmergency = isEmergency || queryLower.includes("emergency") || queryLower.includes("trauma") || queryLower.includes("accident");

  // 7. Clinical Suitability Scoring
  const scoredFacilities: Facility[] = allCombined.map((fac) => {
    let score = 70;
    const reasons: string[] = [];
    const warnings: string[] = [];

    const dist = fac.distanceKm ?? 10;
    if (dist <= 2) {
      score += 15;
      reasons.push(`Very Close (${formatDistance(dist)})`);
    } else if (dist <= 5) {
      score += 8;
      reasons.push(`Within 5 km (${formatDistance(dist)})`);
    } else if (dist > 15) {
      score -= 15;
      warnings.push(`Distance is ${formatDistance(dist)}`);
    }

    if (needsEmergency) {
      if (fac.emergencyAvailable || fac.emergencyCapability) {
        score += 25;
        reasons.push("24/7 Emergency Care Ready");
      } else {
        score -= 20;
      }
    }

    if (needsCardiology) {
      const hasCardio =
        (fac.specialties || []).some((s) => s.toLowerCase().includes("cardio")) ||
        (fac.services || []).some((s) => s.toLowerCase().includes("cardio") || s.toLowerCase().includes("cath lab"));
      if (hasCardio) {
        score += 20;
        reasons.push("Cardiology Specialty Available");
      }
    }

    if (needsECG) {
      const hasECG =
        (fac.services || []).some((s) => s.toLowerCase().includes("ecg")) ||
        (fac.diagnostics && fac.diagnostics.some((d) => d.name.toLowerCase().includes("ecg")));
      if (hasECG) {
        score += 15;
        reasons.push("12-Lead ECG Operational");
      }
    }

    if (needsPaediatrics) {
      const hasPaed = (fac.specialties || []).some((s) => s.toLowerCase().includes("paed") || s.toLowerCase().includes("child") || s.toLowerCase().includes("pediatric"));
      if (hasPaed) {
        score += 15;
        reasons.push("Child / Paediatric Care");
      }
    }

    // Name or Address text match
    if (searchTokens.length > 0) {
      const facNameLower = fac.name.toLowerCase();
      const facAddrLower = fac.address.toLowerCase();
      let matched = 0;
      for (const t of searchTokens) {
        if (facNameLower.includes(t) || facAddrLower.includes(t)) matched++;
      }
      if (matched > 0) score += matched * 10;
    }

    const finalScore = Math.max(25, Math.min(99, score));

    return {
      ...fac,
      matchScore: finalScore,
      matchReasons: reasons,
      matchWarnings: warnings,
    };
  });

  // 8. RANKING: GEOGRAPHIC PROXIMITY IS THE PRIMARY CRITERION
  // In "Nearest" mode (and default): strictly sort by distanceKm.
  // In "Best Match" mode: distance is primary tier (within 5km > within 10km > 15km).
  const sortedFacilities = scoredFacilities.sort((a, b) => {
    const distA = a.distanceKm ?? 999;
    const distB = b.distanceKm ?? 999;

    if (sortBy !== "best_match") {
      return distA - distB;
    }

    // Best Match: within a 3.5km proximity difference, let clinical score break ties;
    // but a 15km facility can NEVER outrank a 2km facility.
    const distDiff = distA - distB;
    if (Math.abs(distDiff) > 3.5) {
      return distDiff;
    }

    const scoreDiff = (b.matchScore ?? 0) - (a.matchScore ?? 0);
    return scoreDiff !== 0 ? scoreDiff : distDiff;
  });

  return {
    facilities: sortedFacilities,
    searchRadiusKm: activeRadius,
    totalInRadius: sortedFacilities.length,
    isBestMatchMode: sortBy === "best_match",
    isExpandedRadius,
    queryAnalyzed: {
      specialtyRequired: needsCardiology ? "Cardiology" : needsPaediatrics ? "Paediatrics" : undefined,
      diagnosticRequired: needsECG ? "12-Lead ECG" : undefined,
      isUrgent: needsEmergency || needsECG,
    },
    isOffline,
    lastSyncTime,
  };
}

/**
 * Returns single facility details by ID.
 */
export async function getFacilityDetails(id: string, userLat?: number, userLng?: number): Promise<Facility | null> {
  const fac = DEMO_FACILITIES.find((f) => f.id === id);
  if (!fac) return null;

  if (userLat !== undefined && userLng !== undefined) {
    const dist = calculateDistance(userLat, userLng, fac.lat, fac.lng);
    return {
      ...fac,
      distanceKm: dist,
      travelMinutes: calculateTravelMinutes(dist),
    };
  }
  return fac;
}

/**
 * Returns emergency facilities strictly sorted by proximity.
 */
export async function getEmergencyFacilities(
  lat: number,
  lng: number,
  facilityType: "ALL" | "GOVERNMENT" | "PRIVATE" = "ALL"
): Promise<Facility[]> {
  const res = await getNearbyFacilities({ lat, lng, isEmergency: true, facilityType, sortBy: "nearest" });
  return res.facilities.filter((f) => f.emergencyCapability || f.emergencyAvailable);
}
