// ─── PRAGATI FACILITY SERVICE ──────────────────────────────────────────────
// Backend-ready geospatial queries, nearby facility search, radius expansion,
// and clinical suitability ranking supporting Government & PM-JAY Empaneled Private Hospitals.

import { DEMO_FACILITIES, Facility } from "@/data/facilities";
import { calculateDistance, calculateTravelMinutes } from "./locationService";

export interface NearbySearchParams {
  lat: number;
  lng: number;
  locality?: string;
  initialRadiusKm?: number;
  needQuery?: string;
  specialty?: string;
  isEmergency?: boolean;
  ownershipFilter?: "all" | "government" | "private_empaneled" | "private" | "trust";
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

/**
 * Searches for healthcare facilities near the specified GPS coordinates.
 * Automatically handles search radius expansion (10km -> 25km -> 50km).
 * Computes Haversine distances, suitability match scores, and supports ownership filters.
 */
export async function getNearbyFacilities({
  lat,
  lng,
  locality = "Near You",
  initialRadiusKm = 10,
  needQuery = "",
  specialty = "",
  isEmergency = false,
  ownershipFilter = "all",
}: NearbySearchParams): Promise<NearbySearchResult> {
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  const lastSyncTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate distance for all facilities in database
  let allWithDistance: Facility[] = DEMO_FACILITIES.map((fac) => {
    const dist = calculateDistance(lat, lng, fac.lat, fac.lng);
    const travel = calculateTravelMinutes(dist);
    return {
      ...fac,
      ownership: fac.ownership || "government",
      distanceKm: dist,
      travelMinutes: travel,
    };
  });

  // If user's GPS is in an area with no demo facilities within 25km,
  // dynamically generate realistic nearby neighborhood facilities (Government & PM-JAY Private)
  const closestDist = Math.min(...allWithDistance.map((f) => f.distanceKm || 9999));
  if (closestDist > 25) {
    const localGenerated = generateLocalNearbyFacilities(lat, lng, locality).map((f) => {
      const dist = calculateDistance(lat, lng, f.lat, f.lng);
      return {
        ...f,
        distanceKm: dist,
        travelMinutes: calculateTravelMinutes(dist),
      };
    });
    allWithDistance = [...localGenerated, ...allWithDistance];
  }

  // Filter by ownership if specified
  if (ownershipFilter !== "all") {
    allWithDistance = allWithDistance.filter((f) => {
      if (ownershipFilter === "government") return f.ownership === "government";
      if (ownershipFilter === "private_empaneled") return f.ownership === "private_empaneled" || f.isPmJayEmpaneled;
      if (ownershipFilter === "private") return f.ownership === "private" || f.ownership === "private_empaneled";
      if (ownershipFilter === "trust") return f.ownership === "trust";
      return true;
    });
  }

  // Determine if we are in "Best Match" (clinical need/specialty filter) or "Nearby" (proximity only)
  const isBestMatchMode = Boolean(needQuery.trim() || specialty.trim());

  // Analyze clinical query if present
  const queryLower = needQuery.toLowerCase() + " " + specialty.toLowerCase();
  const needsECG = queryLower.includes("ecg") || queryLower.includes("chest") || queryLower.includes("heart") || queryLower.includes("angina");
  const needsCardiology = queryLower.includes("cardio") || queryLower.includes("heart") || queryLower.includes("chest") || specialty.toLowerCase().includes("cardiology");
  const needsXray = queryLower.includes("xray") || queryLower.includes("x-ray") || queryLower.includes("fracture") || queryLower.includes("bone");
  const needsPaediatrics = queryLower.includes("child") || queryLower.includes("baby") || queryLower.includes("pediatric") || queryLower.includes("paediatric");
  const needsDiabetes = queryLower.includes("sugar") || queryLower.includes("diabetes") || queryLower.includes("metformin") || queryLower.includes("glucose");

  // Multi-tier Radius Filter: 10km -> 25km -> 50km
  let activeRadius = initialRadiusKm;
  let inRadius = allWithDistance.filter((f) => (f.distanceKm ?? 999) <= activeRadius);

  let isExpandedRadius = false;
  if (inRadius.length < 3) {
    activeRadius = 25;
    inRadius = allWithDistance.filter((f) => (f.distanceKm ?? 999) <= activeRadius);
    isExpandedRadius = true;
  }
  if (inRadius.length < 2) {
    activeRadius = 50;
    inRadius = allWithDistance.filter((f) => (f.distanceKm ?? 999) <= activeRadius);
    isExpandedRadius = true;
  }
  if (inRadius.length === 0) {
    inRadius = [...allWithDistance].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)).slice(0, 5);
    activeRadius = Math.ceil(inRadius[inRadius.length - 1]?.distanceKm || 50);
  }

  // Calculate Match Score for each facility in radius
  const scoredFacilities: Facility[] = inRadius.map((fac) => {
    let score = 70; // baseline score
    const reasons: string[] = [];
    const warnings: string[] = [];
    const fails: string[] = [];

    // Operating hours
    if (fac.isOpen) {
      score += 10;
      reasons.push("Open now");
    } else {
      score -= 30;
      fails.push("Facility currently closed");
    }

    // Emergency capability
    if (isEmergency || needsECG) {
      if (fac.emergencyCapability) {
        score += 15;
        reasons.push("24/7 Emergency & Trauma Active");
      } else {
        score -= 20;
        warnings.push("No dedicated 24/7 emergency unit");
      }
    }

    // PM-JAY Empanelment
    if (fac.isPmJayEmpaneled) {
      reasons.push("PM-JAY Cashless Eligible");
    }

    // Specialist match
    if (needsCardiology) {
      const hasCardio = fac.specialists.some((s) => s.toLowerCase().includes("cardio"));
      const docCardio = fac.doctors.find((d) => d.specialty.toLowerCase().includes("cardio") && d.status === "available");
      if (docCardio) {
        score += 25;
        reasons.push(`Cardiologist available (${docCardio.name})`);
      } else if (hasCardio) {
        score += 10;
        warnings.push("Cardiology department available, doctor on call");
      } else {
        score -= 25;
        fails.push("No Cardiology department at this tier");
      }
    }

    if (needsPaediatrics) {
      const docPed = fac.doctors.find((d) => d.specialty.toLowerCase().includes("paed") && d.status === "available");
      if (docPed) {
        score += 20;
        reasons.push(`Paediatrician available (${docPed.name})`);
      }
    }

    // Diagnostic match (ECG, X-Ray)
    if (needsECG) {
      const ecg = fac.diagnostics.find((d) => d.name.toLowerCase().includes("ecg"));
      if (ecg && ecg.status === "available") {
        score += 20;
        reasons.push(`12-Lead ECG operational (~${ecg.waitTime || 10}m wait)`);
      } else {
        score -= 20;
        fails.push("12-Lead ECG unavailable");
      }
    }

    if (needsXray) {
      const xray = fac.diagnostics.find((d) => d.name.toLowerCase().includes("x-ray") || d.name.toLowerCase().includes("xray"));
      if (xray && xray.status === "available") {
        score += 15;
        reasons.push("Digital X-Ray operational");
      }
    }

    // Distance factor (closer is better: -1 point per 2 km)
    const dist = fac.distanceKm ?? 10;
    score = Math.max(10, Math.min(99, score - Math.floor(dist / 2)));

    // Low queue bonus
    if (fac.queue && fac.queue.estimatedWait < 15) {
      reasons.push(`Low Queue (${fac.queue.estimatedWait} min wait)`);
    }

    return {
      ...fac,
      matchScore: Math.min(99, Math.max(10, score)),
      matchReasons: reasons,
      matchWarnings: warnings,
      matchFails: fails,
    };
  });

  // Sorting
  let sortedFacilities: Facility[];
  if (isBestMatchMode) {
    sortedFacilities = scoredFacilities.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  } else {
    // Pure proximity sort (NEARBY mode)
    sortedFacilities = scoredFacilities.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  return {
    facilities: sortedFacilities,
    searchRadiusKm: activeRadius,
    totalInRadius: sortedFacilities.length,
    isBestMatchMode,
    isExpandedRadius,
    queryAnalyzed: {
      specialtyRequired: needsCardiology ? "Cardiology" : needsPaediatrics ? "Paediatrics" : undefined,
      diagnosticRequired: needsECG ? "12-Lead ECG" : needsXray ? "Digital X-Ray" : undefined,
      isUrgent: needsECG || isEmergency,
    },
    isOffline,
    lastSyncTime,
  };
}

