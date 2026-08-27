// ─── PRAGATI HEALTHCARE FACILITIES DATASET ─────────────────────────────────
// Unified schema supporting Government Public Facilities, Private Hospitals,
// Private Clinics, Diagnostic Centres, and Pharmacies.

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
  // ─── MAHARASHTRA / NANDURBAR REGION — GOVERNMENT ───
  {
    id: "fac-001",
    name: "Nandurbar District Civil Hospital",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "District Civil Hospital",
    ownership: "government",
    accreditation: "Maharashtra Public Health · 100% Free Care",
    address: "Civil Hospital Road, Near Collector Office, Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425412",
    lat: 21.3734,
    lng: 74.2404,
    phone: "02564-222100",
    hours: "Open 24/7 (Emergency & OPD)",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma", "Cardiology OPD", "12-Lead ECG", "Digital X-Ray", "Pathology Lab", "Central Pharmacy", "ICU"],
    specialists: ["Cardiology", "General Medicine", "Paediatrics", "Gynaecology", "Orthopaedics"],
    hasTelemedicine: true,
    lastUpdated: "Updated 8 min ago",
    doctors: [
      { id: "doc-001", name: "Dr. Ananya Rao", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
      { id: "doc-002", name: "Dr. Smita Deshmukh", specialty: "Paediatrics", status: "available", nextSlot: "11:00 AM" },
      { id: "doc-003", name: "Dr. Anjali Patil", specialty: "Gynaecology", status: "available", nextSlot: "11:30 AM" },
      { id: "doc-004", name: "Dr. Prakash More", specialty: "General Medicine", status: "available", nextSlot: "10:00 AM" },
      { id: "doc-005", name: "Dr. Sachin Kulkarni", specialty: "Orthopaedics", status: "limited", nextSlot: "2:00 PM" },
    ],
    diagnostics: [
      { id: "diag-001", name: "12-Lead ECG", status: "available", waitTime: 15 },
      { id: "diag-002", name: "Digital X-Ray", status: "available", waitTime: 20 },
      { id: "diag-003", name: "Lipid Profile & Blood Tests", status: "available", waitTime: 30 },
      { id: "diag-004", name: "CT Scan", status: "available", waitTime: 45 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Metformin 500mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 38, totalAhead: 3, estimatedWait: 15, lastUpdated: "10:15 AM" },
  },
  {
    id: "fac-002",
    name: "Navapur Sub-District Hospital",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "Sub-district Hospital",
    ownership: "government",
    accreditation: "Maharashtra Public Health · 100% Free Care",
    address: "Station Road, Navapur, Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425418",
    lat: 21.1685,
    lng: 73.7915,
    phone: "02569-250200",
    hours: "Open 24/7 (Emergency & OPD)",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency First Aid", "12-Lead ECG", "Digital X-Ray", "General OPD", "Maternity"],
    specialists: ["General Medicine", "Gynaecology", "Paediatrics"],
    hasTelemedicine: true,
    lastUpdated: "Updated 15 min ago",
    doctors: [
      { id: "doc-006", name: "Dr. Ramesh Vasave", specialty: "General Medicine", status: "available", nextSlot: "10:30 AM" },
      { id: "doc-007", name: "Dr. Kavita Gavit", specialty: "Gynaecology", status: "available", nextSlot: "11:15 AM" },
    ],
    diagnostics: [
      { id: "diag-005", name: "12-Lead ECG", status: "available", waitTime: 10 },
      { id: "diag-006", name: "Digital X-Ray", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "limited" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 22, totalAhead: 2, estimatedWait: 10, lastUpdated: "10:00 AM" },
  },
  {
    id: "fac-003",
    name: "Dhadgaon Rural Community Health Centre",
    facilityType: "GOVERNMENT_CHC",
    ownershipSector: "GOVERNMENT",
    type: "Community Health Centre",
    ownership: "government",
    accreditation: "Government Public Health · 100% Free Care",
    address: "Main Road, Dhadgaon (Akrani), Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425414",
    lat: 21.8285,
    lng: 74.2235,
    phone: "02568-242100",
    hours: "Open 24/7 (Emergency & Daycare)",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency First Aid", "12-Lead ECG", "General Medicine OPD", "Teleconsultation Hub", "Maternity Ward"],
    specialists: ["General Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Updated 5 min ago",
    doctors: [
      { id: "doc-008", name: "Dr. Sunil Padvi", specialty: "General Medicine", status: "available", nextSlot: "10:45 AM" },
    ],
    diagnostics: [
      { id: "diag-007", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-008", name: "Rapid Malaria & Dengue Kit", status: "available", waitTime: 10 },
    ],
    medicines: [
      { name: "Paracetamol 500mg", status: "available" },
      { name: "ORS Packets", status: "available" },
      { name: "Metformin 500mg", status: "unavailable" },
    ],
    queue: { nowServing: 14, totalAhead: 1, estimatedWait: 6, lastUpdated: "10:20 AM" },
  },

  // ─── MAHARASHTRA / NANDURBAR REGION — PRIVATE HOSPITALS & CLINICS ───
  {
    id: "fac-pvt-001",
    name: "Sanjivani Multispeciality Hospital (PM-JAY Empaneled)",
    facilityType: "PRIVATE_HOSPITAL",
    ownershipSector: "PRIVATE",
    type: "Private Multispeciality Hospital",
    ownership: "private_empaneled",
    isPmJayEmpaneled: true,
    accreditation: "NABH Accredited · Ayushman Bharat PM-JAY Empaneled (Cashless)",
    address: "Station Road, Opp Railway Station, Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425412",
    lat: 21.3695,
    lng: 74.2440,
    phone: "02564-228800",
    hours: "Open 24/7 (Emergency, ICU & OPD)",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Emergency Trauma", "Cardiology OPD & Cath Lab", "12-Lead ECG", "CT Scan (32-Slice)", "Digital X-Ray", "ICU & CCU", "PM-JAY Cashless Desk"],
    specialists: ["Cardiology", "Orthopaedics", "General Medicine", "General Surgery"],
    hasTelemedicine: true,
    lastUpdated: "Updated 10 min ago",
    doctors: [
      { id: "doc-pvt-01", name: "Dr. Deepak Shah, MD, DM", specialty: "Cardiology", status: "available", nextSlot: "10:15 AM" },
      { id: "doc-pvt-02", name: "Dr. Sanjay Jain", specialty: "Orthopaedics", status: "available", nextSlot: "11:30 AM" },
    ],
    diagnostics: [
      { id: "diag-pvt-01", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-pvt-02", name: "CT Scan", status: "available", waitTime: 15 },
      { id: "diag-pvt-03", name: "Digital X-Ray", status: "available", waitTime: 10 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
    ],
    queue: { nowServing: 12, totalAhead: 2, estimatedWait: 8, lastUpdated: "Just now" },
  },
  {
    id: "fac-pvt-002",
    name: "LifeCare Heart & Diagnostic Clinic",
    facilityType: "PRIVATE_CLINIC",
    ownershipSector: "PRIVATE",
    type: "Private Cardiology Clinic",
    ownership: "private",
    accreditation: "Private Specialty Clinic",
    address: "Nehru Chowk, Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425412",
    lat: 21.3710,
    lng: 74.2380,
    phone: "02564-224422",
    hours: "Mon–Sat: 9:00 AM – 8:00 PM",
    isOpen: true,
    emergencyCapability: false,
    services: ["Cardiology Consultation", "12-Lead ECG", "2D Echocardiography", "TMT Stress Test", "Blood Chemistry"],
    specialists: ["Cardiology"],
    hasTelemedicine: true,
    lastUpdated: "Updated 12 min ago",
    doctors: [
      { id: "doc-pvt-03", name: "Dr. R. K. Agrawal, MD (Cardio)", specialty: "Cardiology", status: "available", nextSlot: "10:45 AM" },
    ],
    diagnostics: [
      { id: "diag-pvt-04", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-pvt-05", name: "2D Echo", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 6, totalAhead: 1, estimatedWait: 5, lastUpdated: "Just now" },
  },

  // ─── MUMBAI REGION — GOVT & PVT ───
  {
    id: "fac-mum-001",
    name: "KEM Hospital & Seth G.S. Medical College",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "Government Medical College Hospital",
    ownership: "government",
    accreditation: "Municipal Corp of Greater Mumbai · Free Public Health",
    address: "Acharya Donde Marg, Parel, Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    pincode: "400012",
    lat: 19.0028,
    lng: 72.8427,
    phone: "022-24107000",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Trauma", "Cardiology OPD", "12-Lead ECG", "MRI/CT", "Advanced Pathology"],
    specialists: ["Cardiology", "Neurology", "General Medicine", "Paediatrics", "Orthopaedics"],
    hasTelemedicine: true,
    lastUpdated: "Updated 10 min ago",
    doctors: [
      { id: "doc-mum-01", name: "Dr. Rajesh Shah", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
    ],
    diagnostics: [
      { id: "diag-mum-01", name: "12-Lead ECG", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 52, totalAhead: 5, estimatedWait: 20, lastUpdated: "10:00 AM" },
  },
  {
    id: "fac-mum-002",
    name: "Lilavati Hospital & Research Centre",
    facilityType: "PRIVATE_HOSPITAL",
    ownershipSector: "PRIVATE",
    type: "Private Super-Specialty Hospital",
    ownership: "private",
    accreditation: "NABH & NABL Accredited · TPA Cashless",
    address: "A-791, Bandra Reclamation, Bandra West, Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    lat: 19.0514,
    lng: 72.8295,
    phone: "022-26751000",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Emergency Trauma", "Interventional Cardiology", "12-Lead ECG", "MRI (3T)", "CT Scan", "Cath Lab"],
    specialists: ["Cardiology", "Neurology", "Orthopaedics", "Oncology"],
    hasTelemedicine: true,
    lastUpdated: "Updated 5 min ago",
    doctors: [
      { id: "doc-mum-02", name: "Dr. P. N. Merchant", specialty: "Cardiology", status: "available", nextSlot: "11:00 AM" },
    ],
    diagnostics: [
      { id: "diag-mum-02", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-mum-03", name: "MRI (3T)", status: "available", waitTime: 20 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 18, totalAhead: 2, estimatedWait: 8, lastUpdated: "Just now" },
  },

  // ─── PUNE REGION — GOVT & PVT ───
  {
    id: "fac-pune-001",
    name: "Sassoon General Hospital & B.J. Medical College",
    facilityType: "GOVERNMENT_HOSPITAL",
    ownershipSector: "GOVERNMENT",
    type: "Government District Hospital",
    ownership: "government",
    accreditation: "Government Public Health · Free Care",
    address: "Near Pune Railway Station, Sassoon Road, Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    lat: 18.5284,
    lng: 73.8742,
    phone: "020-26128000",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma", "Cardiology OPD", "12-Lead ECG", "Digital X-Ray", "ICU"],
    specialists: ["Cardiology", "General Medicine", "Orthopaedics"],
    hasTelemedicine: true,
    lastUpdated: "Updated 15 min ago",
    doctors: [
      { id: "doc-pune-01", name: "Dr. Nilesh Joshi", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
    ],
    diagnostics: [
      { id: "diag-pune-01", name: "12-Lead ECG", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 36, totalAhead: 3, estimatedWait: 15, lastUpdated: "10:00 AM" },
  },
  {
    id: "fac-pune-002",
    name: "Ruby Hall Clinic & Multi-Specialty Institute",
    facilityType: "PRIVATE_HOSPITAL",
    ownershipSector: "PRIVATE",
    type: "Private Multi-Specialty Hospital",
    ownership: "private_empaneled",
    isPmJayEmpaneled: true,
    accreditation: "NABH Accredited · Ayushman Bharat PM-JAY Empaneled",
    address: "40, Sassoon Road, Sangamvadi, Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    lat: 18.5312,
    lng: 73.8770,
    phone: "020-66455100",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Cardiac Emergency", "Cath Lab", "12-Lead ECG", "Digital X-Ray", "CT/MRI", "ICU"],
    specialists: ["Cardiology", "Neurology", "Orthopaedics", "Emergency Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Updated 5 min ago",
    doctors: [
      { id: "doc-pune-02", name: "Dr. Purvez Grant", specialty: "Cardiology", status: "available", nextSlot: "11:15 AM" },
    ],
    diagnostics: [
      { id: "diag-pune-02", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-pune-03", name: "CT Scan", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 14, totalAhead: 2, estimatedWait: 8, lastUpdated: "Just now" },
  },
];

export const DEMO_SEARCH_CONTEXT = {
  patientLocation: {
    lat: 21.3734,
    lng: 74.2404,
    locality: "Nandurbar, Maharashtra",
  },
};
