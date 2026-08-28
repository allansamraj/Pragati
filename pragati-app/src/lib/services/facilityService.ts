// ─── PRAGATI FACILITY DISCOVERY SERVICE (v3 — Google Places API Primary) ──────
// Pipeline: User GPS → Google Places API (primary) → Overpass OSM (fallback)
//           → PRAGATI Verified Registry → Deduplication → Specialty Eligibility
//           → Hard Exclusions → Sector Filter → Suitability Scoring → Ranking
//
// CANONICAL SERVICE: Called identically by Find Care page AND PRAGATI Care chatbot.
// DO NOT branch this — both UIs must receive the same data.

import { DEMO_FACILITIES, Facility, FacilityType, OwnershipSector } from "@/data/facilities";
import { calculateDistance, calculateTravelMinutes } from "./locationService";
import { FacilityCategory, IntentContext, classifyGooglePlaceTypes, mapIntentToFacilityRequirements } from "@/lib/ai/facilityRequirementsMapper";
import { healthcareIntentRouter, type IntentAnalysisResult } from "@/lib/ai/healthcareIntentRouter";

// FacilityWithMeta = Facility extended with the category field from FacilityCategory
// (Facility already has googlePlaceId, googleMapsUri, isOpen?: boolean|null, and expanded source via facilities.ts)
export type FacilityWithMeta = Facility & {
  category?: FacilityCategory;
};


// ── SEARCH PARAMETERS ─────────────────────────────────────────────────────────
export interface NearbySearchParams {
  lat: number;
  lng: number;
  locality?: string;
  initialRadiusKm?: number;
  customRadiusKm?: number;
  /** Legacy: plain text query from UI search bar */
  needQuery?: string;
  /** Legacy: specialty string (maps to IntentContext internally) */
  specialty?: string;
  service?: string;
  isEmergency?: boolean;
  facilityType?: "ALL" | "GOVERNMENT" | "PRIVATE";
  sortBy?: "nearest" | "best_match";
  /** Structured intent context — takes priority over specialty/needQuery when provided */
  intentContext?: IntentContext;
}

// ── SEARCH RESULT ─────────────────────────────────────────────────────────────
export interface NearbySearchResult {
  /** Specialty-filtered recommendations — for the RESULT LIST */
  facilities: FacilityWithMeta[];
  /** ALL nearby healthcare facilities regardless of specialty — for the MAP */
  allNearbyFacilities: FacilityWithMeta[];
  searchRadiusKm: number;
  totalInRadius: number;
  /** Total geographic facilities found (for map, unfiltered) */
  totalGeographicFacilities: number;
  isBestMatchMode: boolean;
  isExpandedRadius: boolean;
  hasSpecialtyMatch: boolean;
  noSpecialtyFacilitiesFound: boolean;
  queryAnalyzed?: {
    specialtyRequired?: string;
    isStrictSpecialty?: boolean;
    isUrgent?: boolean;
    primarySource?: string;
  };
  isOffline: boolean;
  lastSyncTime: string;
}


// ── IN-MEMORY CACHE (10 min TTL) ─────────────────────────────────────────────
const discoveryCache = new Map<string, { data: FacilityWithMeta[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

// ── HAVERSINE DISTANCE ────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// BROAD GEOGRAPHIC DISCOVERY — for the MAP LAYER (no specialty filter)
// Queries all healthcare facility types regardless of clinical intent.
// ─────────────────────────────────────────────────────────────────────────────
const PLACES_SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const PLACES_FIELDS = "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.businessStatus,places.regularOpeningHours,places.googleMapsUri,places.internationalPhoneNumber,places.nationalPhoneNumber";

async function queryGooglePlacesInternal(
  lat: number,
  lng: number,
  radiusM: number,
  queryText?: string,
  types?: string[]
): Promise<FacilityWithMeta[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // If in browser, call the Next.js API route
  if (typeof window !== "undefined") {
    try {
      const q = queryText ? `&query=${encodeURIComponent(queryText)}` : "";
      const t = types && types.length > 0 ? `&types=${encodeURIComponent(types.join(","))}` : "";
      const url = `/api/facilities/places-search?lat=${lat}&lng=${lng}&radius=${radiusM}${q}${t}&maxResults=20`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const json = await res.json();
      return (json.facilities || []).map((f: any) => {
        const dist = haversineKm(lat, lng, f.lat, f.lng);
        return {
          ...f,
          distanceKm: dist,
          travelMinutes: calculateTravelMinutes(dist),
          source: "google_places" as const,
        };
      });
    } catch {
      return [];
    }
  }

  // If on server-side and apiKey is available, query Google Places directly
  if (apiKey) {
    try {
      let rawPlaces: any[] = [];

      if (queryText && queryText.trim().length > 0) {
        const res = await fetch(PLACES_SEARCH_TEXT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": PLACES_FIELDS,
          },
          body: JSON.stringify({
            textQuery: queryText.trim(),
            maxResultCount: 20,
            locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: radiusM } },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          rawPlaces = json.places || [];
        }
      } else {
        const validTypes = (types || ["hospital", "doctor"]).filter((t) =>
          ["hospital", "doctor", "dentist", "pharmacy", "medical_lab", "physiotherapist", "drugstore"].includes(t.toLowerCase())
        );
        const res = await fetch(PLACES_SEARCH_NEARBY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": PLACES_FIELDS,
          },
          body: JSON.stringify({
            includedTypes: validTypes.length > 0 ? validTypes : ["hospital", "doctor"],
            maxResultCount: 20,
            locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: radiusM } },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          rawPlaces = json.places || [];
        }
      }

      return rawPlaces
        .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY" && p.location)
        .map((p) => {
          const name = p.displayName?.text || "Healthcare Facility";
          const pTypes = p.types || [];
          const isGov = name.toLowerCase().includes("government") || name.toLowerCase().includes("govt") || name.toLowerCase().includes("phc") || name.toLowerCase().includes("uphc");
          const ownership = isGov ? "GOVERNMENT" : "PRIVATE";
          const category = classifyGooglePlaceTypes(pTypes);
          const dist = haversineKm(lat, lng, p.location.latitude, p.location.longitude);

          return {
            id: `gpl-${p.id}`,
            googlePlaceId: p.id,
            name,
            type: category === "HOSPITAL" ? "Hospital" : category === "DENTAL_CLINIC" ? "Dental Clinic" : category === "SKIN_CLINIC" ? "Dermatology Clinic" : category === "EYE_HOSPITAL" ? "Eye Hospital & Clinic" : category === "OPTICAL_SHOP" ? "Optical & Vision Centre" : category === "PHARMACY" ? "Pharmacy & Medicals" : category === "DIAGNOSTIC_CENTER" ? "Diagnostic & Scan Centre" : "Healthcare Clinic",
            facilityType: (isGov ? (category === "HOSPITAL" ? "GOVERNMENT_HOSPITAL" : "GOVERNMENT_CLINIC") : (category === "HOSPITAL" ? "PRIVATE_HOSPITAL" : category === "PHARMACY" ? "PHARMACY" : category === "DIAGNOSTIC_CENTER" ? "DIAGNOSTIC_CENTER" : "PRIVATE_CLINIC")) as FacilityType,
            category,
            ownership,
            ownershipSector: ownership,
            lat: p.location.latitude,
            lng: p.location.longitude,
            latitude: p.location.latitude,
            longitude: p.location.longitude,
            address: p.formattedAddress || "",
            city: "Chennai",
            state: "Tamil Nadu",
            district: "Chennai",
            locality: "",
            phone: p.internationalPhoneNumber || p.nationalPhoneNumber || undefined,
            googleMapsUri: p.googleMapsUri,
            isOpen: p.regularOpeningHours?.openNow ?? null,
            openingHours: p.regularOpeningHours?.openNow === true ? "Open Now" : p.regularOpeningHours?.openNow === false ? "Closed" : "Hours on request",
            specialties: ["General Medicine"],
            services: ["Outpatient Consultation"],
            emergencyAvailable: pTypes.includes("hospital") || isGov,
            emergencyCapability: pTypes.includes("hospital"),
            verified: true,
            source: "google_places" as const,
            distanceKm: dist,
            travelMinutes: calculateTravelMinutes(dist),
          };
        });
    } catch {
      return [];
    }
  }

  return [];
}