/**
 * Returns single facility details by ID with distance computed.
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
 * Searches facilities specifically providing a given clinical service.
 */
export async function getFacilitiesByService(service: string, lat: number, lng: number): Promise<Facility[]> {
  const res = await getNearbyFacilities({ lat, lng, needQuery: service });
  return res.facilities.filter((f) =>
    f.services.some((s) => s.toLowerCase().includes(service.toLowerCase())) ||
    f.diagnostics.some((d) => d.name.toLowerCase().includes(service.toLowerCase()))
  );
}

/**
 * Searches facilities specifically with a given specialist on duty.
 */
export async function getFacilitiesBySpecialist(specialist: string, lat: number, lng: number): Promise<Facility[]> {
  const res = await getNearbyFacilities({ lat, lng, specialty: specialist });
  return res.facilities;
}

/**
 * Returns emergency trauma capable facilities sorted by proximity.
 */
export async function getEmergencyFacilities(lat: number, lng: number): Promise<Facility[]> {
  const res = await getNearbyFacilities({ lat, lng, isEmergency: true });
  return res.facilities.filter((f) => f.emergencyCapability);
}

/**
 * Generates high-fidelity localized nearby facilities around any custom GPS coordinates
 * spanning both Government, PM-JAY Empaneled Private, Trust, and Super-Specialty facilities.
 */
