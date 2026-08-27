// ─── PRAGATI HEALTHCARE FACILITIES DATASET ─────────────────────────────────
// Unified schema supporting Government Public Facilities, Private Hospitals,
// Private Clinics, Diagnostic Centres, and Pharmacies across regions (Chennai & Maharashtra).

export type AvailabilityStatus = "available" | "limited" | "unavailable";

export type FacilityType =
  | "GOVERNMENT_HOSPITAL"
  | "GOVERNMENT_PHC"
  | "GOVERNMENT_CHC"
  | "GOVERNMENT_CLINIC"
  | "PRIVATE_HOSPITAL"
  | "PRIVATE_CLINIC"
  | "PRIVATE_NURSING_HOME"
  | "DIAGNOSTIC_CENTER"
  | "PHARMACY";

export type OwnershipSector = "GOVERNMENT" | "PRIVATE";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: AvailabilityStatus;
  nextSlot?: string;
}

export interface Diagnostic {
  id: string;
  name: string;
  status: AvailabilityStatus;
  waitTime?: number; // minutes
}

export interface Medicine {
  name: string;
  status: AvailabilityStatus;
}

export interface QueueState {
  nowServing: number;
  totalAhead: number;
  estimatedWait: number; // minutes
  lastUpdated: string;
}

export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  ownershipSector: OwnershipSector;
  type: string; // User-facing display type
  ownership?: "government" | "private_empaneled" | "trust" | "private";
  isPmJayEmpaneled?: boolean;
  accreditation?: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  isOpen: boolean;
  doctors: Doctor[];
  diagnostics: Diagnostic[];
  medicines: Medicine[];
  queue: QueueState;
  hasTelemedicine: boolean;
  emergencyCapability: boolean;
  services: string[];
  specialists: string[];
  lastUpdated?: string;
  matchScore?: number;
  distanceKm?: number;
  travelMinutes?: number;
  matchReasons?: string[];
  matchWarnings?: string[];
  matchFails?: string[];
}