async function fetchAllNearbyHealthcare(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<FacilityWithMeta[]> {
  const cacheKey = `geo_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}`;
  const cached = discoveryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  const radiusM = Math.round(radiusKm * 1000);
  const facilities = await queryGooglePlacesInternal(lat, lng, radiusM, "hospital clinic doctor pharmacy lab dental healthcare");

  if (facilities.length > 0) {
    discoveryCache.set(cacheKey, { data: facilities, timestamp: Date.now() });
  }
  return facilities;
}

async function fetchGooglePlaces(
  lat: number,
  lng: number,
  radiusKm: number,
  ctx: IntentContext
): Promise<FacilityWithMeta[]> {
  const cacheKey = `gpl_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}_${ctx.specialty}`;
  const cached = discoveryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  const radiusM = Math.round(radiusKm * 1000);
  const queryText = `${ctx.specialty} clinic hospital`;
  const facilities = await queryGooglePlacesInternal(lat, lng, radiusM, queryText, ctx.primaryGoogleTypes);

  if (facilities.length > 0) {
    discoveryCache.set(cacheKey, { data: facilities, timestamp: Date.now() });
  }
  return facilities;
}


// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2: OVERPASS OSM API — proper structured queries (replaces Photon geocoder)
// ─────────────────────────────────────────────────────────────────────────────
function buildOverpassQuery(lat: number, lng: number, radiusM: number, tags: string[]): string {
  const tagQueries = tags
    .map((tag) => {
      const [key, value] = tag.split("=");
      if (!key || !value) return "";
      return [
        `  node["${key}"="${value}"](around:${radiusM},${lat},${lng});`,
        `  way["${key}"="${value}"](around:${radiusM},${lat},${lng});`,
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n");

  return `[out:json][timeout:12];\n(\n${tagQueries}\n);\nout center;`;
}

function parseOSMTags(nameLower: string): {
  category: FacilityCategory;
  displayType: string;
  specialties: string[];
  services: string[];
  facilityType: FacilityType;
} {
  // Strict: derive category from OSM tags, not from name keywords
  if (nameLower.includes("pharmacy") || nameLower.includes("chemist") || nameLower.includes("medicals")) {
    return { category: "PHARMACY", displayType: "Pharmacy & Medicals", specialties: [], services: ["Dispensing Medicines"], facilityType: "PHARMACY" };
  }
  if (nameLower.includes("dental") || nameLower.includes("dentist")) {
    return { category: "DENTAL_CLINIC", displayType: "Dental Clinic & Hospital", specialties: ["Dentistry", "Oral Healthcare"], services: ["Dental Examination", "Tooth Extraction", "Root Canal"], facilityType: "PRIVATE_CLINIC" };
  }
  if (nameLower.includes("skin") || nameLower.includes("derma")) {
    return { category: "SKIN_CLINIC", displayType: "Dermatology & Skin Clinic", specialties: ["Dermatology", "Skin & Allergy Care"], services: ["Dermatology Consultation", "Skin Allergy Treatment"], facilityType: "PRIVATE_CLINIC" };
  }
  if (nameLower.includes("eye") || nameLower.includes("netralaya") || nameLower.includes("ophthalm")) {
    return { category: "EYE_HOSPITAL", displayType: "Eye Hospital & Clinic", specialties: ["Ophthalmology", "Eye Care"], services: ["Eye Examination", "Ophthalmology Consultation"], facilityType: "PRIVATE_CLINIC" };
  }
  if (nameLower.includes("optical") || nameLower.includes("optician") || nameLower.includes("spectacle") || nameLower.includes("vision centre")) {
    return { category: "OPTICAL_SHOP", displayType: "Optical & Vision Centre", specialties: ["Optometry", "Vision Care"], services: ["Optometry Examination", "Spectacles", "Contact Lens"], facilityType: "PRIVATE_CLINIC" };
  }
  if (nameLower.includes(" ent ") || nameLower.includes("ear, nose") || nameLower.includes("otolaryng")) {
    return { category: "ENT_CLINIC", displayType: "ENT Specialist Clinic", specialties: ["ENT (Otolaryngology)"], services: ["ENT Consultation", "Hearing Evaluation", "Sinus Care"], facilityType: "PRIVATE_CLINIC" };
  }
  if (nameLower.includes("ortho") || nameLower.includes("bone & joint")) {
    return { category: "ORTHOPAEDIC_CLINIC", displayType: "Orthopaedic Hospital & Clinic", specialties: ["Orthopaedics", "Bone & Joint Care"], services: ["Orthopaedic Consultation", "Joint Care", "Fracture Management"], facilityType: "PRIVATE_CLINIC" };
  }
  if (nameLower.includes("child") || nameLower.includes("paediatric") || nameLower.includes("pediatric") || nameLower.includes("baby")) {
    return { category: "PAEDIATRIC_CLINIC", displayType: "Paediatric & Child Care Clinic", specialties: ["Paediatrics", "Child Health"], services: ["Paediatric Consultation", "Child Care", "Immunization"], facilityType: "PRIVATE_CLINIC" };
  }
  if (nameLower.includes("cardio") || nameLower.includes("heart")) {
    return { category: "CARDIOLOGY_CLINIC", displayType: "Cardiology & Heart Clinic", specialties: ["Cardiology"], services: ["Cardiology Consultation", "12-Lead ECG", "Cardiac Assessment"], facilityType: "PRIVATE_HOSPITAL" };
  }
  if (nameLower.includes("diagnostic") || nameLower.includes("scan centre") || nameLower.includes("imaging")) {
    return { category: "DIAGNOSTIC_CENTER", displayType: "Diagnostic & Scan Centre", specialties: ["Diagnostics & Imaging"], services: ["Blood Tests", "Digital X-Ray", "Ultrasound", "CT Scan"], facilityType: "DIAGNOSTIC_CENTER" };
  }
  if (nameLower.includes("phc") || nameLower.includes("primary health") || nameLower.includes("uphc") || nameLower.includes("urban primary")) {
    return { category: "PRIMARY_HEALTH_CENTRE", displayType: "Primary Health Centre", specialties: ["General Medicine", "Primary Healthcare"], services: ["Outpatient Consultation", "Primary Care", "Free Essential Medicines"], facilityType: "GOVERNMENT_PHC" };
  }
  if (nameLower.includes("chc") || nameLower.includes("community health")) {
    return { category: "COMMUNITY_HEALTH_CENTRE", displayType: "Community Health Centre", specialties: ["General Medicine", "General Surgery", "Paediatrics"], services: ["Outpatient Consultation", "Inpatient Beds", "Emergency Primary Care"], facilityType: "GOVERNMENT_CHC" };
  }
  // Default: general clinic/hospital
  return { category: "CLINIC", displayType: "Healthcare Clinic", specialties: ["General Medicine"], services: ["Outpatient Consultation"], facilityType: "PRIVATE_CLINIC" };
}

async function fetchOverpassOSM(
  lat: number,
  lng: number,
  radiusKm: number,
  tags: string[]
): Promise<FacilityWithMeta[]> {
  const cacheKey = `osm_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}_${tags.join("_")}`;
  const cached = discoveryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  const radiusM = Math.round(radiusKm * 1000);
  const query = buildOverpassQuery(lat, lng, radiusM, tags);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const json = await res.json();
    const elements: Record<string, unknown>[] = json.elements || [];
    const facilities: FacilityWithMeta[] = [];

    for (const el of elements) {
      const tags = (el.tags || {}) as Record<string, string>;
      const name = tags.name || tags["name:en"] || "";
      if (!name || name.trim().length < 2) continue;

      // Get coordinates
      let itemLat: number, itemLng: number;
      if (el.type === "way" && el.center) {
        const center = el.center as { lat: number; lon: number };
        itemLat = center.lat;
        itemLng = center.lon;
      } else {
        itemLat = el.lat as number;
        itemLng = el.lon as number;
      }
      if (!itemLat || !itemLng) continue;

      const dist = haversineKm(lat, lng, itemLat, itemLng);
      if (dist > radiusKm * 1.1) continue;

      const nameLower = name.toLowerCase();

      // Skip non-healthcare entries
      if (
        nameLower.endsWith(" road") ||
        nameLower.endsWith(" street") ||
        nameLower.endsWith(" lane") ||
        nameLower.includes("bus stop") ||
        nameLower.includes("metro station")
      ) continue;

      const isGov =
        nameLower.includes("government") || nameLower.includes("govt") || nameLower.includes("corporation") ||
        nameLower.includes("phc") || nameLower.includes("uphc") || nameLower.includes("chc") ||
        nameLower.includes("primary health") || nameLower.includes("civil hospital") || nameLower.includes("district hospital") ||
        nameLower.includes("taluk hospital") || nameLower.includes("medical college hospital");

      const ownership: OwnershipSector = isGov ? "GOVERNMENT" : "PRIVATE";
      const { category, displayType, specialties, services, facilityType: baseType } = parseOSMTags(nameLower);
      const facilityType = isGov && baseType === "PRIVATE_CLINIC" ? "GOVERNMENT_CLINIC" : isGov && baseType === "PRIVATE_HOSPITAL" ? "GOVERNMENT_HOSPITAL" : baseType;

      const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"] || tags["addr:city"], tags["addr:postcode"]].filter(Boolean).join(", ");

      facilities.push({
        id: `osm-${el.id}`,
        name: name.trim(),
        type: displayType,
        facilityType,
        category,
        ownership,
        ownershipSector: ownership,
        latitude: itemLat,
        longitude: itemLng,
        lat: itemLat,
        lng: itemLng,
        address: address || `${name}, ${tags["addr:city"] || ""}`,
        locality: tags["addr:suburb"] || tags["addr:city"] || "",
        city: tags["addr:city"] || "",
        district: tags["addr:city"] || "",
        state: "Tamil Nadu",
        postalCode: tags["addr:postcode"] || "",
        pincode: tags["addr:postcode"] || "",
        phone: tags.phone || tags["contact:phone"] || undefined,
        isOpen: null,
        openingHours: tags.opening_hours || "Contact facility for schedule",
        hours: tags.opening_hours || "",
        emergencyAvailable: tags.emergency === "yes" || isGov,
        emergencyCapability: tags.emergency === "yes" || facilityType.includes("HOSPITAL"),
        specialties,
        services,
        verified: true,
        source: "openstreetmap",
        isPmJayEmpaneled: false,
        hasTelemedicine: false,
        distanceKm: dist,
        travelMinutes: calculateTravelMinutes(dist),
      });
    }

    if (facilities.length > 0) {
      discoveryCache.set(cacheKey, { data: facilities, timestamp: Date.now() });
    }
    return facilities;
  } catch (err) {
    console.warn("[facilityService] Overpass OSM error:", err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3: PRAGATI VERIFIED REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
function getVerifiedRegistry(lat: number, lng: number): FacilityWithMeta[] {
  return DEMO_FACILITIES.map((fac) => {
    const dist = calculateDistance(lat, lng, fac.lat, fac.lng);
    const ownershipSector: OwnershipSector = fac.ownershipSector || (fac.facilityType.startsWith("GOVERNMENT") ? "GOVERNMENT" : "PRIVATE");
    // Derive category from facilityType
    let category: FacilityCategory = "OTHER";
    if (fac.facilityType === "GOVERNMENT_HOSPITAL") category = "GOVERNMENT_HOSPITAL";
    else if (fac.facilityType === "GOVERNMENT_PHC") category = "PRIMARY_HEALTH_CENTRE";
    else if (fac.facilityType === "GOVERNMENT_CHC") category = "COMMUNITY_HEALTH_CENTRE";
    else if (fac.facilityType === "PRIVATE_HOSPITAL") category = "HOSPITAL";
    else if (fac.facilityType === "PRIVATE_CLINIC" || fac.facilityType === "GOVERNMENT_CLINIC") {
      // Refine by specialties
      const specs = (fac.specialties || []).map((s) => s.toLowerCase());
      if (specs.some((s) => s.includes("derma") || s.includes("skin"))) category = "SKIN_CLINIC";
      else if (specs.some((s) => s.includes("dent"))) category = "DENTAL_CLINIC";
      else if (specs.some((s) => s.includes("eye") || s.includes("ophthalm"))) category = "EYE_HOSPITAL";
      else if (specs.some((s) => s.includes("ent"))) category = "ENT_CLINIC";
      else if (specs.some((s) => s.includes("ortho") || s.includes("bone"))) category = "ORTHOPAEDIC_CLINIC";
      else if (specs.some((s) => s.includes("paed") || s.includes("child"))) category = "PAEDIATRIC_CLINIC";
      else if (specs.some((s) => s.includes("cardio"))) category = "CARDIOLOGY_CLINIC";
      else category = "CLINIC";
    }
    else if (fac.facilityType === "DIAGNOSTIC_CENTER") category = "DIAGNOSTIC_CENTER";
    else if (fac.facilityType === "PHARMACY") category = "PHARMACY";

    return {
      ...fac,
      category,
      ownershipSector,
      ownership: ownershipSector,
      source: (fac.source || "pragati_verified") as FacilityWithMeta["source"],
      distanceKm: dist,
      travelMinutes: calculateTravelMinutes(dist),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DEDUPLICATION
// ─────────────────────────────────────────────────────────────────────────────
function deduplicateFacilities(facilities: FacilityWithMeta[]): FacilityWithMeta[] {
  const unique: FacilityWithMeta[] = [];

  for (const fac of facilities) {
    const normalizedName = fac.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const duplicate = unique.findIndex((existing) => {
      // Google Place ID exact match
      if (fac.googlePlaceId && existing.googlePlaceId && fac.googlePlaceId === existing.googlePlaceId) return true;
      // Same ID
      if (fac.id === existing.id) return true;
      // Very close coordinates (< 200m)
      const dist = haversineKm(fac.lat, fac.lng, existing.lat, existing.lng);
      if (dist < 0.2) return true;
      // Similar name and close proximity
      const existingNorm = existing.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const nameMatch =
        normalizedName === existingNorm ||
        (normalizedName.length > 6 && existingNorm.includes(normalizedName)) ||
        (existingNorm.length > 6 && normalizedName.includes(existingNorm));
      return nameMatch && dist < 1.0;
    });

    if (duplicate >= 0) {
      // Keep better source: Google Places > pragati_verified > openstreetmap
      const priority = (s: string) => (s === "google_places" ? 3 : s === "Official State Health Registry" || s === "pragati_verified" ? 2 : 1);
      if (priority(fac.source) > priority(unique[duplicate].source)) {
        unique[duplicate] = { ...fac, ...unique[duplicate], source: fac.source, googlePlaceId: fac.googlePlaceId || unique[duplicate].googlePlaceId, googleMapsUri: fac.googleMapsUri || unique[duplicate].googleMapsUri };
      }
    } else {
      unique.push(fac);
    }
  }
  return unique;
}

// ─────────────────────────────────────────────────────────────────────────────
// HARD EXCLUSION FILTER
// ─────────────────────────────────────────────────────────────────────────────
function applyHardExclusions(
  facilities: FacilityWithMeta[],
  ctx: IntentContext
): FacilityWithMeta[] {
  if (ctx.excludedCategories.length === 0) return facilities;

  return facilities.filter((f) => {
    const category = f.category || classifyGooglePlaceTypes((f.specialties || []).map((s) => s.toLowerCase()));

    // Check by PRAGATI category
    if (ctx.excludedCategories.includes(category)) return false;

    // Additional name-based exclusions (belt-and-suspenders)
    const nameLower = f.name.toLowerCase();
    const excluded = ctx.excludedGoogleTypes;
    if (excluded.includes("dentist") && (nameLower.includes("dental") || nameLower.includes("dentist"))) return false;
    if (excluded.includes("pharmacy") && (nameLower.includes("pharmacy") || nameLower.includes("chemist") || nameLower.includes("medicals"))) return false;
    if (excluded.includes("optician") && (nameLower.includes("optical") || nameLower.includes("spectacle") || nameLower.includes("vision centre"))) return false;
    if (excluded.includes("veterinary_care") && (nameLower.includes("veterinary") || nameLower.includes("vet") || nameLower.includes("animal"))) return false;

    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITABILITY SCORING (CLINICAL RELEVANCE FIRST, THEN PROXIMITY)
// ─────────────────────────────────────────────────────────────────────────────
export type MatchTier = 'BEST_SPECIALTY_MATCH' | 'NEARBY_GENERAL_CARE' | 'GENERAL_CARE_FALLBACK' | 'UNRELATED';

export interface SuitabilityScoreResult {
  score: number;
  isDirectSpecialtyMatch: boolean;
  matchTier: MatchTier;
  recommendationLabel: string;
  clinicalRelevanceScore: number;
  distanceScore: number;
  facilityTypeScore: number;
  availabilityScore: number;
}

function calculateSuitabilityScore(
  fac: FacilityWithMeta,
  ctx: IntentContext
): SuitabilityScoreResult {
  const category = fac.category || "OTHER";
  const facilitySpecialties = (fac.specialties || []).map((s) => s.toLowerCase());
  const specialtyLower = ctx.specialty.toLowerCase();
  const isGeneralIntent = specialtyLower.includes("general") || ctx.specialty === "General Medicine";

  // ── 1. CLINICAL RELEVANCE SCORE (0–65) ──
  let clinicalRelevanceScore = 0;
  let isDirectSpecialtyMatch = false;

  const directCategoryMatch = (
    (specialtyLower.includes("derma") || specialtyLower.includes("skin")) && (category === "SKIN_CLINIC") ||
    (specialtyLower.includes("dent")) && (category === "DENTAL_CLINIC") ||
    (specialtyLower.includes("optometr") || specialtyLower.includes("optic")) && (category === "OPTICAL_SHOP" || category === "EYE_HOSPITAL") ||
    (specialtyLower.includes("ophthalm") || specialtyLower.includes("eye")) && (category === "EYE_HOSPITAL") ||
    (specialtyLower.includes("ent")) && (category === "ENT_CLINIC") ||
    (specialtyLower.includes("cardio")) && (category === "CARDIOLOGY_CLINIC") ||
    (specialtyLower.includes("ortho")) && (category === "ORTHOPAEDIC_CLINIC") ||
    (specialtyLower.includes("paed") || specialtyLower.includes("pediatr")) && (category === "PAEDIATRIC_CLINIC") ||
    (specialtyLower.includes("diagnost") || specialtyLower.includes("imaging") || specialtyLower.includes("lab")) && (category === "DIAGNOSTIC_CENTER") ||
    (specialtyLower.includes("pharmacy")) && (category === "PHARMACY") ||
    (specialtyLower.includes("emergency")) && (category === "HOSPITAL" || category === "GOVERNMENT_HOSPITAL")
  );

  const specialtyArrayMatch = facilitySpecialties.some((s) =>
    s.includes(specialtyLower) || specialtyLower.includes(s.split(" ")[0])
  );

  const nameLower = fac.name.toLowerCase();
  const nameSpecialtyHint = (
    ((specialtyLower.includes("derma") || specialtyLower.includes("skin")) && (nameLower.includes("skin") || nameLower.includes("derma"))) ||
    ((specialtyLower.includes("dent") || specialtyLower.includes("oral")) && (nameLower.includes("dental") || nameLower.includes("dentist") || nameLower.includes("tooth") || nameLower.includes("teeth") || nameLower.includes("oral care"))) ||
    ((specialtyLower.includes("ophthalm") || specialtyLower.includes("eye")) && (nameLower.includes("eye ") || nameLower.includes("eye clinic") || nameLower.includes("eye hospital") || nameLower.includes("netralaya") || nameLower.includes("vision") || nameLower.includes("ophthalm"))) ||
    ((specialtyLower.includes("optometr") || specialtyLower.includes("optic")) && (nameLower.includes("optic") || nameLower.includes("optometr") || nameLower.includes("spectacle") || nameLower.includes("lens"))) ||
    ((specialtyLower.startsWith("ent") || specialtyLower.includes("otolaryng")) && (nameLower.includes("ent ") || nameLower.includes("ent clinic") || nameLower.includes("ent hospital") || nameLower.includes("ear, nose"))) ||
    ((specialtyLower.includes("cardio") || specialtyLower.includes("heart")) && (nameLower.includes("cardio") || nameLower.includes("heart"))) ||
    (specialtyLower.includes("ortho") && (nameLower.includes("ortho") || nameLower.includes("bone") || nameLower.includes("joint"))) ||
    ((specialtyLower.includes("paed") || specialtyLower.includes("pediatr")) && (nameLower.includes("child") || nameLower.includes("pediatric") || nameLower.includes("kids"))) ||
    ((specialtyLower.includes("diagnost") || specialtyLower.includes("imaging") || specialtyLower.includes("lab")) && (nameLower.includes("diagnostic") || nameLower.includes("scan") || nameLower.includes("lab"))) ||
    (specialtyLower.includes("pharmacy") && (nameLower.includes("pharmacy") || nameLower.includes("medicals") || nameLower.includes("chemist")))
  );

  if (isGeneralIntent) {
    if (category === "HOSPITAL" || category === "GOVERNMENT_HOSPITAL" || category === "PRIMARY_HEALTH_CENTRE" || category === "COMMUNITY_HEALTH_CENTRE" || category === "CLINIC") {
      clinicalRelevanceScore = 60;
      isDirectSpecialtyMatch = true;
    } else {
      clinicalRelevanceScore = 30;
    }
  } else if (directCategoryMatch || specialtyArrayMatch || nameSpecialtyHint) {
    clinicalRelevanceScore = 65;
    isDirectSpecialtyMatch = true;
  } else if (!ctx.isStrictSpecialty && (category === "HOSPITAL" || category === "GOVERNMENT_HOSPITAL" || category === "PRIMARY_HEALTH_CENTRE" || category === "COMMUNITY_HEALTH_CENTRE")) {
    // Multi-specialty / General hospital / PHC as secondary/fallback care
    clinicalRelevanceScore = 15;
    isDirectSpecialtyMatch = false;
  } else {
    clinicalRelevanceScore = 0;
    isDirectSpecialtyMatch = false;
  }

  // ── 2. DISTANCE SCORE (0–20) ──
  const dist = fac.distanceKm ?? 999;
  let distanceScore = 2;
  if (dist <= 1.0) distanceScore = 20;
  else if (dist <= 2.5) distanceScore = 16;
  else if (dist <= 5.0) distanceScore = 12;
  else if (dist <= 10.0) distanceScore = 6;

  // ── 3. FACILITY TYPE SCORE (0–8) ──
  let facilityTypeScore = 3;
  if (category === "HOSPITAL" || category === "GOVERNMENT_HOSPITAL") facilityTypeScore = 8;
  else if (category === "PRIMARY_HEALTH_CENTRE" || category === "COMMUNITY_HEALTH_CENTRE" || category === "CLINIC" || category === "SPECIALTY_CLINIC") facilityTypeScore = 5;

  // ── 4. AVAILABILITY SCORE (0–7) ──
  let availabilityScore = 2;
  if (fac.isOpen === true) availabilityScore += 3;
  if (fac.emergencyAvailable) availabilityScore += 2;

  // Total Suitability Score
  const totalScore = Math.max(10, Math.min(95, clinicalRelevanceScore + distanceScore + facilityTypeScore + availabilityScore));

  // Determine Match Tier & Label
  let matchTier: MatchTier = "GENERAL_CARE_FALLBACK";
  let recommendationLabel = "GENERAL CARE FALLBACK";

  if (isDirectSpecialtyMatch && totalScore >= 75) {
    matchTier = "BEST_SPECIALTY_MATCH";
    recommendationLabel = "★ BEST SPECIALTY MATCH";
  } else if (isDirectSpecialtyMatch) {
    matchTier = "BEST_SPECIALTY_MATCH";
    recommendationLabel = "VERIFIED SPECIALTY CARE";
  } else if (clinicalRelevanceScore > 0) {
    matchTier = "NEARBY_GENERAL_CARE";
    recommendationLabel = "NEARBY GENERAL CARE";
  }

  return {
    score: totalScore,
    isDirectSpecialtyMatch,
    matchTier,
    recommendationLabel,
    clinicalRelevanceScore,
    distanceScore,
    facilityTypeScore,
    availabilityScore,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY: Build IntentContext from plain string specialty/query params
// Used when intentContext is not directly provided (backwards compatibility)
// ─────────────────────────────────────────────────────────────────────────────
function buildLegacyContext(specialty: string, needQuery: string, service: string, isEmergency: boolean): IntentContext {
  const combined = (specialty + " " + needQuery + " " + service).toLowerCase().trim();

  const mockAnalysis: IntentAnalysisResult = {
    intent: isEmergency ? "EMERGENCY" :
      combined.includes("pharmacy") ? "FACILITY_SEARCH" :
      combined.includes("blood test") || combined.includes("x-ray") || combined.includes("lab") || combined.includes("ecg") ? "DIAGNOSTIC_TEST" :
      combined.includes("hospital") || combined.includes("clinic") ? "FACILITY_SEARCH" : "SYMPTOM",
    confidence: 0.9,
    mappedSpecialty:
      specialty ||
      (combined.includes("derma") || combined.includes("skin") ? "Dermatology" :
       combined.includes("dent") ? "Dentistry" :
       combined.includes("ophthalm") || combined.includes("eye") || combined.includes("madras") || combined.includes("vision") ? "Ophthalmology" :
       combined.includes("optometr") || combined.includes("spectacle") || combined.includes("glasses") ? "Optometry" :
       combined.includes("ent") || combined.includes("ear") || combined.includes("throat") ? "ENT (Otolaryngology)" :
       combined.includes("cardio") || combined.includes("heart") || combined.includes("ecg") ? "Cardiology" :
       combined.includes("ortho") || combined.includes("bone") || combined.includes("joint") ? "Orthopaedics" :
       combined.includes("paed") || combined.includes("child") || combined.includes("baby") ? "Paediatrics" :
       combined.includes("pharmacy") ? "Pharmacy" :
       "General Medicine"),
    clinicalCategory: "General",
    departmentName: "General",
    urgencyLevel: isEmergency ? "EMERGENCY" : "ROUTINE",
    isEmergencyRedFlag: isEmergency,
    searchQueryForCare: needQuery || specialty,
    recommendedFacilitySector: "ALL",
    suggestedActionLabel: "Find Care",
    suggestedActionHref: "/patient/find-care",
    suggestedChips: [],
  };

  return mapIntentToFacilityRequirements(mockAnalysis);
}

const ALL_HEALTHCARE_OSM_TAGS = [
  "amenity=hospital",
  "amenity=clinic",
  "amenity=pharmacy",
  "amenity=dentist",
  "healthcare=doctor",
  "healthcare=centre",
  "healthcare=hospital",
  "healthcare=clinic",
  "healthcare=dentist",
  "healthcare=pharmacy",
  "healthcare=laboratory",
  "healthcare=optometrist",
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: getNearbyFacilities
// Called identically by: Find Care page, PRAGATI Care chatbot, API routes
// ─────────────────────────────────────────────────────────────────────────────
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
  sortBy = "best_match",
  intentContext,
}: NearbySearchParams): Promise<NearbySearchResult> {
  const isOffline = typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.onLine === false;
  const lastSyncTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Build structured IntentContext for clinical recommendation
  const ctx: IntentContext = intentContext || buildLegacyContext(specialty, needQuery, service, isEmergency);

  // Exact geographic radius for map (does not silently expand)
  const mapRadiusKm = customRadiusKm !== undefined ? customRadiusKm : initialRadiusKm;
  let recommendationRadiusKm = mapRadiusKm;
  let isExpandedRadius = false;

  // ── 1. MAP DISCOVERY LAYER: Fetch ALL nearby healthcare facilities ──
  let broadGoogleFacilities: FacilityWithMeta[] = [];
  let broadOsmFacilities: FacilityWithMeta[] = [];

  if (!isOffline) {
    try {
      broadGoogleFacilities = await fetchAllNearbyHealthcare(lat, lng, Math.max(mapRadiusKm, 5));
    } catch (e) {
      console.warn("[facilityService] Broad Google Places search error:", e);
    }
  }

  // Also query specialty-specific Google Places if user asked for a specific specialty
  let specialtyGoogleFacilities: FacilityWithMeta[] = [];
  if (!isOffline && ctx.specialty !== "General Medicine") {
    try {
      specialtyGoogleFacilities = await fetchGooglePlaces(lat, lng, Math.max(mapRadiusKm, 8), ctx);
    } catch (e) {
      console.warn("[facilityService] Specialty Google Places error:", e);
    }
  }

  // Fallback OSM if needed
  if (!isOffline && broadGoogleFacilities.length < 3 && specialtyGoogleFacilities.length < 2) {
    try {
      broadOsmFacilities = await fetchOverpassOSM(lat, lng, Math.max(mapRadiusKm, 8), ALL_HEALTHCARE_OSM_TAGS);
    } catch (e) {
      console.warn("[facilityService] Broad OSM search error:", e);
    }
  }

  // PRAGATI Verified Registry
  const verifiedFacilities = getVerifiedRegistry(lat, lng);

  // ── 2. COMBINE & DEDUPLICATE ALL DISCOVERED FACILITIES ──
  let rawAllDiscovered = deduplicateFacilities([
    ...specialtyGoogleFacilities,
    ...broadGoogleFacilities,
    ...broadOsmFacilities,
    ...verifiedFacilities,
  ]);

  // Recalculate distance from user GPS
  rawAllDiscovered = rawAllDiscovered.map((f) => {
    const dist = haversineKm(lat, lng, f.lat, f.lng);
    return {
      ...f,
      distanceKm: dist,
      travelMinutes: calculateTravelMinutes(dist),
    };
  });

  // Sector filter helper
  const filterBySector = (list: FacilityWithMeta[]) => {
    if (facilityType === "GOVERNMENT") {
      return list.filter(
        (f) => f.ownershipSector === "GOVERNMENT" || f.ownership === "government" || f.facilityType.startsWith("GOVERNMENT")
      );
    }
    if (facilityType === "PRIVATE") {
      return list.filter(
        (f) =>
          f.ownershipSector === "PRIVATE" ||
          f.ownership === "private" ||
          f.ownership === "private_empaneled" ||
          f.facilityType.startsWith("PRIVATE") ||
          f.facilityType === "DIAGNOSTIC_CENTER" ||
          f.facilityType === "PHARMACY"
      );
    }
    return list;
  };

  // ── MAP LAYER: Strict geographic radius filter (NO specialty exclusions) ──
  let mapFacilities = rawAllDiscovered.filter((f) => (f.distanceKm ?? 999) <= mapRadiusKm);
  mapFacilities = filterBySector(mapFacilities);
  // Sort map facilities by distance
  mapFacilities.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  // ── 3. RECOMMENDATION LAYER: Apply specialty filtering & scoring ──
  let clinicalCandidates = applyHardExclusions(rawAllDiscovered, ctx);
  clinicalCandidates = filterBySector(clinicalCandidates);

  // Filter clinical candidates by radius (with adaptive expansion only if radius wasn't manually set)
  let inClinicalRadius: FacilityWithMeta[] = [];
  if (customRadiusKm !== undefined) {
    inClinicalRadius = clinicalCandidates.filter((f) => (f.distanceKm ?? 999) <= customRadiusKm);
    recommendationRadiusKm = customRadiusKm;
  } else {
    recommendationRadiusKm = 5;
    inClinicalRadius = clinicalCandidates.filter((f) => (f.distanceKm ?? 999) <= recommendationRadiusKm);

    if (inClinicalRadius.length < 2) {
      recommendationRadiusKm = 10;
      inClinicalRadius = clinicalCandidates.filter((f) => (f.distanceKm ?? 999) <= recommendationRadiusKm);
      isExpandedRadius = true;
    }
    if (inClinicalRadius.length < 1) {
      recommendationRadiusKm = 25;
      inClinicalRadius = clinicalCandidates.filter((f) => (f.distanceKm ?? 999) <= recommendationRadiusKm);
      isExpandedRadius = true;
    }
  }

  // Suitability scoring
  let hasSpecialtyMatch = false;
  const scoredClinical = inClinicalRadius.map((fac) => {
    const res = calculateSuitabilityScore(fac, ctx);
    if (res.isDirectSpecialtyMatch) hasSpecialtyMatch = true;
    return {
      ...fac,
      matchScore: res.score,
      recommendationLabel: res.recommendationLabel,
      matchTier: res.matchTier,
      isDirectSpecialtyMatch: res.isDirectSpecialtyMatch,
      clinicalRelevanceScore: res.clinicalRelevanceScore,
      distanceScore: res.distanceScore,
      facilityTypeScore: res.facilityTypeScore,
      availabilityScore: res.availabilityScore,
      _isDirectSpecialtyMatch: res.isDirectSpecialtyMatch,
    };
  });

  // Strict specialty check: If strict specialty (e.g. Dentistry, Optometry, Pharmacy) and NO direct specialty match, do not fill with unrelated facilities
  let eligibleClinical = scoredClinical;
  if (ctx.isStrictSpecialty && !hasSpecialtyMatch) {
    eligibleClinical = [];
  }

  // Ranking: Direct Specialty matches ALWAYS rank before non-specialty matches
  const sortedClinical = eligibleClinical.sort((a, b) => {
    const aMatch = a._isDirectSpecialtyMatch;
    const bMatch = b._isDirectSpecialtyMatch;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;

    // Both are direct matches or both are fallbacks: sort by score first
    const scoreDiff = (b.matchScore ?? 0) - (a.matchScore ?? 0);
    if (Math.abs(scoreDiff) >= 8) return scoreDiff;
    // When score difference is within 8 points, closer facility ranks higher
    return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
  });

  const finalClinicalFacilities = sortedClinical.map(({ _isDirectSpecialtyMatch, ...fac }) => fac as FacilityWithMeta);

  const primarySource =
    broadGoogleFacilities.length > 0 || specialtyGoogleFacilities.length > 0
      ? "google_places"
      : broadOsmFacilities.length > 0
      ? "openstreetmap"
      : "pragati_verified";

  return {
    facilities: finalClinicalFacilities,
    allNearbyFacilities: mapFacilities,
    searchRadiusKm: mapRadiusKm,
    totalInRadius: finalClinicalFacilities.length,
    totalGeographicFacilities: mapFacilities.length,
    isBestMatchMode: sortBy === "best_match",
    isExpandedRadius: isExpandedRadius && customRadiusKm === undefined,
    hasSpecialtyMatch,
    noSpecialtyFacilitiesFound: !hasSpecialtyMatch && ctx.isStrictSpecialty,
    queryAnalyzed: {
      specialtyRequired: ctx.specialty,
      isStrictSpecialty: ctx.isStrictSpecialty,
      isUrgent: ctx.isEmergency,
      primarySource,
    },
    isOffline,
    lastSyncTime,
  };
}

/**
 * Canonical unified healthcare facility discovery function.
 * Shared identically between Find Care and PRAGATI Care chatbot.
 */
export async function findRelevantHealthcareFacilities(params: {
  query?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  customRadiusKm?: number;
  facilityType?: "ALL" | "GOVERNMENT" | "PRIVATE";
  sortBy?: "nearest" | "best_match";
}): Promise<NearbySearchResult> {
  const effectiveLat = params.latitude ?? params.lat ?? 12.8696;
  const effectiveLng = params.longitude ?? params.lng ?? 80.2200;
  const effectiveRadius = params.radius ?? params.customRadiusKm;
  const query = params.query || "";

  let intentCtx: IntentContext | undefined = undefined;
  if (query && query.trim().length > 0) {
    const analysis = healthcareIntentRouter.classifyIntent(query);
    intentCtx = mapIntentToFacilityRequirements(analysis);
  }

  return getNearbyFacilities({
    lat: effectiveLat,
    lng: effectiveLng,
    needQuery: query,
    customRadiusKm: effectiveRadius,
    facilityType: params.facilityType || "ALL",
    sortBy: params.sortBy || "best_match",
    intentContext: intentCtx,
  });
}

/**

 * Returns emergency facilities strictly sorted by proximity.
 */
export async function getEmergencyFacilities(
  lat: number,
  lng: number,
  facilityType: "ALL" | "GOVERNMENT" | "PRIVATE" = "ALL"
): Promise<FacilityWithMeta[]> {
  const res = await getNearbyFacilities({ lat, lng, isEmergency: true, facilityType, sortBy: "nearest" });
  return res.facilities.filter((f) => f.emergencyCapability || f.emergencyAvailable);
}

/**
 * Returns single facility details by ID.
 */
export async function getFacilityDetails(id: string, userLat?: number, userLng?: number): Promise<FacilityWithMeta | null> {
  const fac = DEMO_FACILITIES.find((f) => f.id === id);
  if (!fac) return null;
  const dist = userLat !== undefined && userLng !== undefined ? haversineKm(userLat, userLng, fac.lat, fac.lng) : undefined;
  return {
    ...fac,
    category: "HOSPITAL",
    source: (fac.source || "pragati_verified") as FacilityWithMeta["source"],
    distanceKm: dist,
    travelMinutes: dist !== undefined ? calculateTravelMinutes(dist) : undefined,
  };
}
