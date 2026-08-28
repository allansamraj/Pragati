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
import type { IntentAnalysisResult } from "@/lib/ai/healthcareIntentRouter";

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
  facilities: FacilityWithMeta[];
  searchRadiusKm: number;
  totalInRadius: number;
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
// LAYER 1: GOOGLE PLACES API (NEW) — server-side via /api/facilities/places-search
// ─────────────────────────────────────────────────────────────────────────────
async function fetchGooglePlaces(
  lat: number,
  lng: number,
  radiusKm: number,
  ctx: IntentContext
): Promise<FacilityWithMeta[]> {
  const cacheKey = `gpl_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}_${ctx.specialty}`;
  const cached = discoveryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  try {
    const radiusM = Math.round(radiusKm * 1000);
    const primaryTypes = ctx.primaryGoogleTypes.join(",");
    const secondaryTypes = ctx.secondaryGoogleTypes.join(",");

    const url = `/api/facilities/places-search?lat=${lat}&lng=${lng}&radius=${radiusM}&types=${encodeURIComponent(primaryTypes)}&secondaryTypes=${encodeURIComponent(secondaryTypes)}&maxResults=20`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[facilityService] Google Places route returned ${res.status}`);
      return [];
    }

    const json = await res.json();
    const raw: Record<string, unknown>[] = json.facilities || [];

    const facilities: FacilityWithMeta[] = raw
      .filter((f) => f.lat && f.lng)
      .map((f) => {
        const dist = haversineKm(lat, lng, f.lat as number, f.lng as number);
        return {
          ...(f as unknown as FacilityWithMeta),
          distanceKm: dist,
          travelMinutes: calculateTravelMinutes(dist),
          source: "google_places" as const,
        };
      });

    if (facilities.length > 0) {
      discoveryCache.set(cacheKey, { data: facilities, timestamp: Date.now() });
    }
    return facilities;
  } catch (err) {
    console.warn("[facilityService] Google Places fetch error:", err);
    return [];
  }
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
// SUITABILITY SCORING (deterministic, intent-based, NOT proximity-based)
// ─────────────────────────────────────────────────────────────────────────────
function calculateSuitabilityScore(
  fac: FacilityWithMeta,
  ctx: IntentContext
): { score: number; isDirectSpecialtyMatch: boolean } {
  let score = 0;
  let isDirectSpecialtyMatch = false;

  const category = fac.category || "OTHER";
  const facilitySpecialties = (fac.specialties || []).map((s) => s.toLowerCase());
  const specialtyLower = ctx.specialty.toLowerCase();
  const types = fac.type?.toLowerCase() || "";

  // ── A. SPECIALTY SCORE (0–65) ──
  // Direct specialty match: facility category matches the required specialty
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

  // Specialty in facility's own specialties[] array
  const specialtyArrayMatch = facilitySpecialties.some((s) =>
    s.includes(specialtyLower) || specialtyLower.includes(s.split(" ")[0])
  );

  // Name-based specialty hint (only for confirmed specialty-named facilities)
  const nameLower = fac.name.toLowerCase();
  const nameSpecialtyHint = (
    (specialtyLower.includes("derma") && (nameLower.includes("skin") || nameLower.includes("derma"))) ||
    (specialtyLower.includes("dent") && (nameLower.includes("dental") || nameLower.includes("dentist"))) ||
    (specialtyLower.includes("ophthalm") && (nameLower.includes("eye") || nameLower.includes("netralaya"))) ||
    (specialtyLower.includes("optometr") && nameLower.includes("optic")) ||
    (specialtyLower.includes("ent") && nameLower.includes("ent")) ||
    (specialtyLower.includes("cardio") && (nameLower.includes("cardio") || nameLower.includes("heart"))) ||
    (specialtyLower.includes("ortho") && nameLower.includes("ortho")) ||
    (specialtyLower.includes("paed") && (nameLower.includes("child") || nameLower.includes("pediatric"))) ||
    (specialtyLower.includes("diagnost") && (nameLower.includes("diagnostic") || nameLower.includes("scan")))
  );

  if (directCategoryMatch || specialtyArrayMatch || nameSpecialtyHint) {
    score += 65;
    isDirectSpecialtyMatch = true;
  } else if (
    // Fallback: government/general hospital when specialty is not strict
    !ctx.isStrictSpecialty && (
      category === "HOSPITAL" || category === "GOVERNMENT_HOSPITAL" ||
      category === "PRIMARY_HEALTH_CENTRE" || category === "COMMUNITY_HEALTH_CENTRE"
    )
  ) {
    score += 30;
  } else if (!ctx.isStrictSpecialty && (category === "CLINIC" || category === "SPECIALTY_CLINIC")) {
    score += 25;
  } else {
    // No relevant match — score stays 0, but facility passed exclusion filter
    score += 15;
  }

  // ── B. PROXIMITY SCORE (0–25) ──
  const dist = fac.distanceKm ?? 999;
  if (dist <= 1) score += 25;
  else if (dist <= 2) score += 20;
  else if (dist <= 5) score += 12;
  else if (dist <= 10) score += 5;

  // ── C. BONUS SCORE (0–5) ──
  if (fac.isOpen === true) score += 3;
  if (fac.verified) score += 2;

  return { score: Math.max(10, Math.min(95, score)), isDirectSpecialtyMatch };
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
       combined.includes("ophthalm") || combined.includes("eye") ? "Ophthalmology" :
       combined.includes("ent") || combined.includes("ear") ? "ENT (Otolaryngology)" :
       combined.includes("cardio") || combined.includes("heart") || combined.includes("ecg") ? "Cardiology" :
       combined.includes("ortho") || combined.includes("bone") || combined.includes("joint") ? "Orthopaedics" :
       combined.includes("paed") || combined.includes("child") ? "Paediatrics" :
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
  sortBy = "nearest",
  intentContext,
}: NearbySearchParams): Promise<NearbySearchResult> {
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  const lastSyncTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Build structured IntentContext
  const ctx: IntentContext = intentContext || buildLegacyContext(specialty, needQuery, service, isEmergency);

  let activeRadius = customRadiusKm !== undefined ? customRadiusKm : initialRadiusKm;
  let isExpandedRadius = false;

  // ── 1. GOOGLE PLACES (primary, server-side) ──
  let googleFacilities: FacilityWithMeta[] = [];
  if (!isOffline) {
    googleFacilities = await fetchGooglePlaces(lat, lng, Math.max(activeRadius, 8), ctx);
  }

  // ── 2. OSM OVERPASS (fallback/supplement) ──
  let osmFacilities: FacilityWithMeta[] = [];
  if (!isOffline && googleFacilities.length < 3) {
    osmFacilities = await fetchOverpassOSM(lat, lng, Math.max(activeRadius, 8), ctx.osmHealthcareTags);
  }

  // ── 3. PRAGATI VERIFIED REGISTRY (always included) ──
  const verifiedFacilities = getVerifiedRegistry(lat, lng);

  // ── 4. COMBINE + DEDUPLICATE ──
  let allFacilities = deduplicateFacilities([...googleFacilities, ...osmFacilities, ...verifiedFacilities]);

  // Recalculate distances from user GPS (normalize any drift)
  allFacilities = allFacilities.map((f) => ({
    ...f,
    distanceKm: haversineKm(lat, lng, f.lat, f.lng),
    travelMinutes: calculateTravelMinutes(haversineKm(lat, lng, f.lat, f.lng)),
  }));

  // ── 5. HARD EXCLUSIONS (specialty-based) ──
  allFacilities = applyHardExclusions(allFacilities, ctx);

  // ── 6. OWNERSHIP SECTOR FILTER ──
  if (facilityType === "GOVERNMENT") {
    allFacilities = allFacilities.filter(
      (f) => f.ownershipSector === "GOVERNMENT" || f.ownership === "government" || f.facilityType.startsWith("GOVERNMENT")
    );
  } else if (facilityType === "PRIVATE") {
    allFacilities = allFacilities.filter(
      (f) => f.ownershipSector === "PRIVATE" || f.ownership === "private" || f.ownership === "private_empaneled" || f.facilityType.startsWith("PRIVATE") || f.facilityType === "DIAGNOSTIC_CENTER" || f.facilityType === "PHARMACY"
    );
  }

  // ── 7. GEOGRAPHIC RADIUS FILTER (adaptive) ──
  if (customRadiusKm !== undefined) {
    allFacilities = allFacilities.filter((f) => (f.distanceKm ?? 999) <= customRadiusKm);
    activeRadius = customRadiusKm;
  } else {
    activeRadius = 5;
    let inRadius = allFacilities.filter((f) => (f.distanceKm ?? 999) <= activeRadius);
    if (inRadius.length < 2) { activeRadius = 10; inRadius = allFacilities.filter((f) => (f.distanceKm ?? 999) <= activeRadius); isExpandedRadius = true; }
    if (inRadius.length < 1) { activeRadius = 25; inRadius = allFacilities.filter((f) => (f.distanceKm ?? 999) <= activeRadius); isExpandedRadius = true; }
    allFacilities = inRadius;
  }

  // ── 8. SUITABILITY SCORING ──
  let hasSpecialtyMatch = false;
  const scoredFacilities = allFacilities.map((fac) => {
    const { score, isDirectSpecialtyMatch } = calculateSuitabilityScore(fac, ctx);
    if (isDirectSpecialtyMatch) hasSpecialtyMatch = true;
    return { ...fac, matchScore: score, _isDirectSpecialtyMatch: isDirectSpecialtyMatch };
  });

  // ── 9. RANKING (specialty matches first, then by distance) ──
  const sorted = scoredFacilities.sort((a, b) => {
    const aMatch = a._isDirectSpecialtyMatch;
    const bMatch = b._isDirectSpecialtyMatch;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    if (sortBy === "nearest") return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    const distDiff = (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    if (Math.abs(distDiff) > 3.5) return distDiff;
    return (b.matchScore ?? 0) - (a.matchScore ?? 0);
  });

  // Strip internal sort key
  const finalFacilities = sorted.map(({ _isDirectSpecialtyMatch, ...fac }) => fac as FacilityWithMeta);

  const primarySource =
    googleFacilities.length > 0 ? "google_places" :
    osmFacilities.length > 0 ? "openstreetmap" : "pragati_verified";

  return {
    facilities: finalFacilities,
    searchRadiusKm: activeRadius,
    totalInRadius: finalFacilities.length,
    isBestMatchMode: sortBy === "best_match",
    isExpandedRadius,
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
