// ─── PRAGATI DEMO DATA — MAHARASHTRA HEALTHCARE FACILITIES ────────────────────

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
  type: "District Hospital" | "Community Health Centre" | "Primary Health Centre" | "Rural Hospital" | "Sub-district Hospital";
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
  matchScore?: number;
  distanceKm?: number;
  travelMinutes?: number;
  matchReasons?: string[];
  matchWarnings?: string[];
  matchFails?: string[];
}

export const DEMO_FACILITIES: Facility[] = [
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
    matchScore: 94,
    distanceKm: 14.2,
    travelMinutes: 28,
    matchReasons: ["Cardiologist available", "12-Lead ECG active", "Open now", "Queue 18 min"],
    matchWarnings: [],
    matchFails: [],
    doctors: [
      { id: "doc-001", name: "Dr. Ananya Rao", specialty: "Cardiology", status: "available", nextSlot: "10:30 AM" },
      { id: "doc-002", name: "Dr. Smita Deshmukh", specialty: "Paediatrics", status: "available", nextSlot: "11:00 AM" },
      { id: "doc-003", name: "Dr. Anjali Patil", specialty: "Gynaecology", status: "available", nextSlot: "11:30 AM" },
      { id: "doc-004", name: "Dr. Prakash More", specialty: "General Medicine", status: "available", nextSlot: "10:00 AM" },
      { id: "doc-005", name: "Dr. Sachin Kulkarni", specialty: "Orthopaedics", status: "limited", nextSlot: "2:00 PM" },
    ],
    diagnostics: [
      { id: "diag-001", name: "ECG", status: "available", waitTime: 15 },
      { id: "diag-002", name: "Digital X-Ray", status: "available", waitTime: 20 },
      { id: "diag-003", name: "64-Slice CT Scan", status: "limited", waitTime: 45 },
      { id: "diag-004", name: "Blood Pathology", status: "available", waitTime: 10 },
      { id: "diag-005", name: "Ultrasound Sonography", status: "available", waitTime: 30 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Aspirin 75mg", status: "available" },
      { name: "Atorvastatin 20mg", status: "limited" },
      { name: "Amlodipine 5mg", status: "available" },
    ],
    queue: { nowServing: 41, totalAhead: 6, estimatedWait: 18, lastUpdated: "2 min ago" },
    hasTelemedicine: true,
  },
  {
    id: "fac-002",
    name: "Navapur Sub-District Hospital",
    type: "Sub-district Hospital",
    address: "National Highway 53, Navapur",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425418",
    lat: 21.1648,
    lng: 73.7915,
    phone: "02569-250120",
    hours: "Mon–Sat, 8:00 AM – 6:00 PM",
    isOpen: true,
    matchScore: 82,
    distanceKm: 28.5,
    travelMinutes: 44,
    matchReasons: ["General Physician available", "X-Ray Operational"],
    matchWarnings: ["Specialist Cardiologist on-call only"],
    matchFails: [],
    doctors: [
      { id: "doc-006", name: "Dr. Ganesh Shinde", specialty: "General Medicine", status: "available", nextSlot: "11:30 AM" },
      { id: "doc-007", name: "Dr. Pooja Gaikwad", specialty: "Gynaecology", status: "available", nextSlot: "10:30 AM" },
    ],
    diagnostics: [
      { id: "diag-006", name: "ECG", status: "limited", waitTime: 35 },
      { id: "diag-007", name: "X-Ray", status: "available", waitTime: 25 },
      { id: "diag-008", name: "Blood Work", status: "available", waitTime: 15 },
    ],
    medicines: [
      { name: "Metoprolol 50mg", status: "available" },
      { name: "Aspirin 75mg", status: "limited" },
    ],
    queue: { nowServing: 28, totalAhead: 12, estimatedWait: 35, lastUpdated: "5 min ago" },
    hasTelemedicine: true,
  },
  {
    id: "fac-003",
    name: "Dhadgaon Rural Hospital & PHC Hub",
    type: "Rural Hospital",
    address: "Akrani Tahsil Main Road, Dhadgaon",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425414",
    lat: 21.8291,
    lng: 74.2215,
    phone: "02564-288110",
    hours: "Mon–Sat, 9:00 AM – 5:00 PM",
    isOpen: true,
    matchScore: 68,
    distanceKm: 42.0,
    travelMinutes: 65,
    matchReasons: ["PRAGATI Teleconsultation Active", "Primary Emergency Care"],
    matchWarnings: ["No CT Scan machine", "Cardiac Specialist via Telemedicine"],
    matchFails: [],
    doctors: [
      { id: "doc-008", name: "Dr. Vijay Chavan", specialty: "General Medicine", status: "available", nextSlot: "10:00 AM" },
    ],
    diagnostics: [
      { id: "diag-009", name: "ECG", status: "available", waitTime: 10 },
      { id: "diag-010", name: "Basic Blood Test", status: "available", waitTime: 20 },
    ],
    medicines: [
      { name: "Paracetamol 500mg", status: "available" },
      { name: "ORS Packets", status: "available" },
    ],
    queue: { nowServing: 14, totalAhead: 4, estimatedWait: 12, lastUpdated: "1 min ago" },
    hasTelemedicine: true,
  },
  {
    id: "fac-004",
    name: "Shahada Community Health Centre (CHC)",
    type: "Community Health Centre",
    address: "Dongargaon Road, Shahada",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425409",
    lat: 21.5450,
    lng: 74.4750,
    phone: "02565-223400",
    hours: "Mon–Sat, 8:00 AM – 8:00 PM",
    isOpen: true,
    matchScore: 86,
    distanceKm: 34.0,
    travelMinutes: 48,
    matchReasons: ["Paediatrician available", "Pathology active"],
    matchWarnings: [],
    matchFails: [],
    doctors: [
      { id: "doc-009", name: "Dr. Nilesh Jadhav", specialty: "Paediatrics", status: "available", nextSlot: "11:15 AM" },
      { id: "doc-010", name: "Dr. Kavita Bhosle", specialty: "General Medicine", status: "available", nextSlot: "10:45 AM" },
    ],
    diagnostics: [
      { id: "diag-011", name: "X-Ray", status: "available", waitTime: 15 },
      { id: "diag-012", name: "Blood Lab", status: "available", waitTime: 20 },
    ],
    medicines: [
      { name: "Amoxicillin 250mg", status: "available" },
      { name: "Ibuprofen 400mg", status: "available" },
    ],
    queue: { nowServing: 32, totalAhead: 8, estimatedWait: 22, lastUpdated: "4 min ago" },
    hasTelemedicine: true,
  },
];

export const DEMO_SEARCH_CONTEXT = {
  query: "Cardiology consultation + ECG",
  location: "Nandurbar, Maharashtra",
  triageLevel: "urgent",
  matchedCount: 4,
  primaryFacilityId: "fac-001",
};