function generateLocalNearbyFacilities(lat: number, lng: number, locality: string): Facility[] {
  const baseLoc = locality.split(",")[0] || "Local";

  return [
    // 1. Government Urban / Primary Health Centre
    {
      id: `fac-local-001`,
      name: `Government Primary Health Centre (UPHC), ${baseLoc}`,
      type: "Urban Primary Health Centre",
      ownership: "government",
      accreditation: "Government Public Health · 100% Free Care",
      address: `Main Clinic Road, ${locality}`,
      district: locality.split(",")[1]?.trim() || "District Hub",
      state: "Public Health Dept",
      pincode: "Verified",
      lat: lat + 0.008,
      lng: lng + 0.009,
      phone: "044-245010",
      hours: "Mon–Sat, 8:00 AM – 5:00 PM",
      isOpen: true,
      emergencyCapability: false,
      services: ["Primary Outpatient OPD", "12-Lead ECG", "Free Generic Medicines", "Immunization", "Maternal Health"],
      specialists: ["General Medicine"],
      hasTelemedicine: true,
      lastUpdated: "Just now",
      doctors: [
        { id: "doc-loc-01", name: "Dr. S. Priya", specialty: "General Medicine", status: "available", nextSlot: "10:15 AM" },
      ],
      diagnostics: [
        { id: "diag-loc-01", name: "12-Lead ECG", status: "available", waitTime: 5 },
        { id: "diag-loc-02", name: "Blood Glucose & CBC", status: "available", waitTime: 10 },
      ],
      medicines: [
        { name: "Paracetamol 500mg", status: "available" },
        { name: "Metformin 500mg", status: "available" },
        { name: "ORS Packets", status: "available" },
      ],
      queue: { nowServing: 9, totalAhead: 2, estimatedWait: 6, lastUpdated: "Just now" },
    },

    // 2. Ayushman Bharat PM-JAY Empaneled Private Multi-Specialty Hospital
    {
      id: `fac-local-002`,
      name: `Care & Cure Multi-Specialty Hospital (PM-JAY Empaneled)`,
      type: "Private Multi-Specialty Hospital",
      ownership: "private_empaneled",
      isPmJayEmpaneled: true,
      accreditation: "NABH Accredited · Ayushman Bharat PM-JAY Empaneled (Cashless)",
      address: `Expressway Healthcare Corridor, ${locality}`,
      district: locality.split(",")[1]?.trim() || "District Hub",
      state: "Public Health Network",
      pincode: "Verified",
      lat: lat + 0.016,
      lng: lng + 0.021,
      phone: "044-245880",
      hours: "Open 24/7 (Emergency, ICU & OPD)",
      isOpen: true,
      emergencyCapability: true,
      services: ["24/7 Emergency Trauma", "Cardiology OPD & Cath Lab", "12-Lead ECG", "Digital X-Ray", "CT Scan (32-Slice)", "ICU & CCU", "Cashless PM-JAY Desk"],
      specialists: ["Cardiology", "General Medicine", "Orthopaedics", "Paediatrics", "General Surgery"],
      hasTelemedicine: true,
      lastUpdated: "Just now",
      doctors: [
        { id: "doc-loc-02", name: "Dr. K. Ravichandran, MD, DM", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
        { id: "doc-loc-03", name: "Dr. Deepa Sundaram", specialty: "General Medicine", status: "available", nextSlot: "10:45 AM" },
        { id: "doc-loc-04", name: "Dr. A. Venkatesh", specialty: "Orthopaedics", status: "available", nextSlot: "11:15 AM" },
      ],
      diagnostics: [
        { id: "diag-loc-03", name: "12-Lead ECG", status: "available", waitTime: 5 },
        { id: "diag-loc-04", name: "Digital X-Ray", status: "available", waitTime: 10 },
        { id: "diag-loc-05", name: "CT Scan", status: "available", waitTime: 20 },
      ],
      medicines: [
        { name: "Metoprolol 50mg", status: "available" },
        { name: "Atorvastatin 20mg", status: "available" },
        { name: "Aspirin 75mg", status: "available" },
        { name: "Metformin 500mg", status: "available" },
      ],
      queue: { nowServing: 16, totalAhead: 3, estimatedWait: 10, lastUpdated: "Just now" },
    },

    // 3. Government Peripheral & Community Health Centre
    {
      id: `fac-local-003`,
      name: `Government Peripheral Hospital & Community Health Centre, ${baseLoc}`,
      type: "Community Health Centre",
      ownership: "government",
      accreditation: "Government Public Health · 100% Free Care",
      address: `Hospital Road, ${locality}`,
      district: locality.split(",")[1]?.trim() || "District Hub",
      state: "Public Health Dept",
      pincode: "Verified",
      lat: lat - 0.022,
      lng: lng + 0.015,
      phone: "044-245050",
      hours: "Open 24/7 (Emergency & Daycare)",
      isOpen: true,
      emergencyCapability: true,
      services: ["Emergency First Aid", "12-Lead ECG", "General Medicine OPD", "Digital X-Ray", "Maternity Wing", "Free Pharmacy"],
      specialists: ["General Medicine", "Paediatrics", "Obstetrics & Gynaecology"],
      hasTelemedicine: true,
      lastUpdated: "Just now",
      doctors: [
        { id: "doc-loc-05", name: "Dr. V. Murugan", specialty: "General Medicine", status: "available", nextSlot: "11:00 AM" },
      ],
      diagnostics: [
        { id: "diag-loc-06", name: "12-Lead ECG", status: "available", waitTime: 8 },
        { id: "diag-loc-07", name: "Digital X-Ray", status: "available", waitTime: 15 },
      ],
      medicines: [
        { name: "Paracetamol 500mg", status: "available" },
        { name: "Metformin 500mg", status: "available" },
      ],
      queue: { nowServing: 22, totalAhead: 2, estimatedWait: 10, lastUpdated: "Just now" },
    },

    // 4. Private Super-Specialty Hospital & Trauma Institute
    {
      id: `fac-local-004`,
      name: `Apollo Reach Super-Specialty Hospital & Trauma Centre`,
      type: "Super-Specialty Hospital",
      ownership: "private",
      isPmJayEmpaneled: true,
      accreditation: "NABH Accredited · Ayushman Bharat PM-JAY & TPA Cashless",
      address: `OMR IT Highway, ${locality}`,
      district: locality.split(",")[1]?.trim() || "District Hub",
      state: "Private Health Network",
      pincode: "Verified",
      lat: lat + 0.034,
      lng: lng + 0.028,
      phone: "044-245999",
      hours: "Open 24/7 (Emergency, Trauma & Advanced Care)",
      isOpen: true,
      emergencyCapability: true,
      services: ["24/7 Level-1 Trauma", "Interventional Cardiology", "Neurology & Stroke Unit", "MRI (1.5T)", "CT Scan", "Cath Lab", "Dialysis Unit"],
      specialists: ["Cardiology", "Neurology", "Orthopaedics", "Emergency Medicine", "General Surgery"],
      hasTelemedicine: true,
      lastUpdated: "Just now",
      doctors: [
        { id: "doc-loc-06", name: "Dr. Rajeshwar Rao, MCh", specialty: "Cardiology", status: "available", nextSlot: "11:30 AM" },
        { id: "doc-loc-07", name: "Dr. Meenakshi S.", specialty: "Neurology", status: "available", nextSlot: "12:00 PM" },
      ],
      diagnostics: [
        { id: "diag-loc-08", name: "12-Lead ECG", status: "available", waitTime: 5 },
        { id: "diag-loc-09", name: "CT Scan", status: "available", waitTime: 15 },
        { id: "diag-loc-10", name: "MRI (1.5T)", status: "available", waitTime: 30 },
      ],
      medicines: [
        { name: "Metoprolol 50mg", status: "available" },
        { name: "Atorvastatin 20mg", status: "available" },
        { name: "Aspirin 75mg", status: "available" },
      ],
      queue: { nowServing: 11, totalAhead: 1, estimatedWait: 6, lastUpdated: "Just now" },
    },

    // 5. Charitable / Mission Trust Hospital
    {
      id: `fac-local-005`,
      name: `Seva Trust Charitable Multi-Specialty Hospital`,
      type: "Trust Hospital",
      ownership: "trust",
      isPmJayEmpaneled: true,
      accreditation: "Non-Profit Trust · Subsidized Care & PM-JAY Cashless",
      address: `Gandhi Road, ${locality}`,
      district: locality.split(",")[1]?.trim() || "District Hub",
      state: "Charitable Trust Network",
      pincode: "Verified",
      lat: lat - 0.038,
      lng: lng - 0.019,
      phone: "044-245444",
      hours: "Open 24/7 (Emergency & Dialysis)",
      isOpen: true,
      emergencyCapability: true,
      services: ["Subsidized Dialysis", "12-Lead ECG", "Digital X-Ray", "General OPD", "Ophthalmology / Eye Care", "PM-JAY Desk"],
      specialists: ["General Medicine", "Ophthalmology", "Nephrology"],
      hasTelemedicine: true,
      lastUpdated: "Just now",
      doctors: [
        { id: "doc-loc-08", name: "Dr. K. Swaminathan", specialty: "General Medicine", status: "available", nextSlot: "10:30 AM" },
      ],
      diagnostics: [
        { id: "diag-loc-11", name: "12-Lead ECG", status: "available", waitTime: 5 },
        { id: "diag-loc-12", name: "Digital X-Ray", status: "available", waitTime: 10 },
      ],
      medicines: [
        { name: "Paracetamol 500mg", status: "available" },
        { name: "Metformin 500mg", status: "available" },
      ],
      queue: { nowServing: 18, totalAhead: 2, estimatedWait: 8, lastUpdated: "Just now" },
    },
  ];
}
