// ─── PRAGATI HEALTHCARE FACILITIES DATASET ─────────────────────────────────

export type AvailabilityStatus = "available" | "limited" | "unavailable";

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
  type: "District Hospital" | "Community Health Centre" | "Primary Health Centre" | "Rural Hospital" | "Sub-district Hospital" | "Urban Primary Health Centre" | "Private Multi-Specialty Hospital" | "Trust Hospital" | "Super-Specialty Hospital";
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
  // ─── MAHARASHTRA / NANDURBAR REGION ───
  {
    id: "fac-001",
    name: "Nandurbar District Civil Hospital",
    type: "District Hospital",
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
    lastUpdated: "Today, 10:15 AM",
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
    type: "Sub-district Hospital",
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
    services: ["Emergency Care", "General Medicine", "Digital X-Ray", "Basic Pathology", "Maternity Ward"],
    specialists: ["General Medicine", "Paediatrics", "General Surgery"],
    hasTelemedicine: true,
    lastUpdated: "Today, 10:00 AM",
    doctors: [
      { id: "doc-006", name: "Dr. Ganesh Shinde", specialty: "General Medicine", status: "available", nextSlot: "10:15 AM" },
      { id: "doc-007", name: "Dr. Kavita Gavit", specialty: "Paediatrics", status: "available", nextSlot: "11:30 AM" },
    ],
    diagnostics: [
      { id: "diag-005", name: "12-Lead ECG", status: "available", waitTime: 10 },
      { id: "diag-006", name: "Digital X-Ray", status: "available", waitTime: 25 },
      { id: "diag-007", name: "Complete Blood Count", status: "available", waitTime: 20 },
    ],
    medicines: [
      { name: "Paracetamol 500mg", status: "available" },
      { name: "Amoxicillin 250mg", status: "available" },
      { name: "Metformin 500mg", status: "available" },
      { name: "ORS Packets", status: "available" },
    ],
    queue: { nowServing: 22, totalAhead: 2, estimatedWait: 10, lastUpdated: "10:00 AM" },
  },
  {
    id: "fac-003",
    name: "Dhadgaon Rural Hospital & Primary Health Hub",
    type: "Rural Hospital",
    address: "Dhadgaon Main Road, Dhadgaon Block, Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425414",
    lat: 21.6500,
    lng: 74.2215,
    phone: "02564-288110",
    hours: "Mon–Sat, 8:00 AM – 6:00 PM (Emergency 24/7)",
    isOpen: true,
    emergencyCapability: true,
    services: ["Primary Care", "12-Lead ECG", "Telemedicine Teleconsult", "Immunization", "Emergency Triage"],
    specialists: ["General Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Today, 09:45 AM",
    doctors: [
      { id: "doc-008", name: "Dr. Vijay Chavan", specialty: "General Medicine", status: "available", nextSlot: "10:00 AM" },
    ],
    diagnostics: [
      { id: "diag-009", name: "12-Lead ECG (Tele-Reported)", status: "available", waitTime: 10 },
      { id: "diag-010", name: "Rapid Glucose & Blood Test", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Paracetamol 500mg", status: "available" },
      { name: "Metoprolol 50mg", status: "limited" },
      { name: "Atorvastatin 20mg", status: "limited" },
      { name: "ORS Packets", status: "available" },
    ],
    queue: { nowServing: 14, totalAhead: 1, estimatedWait: 8, lastUpdated: "09:45 AM" },
  },
  {
    id: "fac-004",
    name: "Shahada Community Health Centre (CHC)",
    type: "Community Health Centre",
    address: "Dongargaon Road, Shahada, Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425409",
    lat: 21.5432,
    lng: 74.4754,
    phone: "02565-223400",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma", "General Medicine", "Diagnostic Lab", "Delivery & Maternity", "Pharmacy"],
    specialists: ["General Medicine", "Gynaecology"],
    hasTelemedicine: true,
    lastUpdated: "Today, 09:30 AM",
    doctors: [
      { id: "doc-009", name: "Dr. Rahul More", specialty: "General Medicine", status: "available", nextSlot: "10:30 AM" },
    ],
    diagnostics: [
      { id: "diag-011", name: "12-Lead ECG", status: "available", waitTime: 15 },
      { id: "diag-012", name: "Blood Chemistry", status: "available", waitTime: 30 },
    ],
    medicines: [
      { name: "Metformin 500mg", status: "available" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 19, totalAhead: 2, estimatedWait: 12, lastUpdated: "09:30 AM" },
  },

  // ─── CHENNAI & SOUTH REGION (FOR TESTING FROM CHENNAI / TAMIL NADU) ───
  {
    id: "fac-chennai-001",
    name: "Rajiv Gandhi Government General Hospital (RGGGH)",
    type: "District Hospital",
    address: "EVR Periyar Salai, Park Town, Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600003",
    lat: 13.0827,
    lng: 80.2785,
    phone: "044-25305000",
    hours: "Open 24/7 (Emergency & Multi-Specialty)",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma", "Cardiology OPD", "Cath Lab", "12-Lead ECG", "CT & MRI", "Automated Pathology", "Pharmacy 24/7"],
    specialists: ["Cardiology", "General Medicine", "Neurology", "Orthopaedics", "Paediatrics", "Emergency Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Today, 10:30 AM",
    doctors: [
      { id: "doc-ch-01", name: "Dr. K. Senthil", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
      { id: "doc-ch-02", name: "Dr. M. Lakshmi", specialty: "General Medicine", status: "available", nextSlot: "10:45 AM" },
      { id: "doc-ch-03", name: "Dr. R. Karthik", specialty: "Emergency Medicine", status: "available", nextSlot: "Immediate" },
    ],
    diagnostics: [
      { id: "diag-ch-01", name: "12-Lead Digital ECG", status: "available", waitTime: 10 },
      { id: "diag-ch-02", name: "Chest Digital X-Ray", status: "available", waitTime: 15 },
      { id: "diag-ch-03", name: "Cardiac Biomarkers & Trop-T", status: "available", waitTime: 20 },
      { id: "diag-ch-04", name: "CT Scan & MRI", status: "available", waitTime: 30 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
      { name: "Metformin 500mg", status: "available" },
    ],
    queue: { nowServing: 45, totalAhead: 4, estimatedWait: 18, lastUpdated: "10:30 AM" },
  },
  {
    id: "fac-chennai-002",
    name: "Government Peripheral Hospital & Community Health Centre, Perungudi",
    type: "Community Health Centre",
    address: "Old Mahabalipuram Road (OMR), Perungudi, Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600096",
    lat: 12.9654,
    lng: 80.2461,
    phone: "044-24961200",
    hours: "Open 24/7 (Emergency & Daycare)",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency First Aid", "Cardiology Screening", "12-Lead ECG", "General OPD", "Digital X-Ray", "Pharmacy"],
    specialists: ["Cardiology", "General Medicine", "Paediatrics"],
    hasTelemedicine: true,
    lastUpdated: "Today, 10:20 AM",
    doctors: [
      { id: "doc-ch-04", name: "Dr. V. Murugan", specialty: "Cardiology", status: "available", nextSlot: "10:15 AM" },
      { id: "doc-ch-05", name: "Dr. Deepa Natarajan", specialty: "General Medicine", status: "available", nextSlot: "10:30 AM" },
    ],
    diagnostics: [
      { id: "diag-ch-05", name: "12-Lead ECG", status: "available", waitTime: 8 },
      { id: "diag-ch-06", name: "Digital X-Ray", status: "available", waitTime: 12 },
      { id: "diag-ch-07", name: "Lipid Profile & Glucose", status: "available", waitTime: 20 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Ecosprin 75mg", status: "available" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 16, totalAhead: 2, estimatedWait: 10, lastUpdated: "10:20 AM" },
  },
  {
    id: "fac-chennai-003",
    name: "Government Primary Health Centre (UPHC), Thoraipakkam",
    type: "Urban Primary Health Centre",
    address: "200 Feet Radial Road, Thoraipakkam, Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "600097",
    lat: 12.9416,
    lng: 80.2362,
    phone: "044-24580210",
    hours: "Mon–Sat, 8:00 AM – 5:00 PM",
    isOpen: true,
    emergencyCapability: false,
    services: ["Primary Consultation", "12-Lead ECG", "Immunization", "Blood Glucose Check", "Telemedicine Hub"],
    specialists: ["General Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Today, 09:50 AM",
    doctors: [
      { id: "doc-ch-06", name: "Dr. S. Priya", specialty: "General Medicine", status: "available", nextSlot: "10:00 AM" },
    ],
    diagnostics: [
      { id: "diag-ch-08", name: "12-Lead ECG", status: "available", waitTime: 5 },
      { id: "diag-ch-09", name: "Blood Pressure & Vitals", status: "available", waitTime: 5 },
    ],
    medicines: [
      { name: "Metformin 500mg", status: "available" },
      { name: "Paracetamol 500mg", status: "available" },
    ],
    queue: { nowServing: 9, totalAhead: 1, estimatedWait: 6, lastUpdated: "09:50 AM" },
  },
  {
    id: "fac-chennai-004",
    name: "Government Taluk Hospital, Tambaram",
    type: "Sub-district Hospital",
    address: "GST Road, Tambaram West, Chennai",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    pincode: "600045",
    lat: 12.9249,
    lng: 80.1268,
    phone: "044-22264400",
    hours: "Open 24/7 (Emergency & OPD)",
    isOpen: true,
    emergencyCapability: true,
    services: ["24/7 Trauma", "12-Lead ECG", "Digital X-Ray", "Maternity Care", "General Medicine"],
    specialists: ["General Medicine", "Paediatrics", "General Surgery"],
    hasTelemedicine: true,
    lastUpdated: "Today, 10:10 AM",
    doctors: [
      { id: "doc-ch-07", name: "Dr. A. Balaji", specialty: "General Medicine", status: "available", nextSlot: "11:00 AM" },
    ],
    diagnostics: [
      { id: "diag-ch-10", name: "12-Lead ECG", status: "available", waitTime: 12 },
      { id: "diag-ch-11", name: "Digital X-Ray", status: "available", waitTime: 20 },
    ],
    medicines: [
      { name: "Paracetamol 500mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "available" },
    ],
    queue: { nowServing: 28, totalAhead: 3, estimatedWait: 14, lastUpdated: "10:10 AM" },
  },

  // ─── MUMBAI REGION ───
  {
    id: "fac-mumbai-001",
    name: "KEM Hospital & Seth GS Medical College",
    type: "District Hospital",
    address: "Acharya Donde Marg, Parel, Mumbai",
    district: "Mumbai City",
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
    lastUpdated: "Today, 10:00 AM",
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

  // ─── PUNE REGION ───
  {
    id: "fac-pune-001",
    name: "Sassoon General Hospital & B.J. Medical College",
    type: "District Hospital",
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
    lastUpdated: "Today, 10:00 AM",
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

  // ─── BENGALURU REGION ───
  {
    id: "fac-blr-001",
    name: "Victoria Hospital & Bangalore Medical College",
    type: "District Hospital",
    address: "Fort Road, Near City Market, Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    pincode: "560002",
    lat: 12.9634,
    lng: 77.5756,
    phone: "080-26701150",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma", "Cardiology OPD", "12-Lead ECG", "Diagnostics", "ICU"],
    specialists: ["Cardiology", "General Medicine", "Emergency Medicine"],
    hasTelemedicine: true,
    lastUpdated: "Today, 10:00 AM",
    doctors: [
      { id: "doc-blr-01", name: "Dr. Suresh Gowda", specialty: "Cardiology", status: "available", nextSlot: "10:45 AM" },
    ],
    diagnostics: [
      { id: "diag-blr-01", name: "12-Lead ECG", status: "available", waitTime: 10 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 40, totalAhead: 4, estimatedWait: 16, lastUpdated: "10:00 AM" },
  },

  // ─── DELHI REGION ───
  {
    id: "fac-del-001",
    name: "Safdarjung Hospital & Vardhman Mahavir Medical College",
    type: "District Hospital",
    address: "Ring Road, Opposite AIIMS, New Delhi",
    district: "New Delhi",
    state: "Delhi",
    pincode: "110029",
    lat: 28.5700,
    lng: 77.2070,
    phone: "011-26165060",
    hours: "Open 24/7",
    isOpen: true,
    emergencyCapability: true,
    services: ["Emergency Trauma", "Cardiology OPD", "12-Lead ECG", "CT/MRI", "Cath Lab"],
    specialists: ["Cardiology", "General Medicine", "Paediatrics"],
    hasTelemedicine: true,
    lastUpdated: "Today, 10:00 AM",
    doctors: [
      { id: "doc-del-01", name: "Dr. Amit Sharma", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
    ],
    diagnostics: [
      { id: "diag-del-01", name: "12-Lead ECG", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
    ],
    queue: { nowServing: 48, totalAhead: 4, estimatedWait: 18, lastUpdated: "10:00 AM" },
  },
];

export const DEMO_SEARCH_CONTEXT = {
  patientLocation: {
    lat: 21.3734,
    lng: 74.2404,
    locality: "Nandurbar, Maharashtra",
  },
  defaultRadiusKm: 10,
};
