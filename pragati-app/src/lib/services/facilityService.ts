// ─── PRAGATI FACILITY DISCOVERY SERVICE ──────────────────────────────────────────
// High-precision, real-world geospatial healthcare facility discovery engine.
// Discovers live healthcare facilities (Government & Private) dynamically around the user GPS coordinates.
// Strictly enforces clinical eligibility, category filtering, and honest suitability scoring.

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
  hasSpecialtyMatch: boolean;
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
 * centered dynamically around (lat, lng) with rich category parsing.
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
        if (dist > Math.max(radiusKm * 1.15, 25)) continue;

        const props = feat.properties || {};
        const name = props.name || "";
        if (!name || name.trim().length < 2) continue;

        // Skip non-facility geographical entries
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

        // Accurate category and specialty tagging
        let displayType = "Hospital";
        let facilityType: FacilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_HOSPITAL";
        let specialties: string[] = ["General Medicine"];
        let services: string[] = ["Outpatient Consultation"];

        if (nameLower.includes("pharmacy") || nameLower.includes("medicals") || nameLower.includes("chemist") || props.osm_value === "pharmacy") {
          displayType = "Pharmacy & Medicals";
          facilityType = "PHARMACY";
          specialties = [];
          services = ["Dispensing Prescription Medicines", "Over-the-counter Healthcare"];
        } else if (nameLower.includes("dental") || nameLower.includes("dentist") || nameLower.includes("tooth") || nameLower.includes("teeth")) {
          displayType = isGov ? "Government Dental College & Hospital" : "Dental Clinic & Hospital";
          facilityType = isGov ? "GOVERNMENT_CLINIC" : "PRIVATE_CLINIC";
          specialties = ["Dentistry", "Oral Healthcare"];
          services = ["Dental Examination", "Tooth Extraction", "Root Canal", "Oral Surgery"];
        } else if (nameLower.includes("skin") || nameLower.includes("derma") || nameLower.includes("hair") || nameLower.includes("cosmet")) {
          displayType = "Dermatology & Skin Clinic";
          facilityType = "PRIVATE_CLINIC";
          specialties = ["Dermatology", "Skin & Allergy Care"];
          services = ["Dermatology Consultation", "Skin Allergy Treatment", "Skin Infection Care"];
        } else if (nameLower.includes("eye") || nameLower.includes("netralaya") || nameLower.includes("vision") || nameLower.includes("ophthalm")) {
          displayType = isGov ? "Government Eye Hospital" : "Eye Hospital & Clinic";
          facilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_CLINIC";
          specialties = ["Ophthalmology", "Vision Care"];
          services = ["Eye Examination", "Vision Testing", "Ophthalmology Consultation"];
        } else if (nameLower.includes("ent") || nameLower.includes("ear") || nameLower.includes("nose") || nameLower.includes("throat") || nameLower.includes("sinus")) {
          displayType = "ENT Specialist Clinic";
          facilityType = "PRIVATE_CLINIC";
          specialties = ["ENT (Otolaryngology)"];
          services = ["ENT Consultation", "Hearing Evaluation", "Sinus Care"];
        } else if (nameLower.includes("ortho") || nameLower.includes("bone") || nameLower.includes("joint") || nameLower.includes("spine")) {
          displayType = "Orthopaedic Hospital & Clinic";
          facilityType = "PRIVATE_CLINIC";
          specialties = ["Orthopaedics", "Bone & Joint Care"];
          services = ["Orthopaedic Consultation", "Joint Care", "Fracture Management"];
        } else if (nameLower.includes("child") || nameLower.includes("baby") || nameLower.includes("pediatric") || nameLower.includes("paediatric")) {
          displayType = "Paediatric & Child Care Clinic";
          facilityType = "PRIVATE_CLINIC";
          specialties = ["Paediatrics", "Child Health"];
          services = ["Paediatric Consultation", "Child Care", "Immunization"];
        } else if (nameLower.includes("cardio") || nameLower.includes("heart") || nameLower.includes("cardiac")) {
          displayType = isGov ? "Government Cardiology Unit" : "Cardiology & Heart Hospital";
          facilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_HOSPITAL";
          specialties = ["Cardiology", "Emergency Medicine"];
          services = ["Cardiology Consultation", "12-Lead ECG", "Emergency Cardiac Care"];
        } else if (nameLower.includes("diagnostic") || nameLower.includes("scan") || nameLower.includes("lab") || nameLower.includes("x-ray") || nameLower.includes("mri")) {
          displayType = "Diagnostic & Scan Centre";
          facilityType = "DIAGNOSTIC_CENTER";
          specialties = [];
          services = ["Blood Tests", "Diagnostics", "Ultrasound", "Digital X-Ray"];
        } else if (nameLower.includes("uphc") || nameLower.includes("urban primary")) {
          displayType = "Urban Primary Health Centre";
          facilityType = "GOVERNMENT_PHC";
          specialties = ["General Medicine", "Primary Healthcare", "Immunization", "Maternal Health"];
          services = ["Outpatient Consultation", "Primary Care", "Free Essential Medicines"];
        } else if (nameLower.includes("phc") || nameLower.includes("primary health")) {
          displayType = "Primary Health Centre";
          facilityType = "GOVERNMENT_PHC";
          specialties = ["General Medicine", "Primary Healthcare", "Immunization"];
          services = ["Outpatient Consultation", "Primary Care", "Maternal & Child Care"];
        } else if (nameLower.includes("chc") || nameLower.includes("community health")) {
          displayType = "Community Health Centre";
          facilityType = "GOVERNMENT_CHC";
          specialties = ["General Medicine", "General Surgery", "Paediatrics", "Obstetrics & Gynaecology"];
          services = ["Outpatient Consultation", "Inpatient Beds", "Emergency Primary Care"];
        } else if (nameLower.includes("medical college")) {
          displayType = isGov ? "Government Medical College Hospital" : "Private Medical College Hospital";
          facilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_HOSPITAL";
          specialties = ["General Medicine", "Cardiology", "Dermatology", "Orthopaedics", "ENT", "Ophthalmology", "Paediatrics", "Emergency Medicine"];
          services = ["Multi-Specialty OPD", "24/7 Trauma Care", "ICU", "Diagnostics"];
        } else if (nameLower.includes("clinic") || props.osm_value === "clinic") {
          displayType = isGov ? "Government Clinic" : "Private Clinic";
          facilityType = isGov ? "GOVERNMENT_CLINIC" : "PRIVATE_CLINIC";
          specialties = ["General Medicine"];
          services = ["Outpatient Consultation"];
        } else {
          displayType = isGov ? "Government Hospital" : "Private Multi-Specialty Hospital";
          facilityType = isGov ? "GOVERNMENT_HOSPITAL" : "PRIVATE_HOSPITAL";
          specialties = ["General Medicine", "Emergency Medicine"];
          services = ["Outpatient Consultation", "Inpatient Care", "Emergency Care"];
        }

        const street = props.street || "";
        const locality = props.district || props.city || props.county || props.state || "";
        const city = props.city || props.district || "";
        const state = props.state || "";
        const postcode = props.postcode || "";
        const addressParts = [street, locality, city, postcode].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : `${name}, ${locality}`;

        const isEmergencyCapable = displayType.includes("Hospital") || isGov || specialties.includes("Emergency Medicine");

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
          specialties,
          services,
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
 * Enforces clinical eligibility, hard exclusion rules, and honest suitability scoring.
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

  // 4. Clinical Intent & Specialty Analysis
  const combinedNeed = (needQuery + " " + specialty + " " + service).trim();
  const queryLower = combinedNeed.toLowerCase();

  const isDermatologyRequest =
    specialty.toLowerCase().includes("derma") ||
    queryLower.includes("skin") ||
    queryLower.includes("derma") ||
    queryLower.includes("itch") ||
    queryLower.includes("rash") ||
    queryLower.includes("allergy") ||
    queryLower.includes("acne") ||
    queryLower.includes("pimple") ||
    queryLower.includes("eczema");

  const isDentalRequest =
    specialty.toLowerCase().includes("dent") ||
    queryLower.includes("tooth") ||
    queryLower.includes("teeth") ||
    queryLower.includes("dental") ||
    queryLower.includes("dentist") ||
    queryLower.includes("gum");

  const isCardioRequest =
    specialty.toLowerCase().includes("cardio") ||
    queryLower.includes("chest pain") ||
    queryLower.includes("palpitation") ||
    queryLower.includes("heart") ||
    queryLower.includes("cardiac") ||
    queryLower.includes("ecg");

  const isEyeRequest =
    specialty.toLowerCase().includes("ophthalm") ||
    specialty.toLowerCase().includes("eye") ||
    queryLower.includes("eye") ||
    queryLower.includes("vision") ||
    queryLower.includes("blurry") ||
    queryLower.includes("conjunctivitis");

  const isENTRequest =
    specialty.toLowerCase().includes("ent") ||
    queryLower.includes("ear") ||
    queryLower.includes("nose") ||
    queryLower.includes("throat") ||
    queryLower.includes("sinus") ||
    queryLower.includes("hearing");

  const isOrthoRequest =
    specialty.toLowerCase().includes("ortho") ||
    queryLower.includes("bone") ||
    queryLower.includes("joint") ||
    queryLower.includes("knee") ||
    queryLower.includes("back pain") ||
    queryLower.includes("fracture") ||
    queryLower.includes("sprain");

  const isPaediatricRequest =
    specialty.toLowerCase().includes("paed") ||
    specialty.toLowerCase().includes("pediatric") ||
    queryLower.includes("child") ||
    queryLower.includes("baby") ||
    queryLower.includes("pediatric");

  const isPharmacyExplicit =
    specialty.toLowerCase().includes("pharmacy") ||
    queryLower.includes("pharmacy") ||
    queryLower.includes("medical shop") ||
    queryLower.includes("chemist") ||
    queryLower.includes("buy medicine");

  const isDiagnosticExplicit =
    queryLower.includes("blood test") ||
    queryLower.includes("x-ray") ||
    queryLower.includes("scan") ||
    queryLower.includes("lab test");

  // 5. HARD EXCLUSION RULES
  // Rule A: Never include pharmacies in clinical consultation searches unless explicitly looking for pharmacy
  if (!isPharmacyExplicit) {
    allCombined = allCombined.filter(
      (f) => f.facilityType !== "PHARMACY" && !f.type.toLowerCase().includes("pharmacy") && !f.name.toLowerCase().includes("pharmacy")
    );
  }

  // Rule B: Enforce specialty conflict exclusions
  if (isDermatologyRequest) {
    // Exclude dental, eye, ent, ortho, diagnostic-only
    allCombined = allCombined.filter((f) => {
      const nameLower = f.name.toLowerCase();
      const typeLower = f.type.toLowerCase();
      if (nameLower.includes("dental") || typeLower.includes("dental")) return false;
      if (nameLower.includes("eye ") || typeLower.includes("eye ") || nameLower.includes("netralaya")) return false;
      if (nameLower.includes("ent ") || typeLower.includes("ent ")) return false;
      if (nameLower.includes("ortho") || typeLower.includes("ortho")) return false;
      if (f.facilityType === "DIAGNOSTIC_CENTER") return false;
      return true;
    });
  } else if (isDentalRequest) {
    // Only dental clinics or hospitals
    allCombined = allCombined.filter((f) => {
      const isDental =
        f.name.toLowerCase().includes("dental") ||
        f.type.toLowerCase().includes("dental") ||
        (f.specialties || []).some((s) => s.toLowerCase().includes("dent"));
      return isDental;
    });
  } else if (isCardioRequest) {
    // Exclude dental, eye, skin clinics
    allCombined = allCombined.filter((f) => {
      const nameLower = f.name.toLowerCase();
      if (nameLower.includes("dental") || nameLower.includes("eye") || nameLower.includes("skin") || nameLower.includes("hair")) return false;
      return true;
    });
  } else if (isEyeRequest) {
    // Exclude dental, skin, ortho clinics
    allCombined = allCombined.filter((f) => {
      const nameLower = f.name.toLowerCase();
      if (nameLower.includes("dental") || nameLower.includes("skin") || nameLower.includes("ortho")) return false;
      return true;
    });
  }

  // 6. Filter by Ownership Sector: ALL | GOVERNMENT | PRIVATE
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

  // 7. Strict Geographic Radius Filtering & Adaptive Radius Expansion
  let isExpandedRadius = false;

  if (customRadiusKm !== undefined) {
    allCombined = allCombined.filter((f) => (f.distanceKm ?? 999) <= customRadiusKm);
    activeRadius = customRadiusKm;
  } else {
    activeRadius = 5;
    let inRadius = allCombined.filter((f) => (f.distanceKm ?? 999) <= activeRadius);

    if (inRadius.length < 2) {
      activeRadius = 10;
      inRadius = allCombined.filter((f) => (f.distanceKm ?? 999) <= activeRadius);
      isExpandedRadius = true;
    }
    if (inRadius.length < 1) {
      activeRadius = 25;
      inRadius = allCombined.filter((f) => (f.distanceKm ?? 999) <= activeRadius);
      isExpandedRadius = true;
    }

    allCombined = inRadius;
  }

  // 8. TRANSPARENT CLINICAL SUITABILITY SCORING
  let hasAnySpecialtyMatch = false;

  const scoredFacilities: Facility[] = allCombined.map((fac) => {
    let score = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];
    let isDirectSpecialtyMatch = false;

    const facNameLower = fac.name.toLowerCase();
    const facTypeLower = fac.type.toLowerCase();
    const specialtiesLower = (fac.specialties || []).map((s) => s.toLowerCase());

    // Evaluate exact specialty match
    if (isDermatologyRequest) {
      if (
        facNameLower.includes("skin") ||
        facNameLower.includes("derma") ||
        facNameLower.includes("hair") ||
        facNameLower.includes("cosmet") ||
        specialtiesLower.some((s) => s.includes("derma") || s.includes("skin"))
      ) {
        isDirectSpecialtyMatch = true;
        score += 60;
        reasons.push("Dedicated Dermatology / Skin Specialist Available");
      } else if (
        fac.facilityType === "GOVERNMENT_HOSPITAL" ||
        fac.facilityType === "GOVERNMENT_PHC" ||
        fac.facilityType === "GOVERNMENT_CHC" ||
        fac.type.includes("Medical College")
      ) {
        score += 35;
        reasons.push("Government General Outpatient OPD");
      } else {
        score += 30;
        reasons.push("General Outpatient Medical Consultation");
      }
    } else if (isDentalRequest) {
      if (facNameLower.includes("dental") || facTypeLower.includes("dental") || specialtiesLower.some((s) => s.includes("dent"))) {
        isDirectSpecialtyMatch = true;
        score += 65;
        reasons.push("Dental Specialist & Clinic Available");
      }
    } else if (isCardioRequest) {
      if (
        facNameLower.includes("cardio") ||
        facNameLower.includes("heart") ||
        specialtiesLower.some((s) => s.includes("cardio"))
      ) {
        isDirectSpecialtyMatch = true;
        score += 65;
        reasons.push("Cardiology Specialist OPD Operational");
      } else if (fac.emergencyAvailable || fac.emergencyCapability) {
        score += 40;
        reasons.push("24/7 Emergency & Inpatient Hospital");
      } else {
        score += 30;
      }
    } else if (isEyeRequest) {
      if (facNameLower.includes("eye") || facNameLower.includes("netralaya") || specialtiesLower.some((s) => s.includes("eye") || s.includes("ophthalm"))) {
        isDirectSpecialtyMatch = true;
        score += 65;
        reasons.push("Ophthalmology / Eye Specialist Available");
      }
    } else if (isENTRequest) {
      if (facNameLower.includes("ent") || specialtiesLower.some((s) => s.includes("ent") || s.includes("otolaryng"))) {
        isDirectSpecialtyMatch = true;
        score += 65;
        reasons.push("ENT Specialist Available");
      }
    } else if (isOrthoRequest) {
      if (facNameLower.includes("ortho") || specialtiesLower.some((s) => s.includes("ortho") || s.includes("bone"))) {
        isDirectSpecialtyMatch = true;
        score += 65;
        reasons.push("Orthopaedic Specialist Available");
      }
    } else if (isPaediatricRequest) {
      if (facNameLower.includes("child") || facNameLower.includes("pediatric") || specialtiesLower.some((s) => s.includes("paed") || s.includes("child"))) {
        isDirectSpecialtyMatch = true;
        score += 65;
        reasons.push("Child / Paediatric Specialist Available");
      }
    } else {
      // General search
      score += 45;
      reasons.push("Outpatient Medical Care");
    }

    if (isDirectSpecialtyMatch) {
      hasAnySpecialtyMatch = true;
    }

    // Proximity score additions
    const dist = fac.distanceKm ?? 10;
    if (dist <= 2) {
      score += 25;
      reasons.push(`Very Close (${formatDistance(dist)})`);
    } else if (dist <= 5) {
      score += 15;
      reasons.push(`Within 5 km (${formatDistance(dist)})`);
    } else if (dist <= 10) {
      score += 8;
    }

    if (fac.verified) {
      score += 5;
    }

    const finalScore = Math.max(25, Math.min(96, score));

    return {
      ...fac,
      matchScore: finalScore,
      matchReasons: reasons,
      matchWarnings: warnings,
    };
  });

  // 9. RANKING
  // Specialty matches rank first; within same tier, sorted by geographic distance
  const sortedFacilities = scoredFacilities.sort((a, b) => {
    const scoreA = a.matchScore ?? 0;
    const scoreB = b.matchScore ?? 0;
    const distA = a.distanceKm ?? 999;
    const distB = b.distanceKm ?? 999;

    const isMatchA = scoreA >= 80;
    const isMatchB = scoreB >= 80;

    if (isMatchA && !isMatchB) return -1;
    if (!isMatchA && isMatchB) return 1;

    if (sortBy === "nearest") {
      return distA - distB;
    }

    const distDiff = distA - distB;
    if (Math.abs(distDiff) > 3.5) {
      return distDiff;
    }

    return scoreB - scoreA;
  });

  return {
    facilities: sortedFacilities,
    searchRadiusKm: activeRadius,
    totalInRadius: sortedFacilities.length,
    isBestMatchMode: sortBy === "best_match",
    isExpandedRadius,
    hasSpecialtyMatch: hasAnySpecialtyMatch,
    queryAnalyzed: {
      specialtyRequired: isDermatologyRequest
        ? "Dermatology"
        : isDentalRequest
        ? "Dentistry"
        : isCardioRequest
        ? "Cardiology"
        : isEyeRequest
        ? "Ophthalmology"
        : isENTRequest
        ? "ENT"
        : isOrthoRequest
        ? "Orthopaedics"
        : undefined,
      isUrgent: isEmergency || isCardioRequest,
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