export const DEMO_FACILITIES: Facility[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ─── CHENNAI, TAMIL NADU REGION — (CURRENT DEMO PROTOTYPE DATA) ───────────
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. Government General Hospital (GGH), Park Town, Chennai
  {
    id: "fac-chn-001",
    name: "Government General Hospital (GGH), Chennai",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "Government Multi-Specialty General Hospital",
    ownership: "government",
    accreditation: "Tamil Nadu Public Health · 100% Free Care & OPD",
    address: "EVR Periyar Salai, Park Town, Near Chennai Central",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600003",
    lat: 13.0805,
    lng: 80.2778,
    phone: "044-25305000",
    hours: "Open 24/7 (Emergency, Trauma & OPD)",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Emergency Trauma", "Cardiology OPD & Cath Lab", "12-Lead ECG", "Digital X-Ray", "CT Scan (64-Slice)", "Pathology Lab", "Central Pharmacy", "ICU & CCU"],
    specialists: ["Cardiology", "General Medicine", "Paediatrics", "Orthopaedics", "General Surgery", "Neurology"],
    hasTelemedicine: true,
    lastUpdated: "Updated 4 min ago",
    doctors: [
      { id: "doc-chn-01", name: "Dr. Ananya Natarajan, MD, DM", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
      { id: "doc-chn-02", name: "Dr. S. Karthikeyan", specialty: "General Medicine", status: "available", nextSlot: "10:45 AM" },
      { id: "doc-chn-03", name: "Dr. Meera Sundaram", specialty: "Paediatrics", status: "available", nextSlot: "11:15 AM" },
      { id: "doc-chn-04", name: "Dr. K. Ravichandran", specialty: "Orthopaedics", status: "limited", nextSlot: "1:30 PM" },
    ],
    diagnostics: [
      { id: "diag-chn-01", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-chn-02", name: "Digital X-Ray", status: "available", waitTime: 12 },
      { id: "diag-chn-03", name: "CT Scan", status: "available", waitTime: 20 },
      { id: "diag-chn-04", name: "Complete Blood Chemistry & CBC", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Metformin 500mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 41, totalAhead: 2, estimatedWait: 8, lastUpdated: "Just now" },
  },

  // 2. Tamil Nadu Government Multi Super Speciality Hospital (Omandurar)
  {
    id: "fac-chn-002",
    name: "Tamil Nadu Government Multi Super Speciality Hospital (Omandurar)",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "Government Super-Speciality Hospital",
    ownership: "government",
    accreditation: "Government Public Health · 100% Free Super-Speciality Care",
    address: "Omandurar Government Estate, Anna Salai, Chennai",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600002",
    lat: 13.0674,
    lng: 80.2747,
    phone: "044-25666000",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Cardiac Emergency", "Interventional Cardiology", "Cardiothoracic Surgery", "MRI (3T)", "CT Scan", "Echo Lab", "Dialysis"],
    specialists: ["Cardiology", "Neurology", "Nephrology", "Medical Oncology", "Surgical Gastroenterology"],
    hasTelemedicine: true,
    lastUpdated: "Updated 7 min ago",
    doctors: [
      { id: "doc-chn-05", name: "Dr. P. Rajasekar, MCh", specialty: "Cardiology", status: "available", nextSlot: "11:00 AM" },
      { id: "doc-chn-06", name: "Dr. V. Muthukumar", specialty: "Neurology", status: "available", nextSlot: "11:30 AM" },
    ],
    diagnostics: [
      { id: "diag-chn-05", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-chn-06", name: "2D Echocardiography", status: "available", waitTime: 15 },
      { id: "diag-chn-07", name: "MRI (3T)", status: "available", waitTime: 25 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
    ],
    queue: { nowServing: 24, totalAhead: 3, estimatedWait: 12, lastUpdated: "Just now" },
  },

  // 3. Government Stanley Medical College Hospital, Chennai
  {
    id: "fac-chn-003",
    name: "Government Stanley Medical College & Hospital",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "Government Medical College Hospital",
    ownership: "government",
    accreditation: "Tamil Nadu Public Health · Free Care",
    address: "Old Jail Road, Royapuram, Chennai",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    lat: 13.1070,
    lng: 80.2872,
    phone: "044-25281351",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma Unit", "General Medicine OPD", "Cardiology", "12-Lead ECG", "Digital X-Ray", "Central Lab"],
    specialists: ["General Medicine", "Cardiology", "Orthopaedics", "Paediatrics"],
    hasTelemedicine: true,
    lastUpdated: "Updated 10 min ago",
    doctors: [
      { id: "doc-chn-07", name: "Dr. N. Balamurugan", specialty: "General Medicine", status: "available", nextSlot: "10:15 AM" },
    ],
    diagnostics: [
      { id: "diag-chn-08", name: "12-Lead ECG", status: "available", waitTime: 10 },
      { id: "diag-chn-09", name: "Digital X-Ray", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Paracetamol 500mg", status: "available" },
      { name: "Metformin 500mg", status: "available" },
    ],
    queue: { nowServing: 35, totalAhead: 4, estimatedWait: 15, lastUpdated: "Just now" },
  },

  // 4. Urban Primary Health Centre (UPHC), Triplicane, Chennai
  {
    id: "fac-chn-004",
    name: "Government Urban Primary Health Centre (UPHC), Triplicane",
    facilityType: "GOVERNMENT_PHC",
    ownershipSector: "GOVERNMENT",
    type: "Urban Primary Health Centre",
    ownership: "government",
    accreditation: "Greater Chennai Corporation Health · 100% Free",
    address: "Triplicane High Road, Triplicane, Chennai",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600005",
    lat: 13.0588,
    lng: 80.2760,
    phone: "044-28442100",
    hours: "Mon–Sat: 8:00 AM – 5:00 PM",
    isOpen: true,
    emergencyCapability: false,
    services: ["Outpatient Consultation", "12-Lead ECG", "NCD Screening", "Free Pharmacy", "Maternal Health & Immunization"],
    specialists: ["General Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Updated 6 min ago",
    doctors: [
      { id: "doc-chn-08", name: "Dr. R. Lakshmi", specialty: "General Medicine", status: "available", nextSlot: "10:00 AM" },
    ],
    diagnostics: [
      { id: "diag-chn-10", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-chn-11", name: "Random Blood Sugar & BP", status: "available", waitTime: 5 },
    ],
    medicines: [
      { name: "Paracetamol 500mg", status: "available" },
      { name: "Metformin 500mg", status: "available" },
      { name: "ORS Packets", status: "available" },
    ],
    queue: { nowServing: 12, totalAhead: 1, estimatedWait: 5, lastUpdated: "Just now" },
  },

  // 5. Apollo Hospitals, Greams Road, Chennai (PM-JAY Empaneled Private Hospital)
  {
    id: "fac-chn-005",
    name: "Apollo Hospitals (Greams Road, Chennai)",
    facilityType: "PRIVATE_HOSPITAL",
    ownershipSector: "PRIVATE",
    type: "Private Multi-Specialty Hospital",
    ownership: "private_empaneled",
    isPmJayEmpaneled: true,
    accreditation: "JCI & NABH Accredited · Ayushman Bharat PM-JAY Empaneled (Cashless)",
    address: "21, Greams Lane, Off Greams Road, Thousand Lights, Chennai",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600006",
    lat: 13.0594,
    lng: 80.2520,
    phone: "044-28290200",
    hours: "Open 24/7 (Emergency, Cath Lab & ICU)",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Level-1 Cardiac Trauma", "Interventional Cardiology", "Cath Lab", "12-Lead ECG", "CT Scan (128-Slice)", "MRI (3T)", "Cashless PM-JAY Desk"],
    specialists: ["Cardiology", "Neurology", "Orthopaedics", "Oncology", "Emergency Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Updated 3 min ago",
    doctors: [
      { id: "doc-chn-09", name: "Dr. Sengottuvelu G., MD, DM", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
      { id: "doc-chn-10", name: "Dr. Mathew Samuel Kalarickal", specialty: "Cardiology", status: "available", nextSlot: "11:15 AM" },
    ],
    diagnostics: [
      { id: "diag-chn-12", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-chn-13", name: "CT Scan (128-Slice)", status: "available", waitTime: 15 },
      { id: "diag-chn-14", name: "2D Echo & Colour Doppler", status: "available", waitTime: 10 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
    ],
    queue: { nowServing: 15, totalAhead: 2, estimatedWait: 6, lastUpdated: "Just now" },
  },

  // 6. Fortis Malar Hospital, Adyar, Chennai (Private Multi-Specialty)
  {
    id: "fac-chn-006",
    name: "Fortis Malar Hospital, Adyar",
    facilityType: "PRIVATE_HOSPITAL",
    ownershipSector: "PRIVATE",
    type: "Private Multi-Specialty Hospital",
    ownership: "private_empaneled",
    isPmJayEmpaneled: true,
    accreditation: "NABH Accredited · Ayushman Bharat PM-JAY & TPA Cashless",
    address: "52, 1st Main Road, Gandhi Nagar, Adyar, Chennai",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600020",
    lat: 13.0067,
    lng: 80.2570,
    phone: "044-42892222",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Emergency & Critical Care", "Cardiology OPD & ICU", "12-Lead ECG", "Digital X-Ray", "Dialysis", "Pathology"],
    specialists: ["Cardiology", "General Medicine", "Paediatrics", "General Surgery"],
    hasTelemedicine: true,
    lastUpdated: "Updated 8 min ago",
    doctors: [
      { id: "doc-chn-11", name: "Dr. Madan Mohan", specialty: "Cardiology", status: "available", nextSlot: "11:00 AM" },
    ],
    diagnostics: [
      { id: "diag-chn-15", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-chn-16", name: "Digital X-Ray", status: "available", waitTime: 10 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
    ],
    queue: { nowServing: 11, totalAhead: 1, estimatedWait: 5, lastUpdated: "Just now" },
  },

  // 7. Medall Heart & Diagnostic Clinic, Park Town, Chennai (Private Clinic)
  {
    id: "fac-chn-007",
    name: "Medall Heart & Specialty Diagnostic Clinic, Park Town",
    facilityType: "PRIVATE_CLINIC",
    ownershipSector: "PRIVATE",
    type: "Private Cardiology Clinic",
    ownership: "private",
    accreditation: "NABL Accredited Specialty Clinic",
    address: "Poonamallee High Road, Near Central Station, Park Town, Chennai",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600003",
    lat: 13.0820,
    lng: 80.2730,
    phone: "044-25381100",
    hours: "Mon–Sat: 8:00 AM – 8:00 PM",
    isOpen: true,
    emergencyCapability: false,
    services: ["Cardiology Consultation", "12-Lead ECG", "2D Echo", "TMT Treadmill Test", "Lipid Profile"],
    specialists: ["Cardiology", "General Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Updated 5 min ago",
    doctors: [
      { id: "doc-chn-12", name: "Dr. S. Sundaresan, MD", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
    ],
    diagnostics: [
      { id: "diag-chn-17", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-chn-18", name: "2D Echo", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 6, totalAhead: 1, estimatedWait: 4, lastUpdated: "Just now" },
  },

  // 8. Chennai Central Pharmacy & Diagnostics (Provider Default Facility)
  {
    id: "fac-chn-008",
    name: "Chennai Central Pharmacy & Diagnostics",
    facilityType: "PHARMACY",
    ownershipSector: "PRIVATE",
    type: "Hospital Pharmacy & Diagnostics Center",
    ownership: "private",
    accreditation: "Licensed Dispensing Pharmacy & NABL Diagnostic Center",
    address: "Central Healthcare Corridor, EVR Salai, Chennai",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600003",
    lat: 13.0820,
    lng: 80.2750,
    phone: "044-25308800",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: false,
    services: ["Medicine Dispensing", "12-Lead ECG", "Digital X-Ray", "Emergency Stock Fulfillment", "Blood Biochemistry"],
    specialists: ["General Medicine"],
    hasTelemedicine: false,
    lastUpdated: "Updated 2 min ago",
    doctors: [],
    diagnostics: [
      { id: "diag-chn-19", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-chn-20", name: "Digital X-Ray", status: "available", waitTime: 10 },
      { id: "diag-chn-21", name: "Lipid & Liver Panel", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Metformin 500mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 8, totalAhead: 1, estimatedWait: 5, lastUpdated: "Just now" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── MAHARASHTRA / NANDURBAR REGION — (CROSS-CITY / DEPLOYMENT DATA) ──────
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fac-mh-001",
    name: "Nandurbar District Civil Hospital",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "District Civil Hospital",
    ownership: "government",
    accreditation: "Maharashtra Public Health · 100% Free Care",
    address: "Civil Hospital Road, Near Collector Office, Nandurbar",
    city: "Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425412",
    lat: 21.3734,
    lng: 74.2404,
    phone: "02564-222100",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma", "Cardiology OPD", "12-Lead ECG", "Digital X-Ray", "Pathology Lab", "Central Pharmacy", "ICU"],
    specialists: ["Cardiology", "General Medicine", "Paediatrics", "Gynaecology", "Orthopaedics"],
    hasTelemedicine: true,
    lastUpdated: "Updated 8 min ago",
    doctors: [
      { id: "doc-mh-01", name: "Dr. Prakash More", specialty: "General Medicine", status: "available", nextSlot: "10:00 AM" },
      { id: "doc-mh-02", name: "Dr. Smita Deshmukh", specialty: "Paediatrics", status: "available", nextSlot: "11:00 AM" },
    ],
    diagnostics: [
      { id: "diag-mh-01", name: "12-Lead ECG", status: "available", waitTime: 15 },
      { id: "diag-mh-02", name: "Digital X-Ray", status: "available", waitTime: 20 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 38, totalAhead: 3, estimatedWait: 15, lastUpdated: "10:15 AM" },
  },
  {
    id: "fac-mh-002",
    name: "Sanjivani Multispeciality Hospital (Nandurbar)",
    facilityType: "PRIVATE_HOSPITAL",
    ownershipSector: "PRIVATE",
    type: "Private Multispeciality Hospital",
    ownership: "private_empaneled",
    isPmJayEmpaneled: true,
    accreditation: "NABH Accredited · Ayushman Bharat PM-JAY Empaneled (Cashless)",
    address: "Station Road, Opp Railway Station, Nandurbar",
    city: "Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425412",
    lat: 21.3695,
    lng: 74.2440,
    phone: "02564-228800",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Emergency Trauma", "Cardiology OPD & Cath Lab", "12-Lead ECG", "CT Scan (32-Slice)", "Digital X-Ray", "ICU & CCU"],
    specialists: ["Cardiology", "Orthopaedics", "General Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Updated 10 min ago",
    doctors: [
      { id: "doc-mh-03", name: "Dr. Deepak Shah, MD, DM", specialty: "Cardiology", status: "available", nextSlot: "10:15 AM" },
    ],
    diagnostics: [
      { id: "diag-mh-03", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-mh-04", name: "CT Scan", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 12, totalAhead: 2, estimatedWait: 8, lastUpdated: "Just now" },
  },
];

export const DEMO_SEARCH_CONTEXT = {
  patientLocation: {
    lat: 13.0827,
    lng: 80.2707,
    locality: "Chennai, Tamil Nadu",
  },
};
