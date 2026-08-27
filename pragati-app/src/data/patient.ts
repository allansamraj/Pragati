// ─── PRAGATI DEMO PATIENT DATA — MAHARASHTRA ──────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  abhaId: string;
  phone: string;
  location: string;
  bloodGroup: string;
  knownConditions: string[];
  currentMedications: Medication[];
  upcomingAppointments: Appointment[];
  activeToken?: Token;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  prescribedDate: string;
  daysRemaining: number;
  refillNeeded: boolean;
}

export interface Appointment {
  id: string;
  type: string;
  specialty: string;
  doctor: string;
  facility: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes?: string;
}

export interface Token {
  tokenNumber: number;
  nowServing: number;
  facilityName: string;
  specialty: string;
  bookedAt: string;
  estimatedWait: number;
}

export interface HealthRecord {
  id: string;
  type: "consultation" | "report" | "prescription" | "scan" | "discharge" | "referral" | "consent";
  title: string;
  doctor: string;
  facility: string;
  date: string;
  displayDate: string;
  summary: string;
  diagnosis?: string;
  prescriptions?: string[];
  tests?: string[];
  hasDocument: boolean;
  fileSize?: string;
}

export const DEMO_PATIENT: Patient = {
  id: "pat-001",
  name: "Arjun Deshmukh",
  age: 54,
  gender: "Male",
  abhaId: "77-8923-4512-6734",
  phone: "+91 98220 12345",
  location: "Nandurbar, Maharashtra",
  bloodGroup: "B+",
  knownConditions: ["Hypertension", "Type 2 Diabetes"],
  currentMedications: [
    {
      id: "med-001",
      name: "Metoprolol Succinate 50mg",
      dose: "50mg",
      frequency: "Once daily (Morning)",
      duration: "30 days",
      prescribedBy: "Dr. Ananya Rao (Cardiology)",
      prescribedDate: "12 Aug 2026",
      daysRemaining: 18,
      refillNeeded: false,
    },
    {
      id: "med-002",
      name: "Aspirin (Ecosprin) 75mg",
      dose: "75mg",
      frequency: "Once daily (After lunch)",
      duration: "30 days",
      prescribedBy: "Dr. Ananya Rao (Cardiology)",
      prescribedDate: "12 Aug 2026",
      daysRemaining: 18,
      refillNeeded: false,
    },
    {
      id: "med-003",
      name: "Atorvastatin 20mg",
      dose: "20mg",
      frequency: "Once daily (Night)",
      duration: "30 days",
      prescribedBy: "Dr. Ananya Rao (Cardiology)",
      prescribedDate: "12 Aug 2026",
      daysRemaining: 4,
      refillNeeded: true,
    },
    {
      id: "med-004",
      name: "Metformin 500mg",
      dose: "500mg",
      frequency: "Twice daily (With meals)",
      duration: "60 days",
      prescribedBy: "Dr. Prakash More (General Medicine)",
      prescribedDate: "01 Jul 2026",
      daysRemaining: 2,
      refillNeeded: true,
    },
  ],
  upcomingAppointments: [
    {
      id: "apt-001",
      type: "OPD Consultation",
      specialty: "Cardiology",
      doctor: "Dr. Ananya Rao",
      facility: "Nandurbar District Civil Hospital",
      date: "Today, 27 Aug 2026",
      time: "10:30 AM",
      status: "confirmed",
      notes: "Follow-up for exertional chest tightness. ECG scheduled.",
    },
    {
      id: "apt-002",
      type: "eSanjeevani Teleconsultation",
      specialty: "General Medicine",
      doctor: "Dr. Prakash More",
      facility: "Dhadgaon Rural Hospital & PHC Hub",
      date: "04 Sep 2026",
      time: "11:00 AM",
      status: "confirmed",
      notes: "Routine blood glucose review and HbA1c verification.",
    },
  ],
  activeToken: {
    tokenNumber: 41,
    nowServing: 38,
    facilityName: "Nandurbar District Civil Hospital",
    specialty: "Cardiology OPD (Room 204)",
    bookedAt: "08:45 AM",
    estimatedWait: 15,
  },
};

export const DEMO_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: "rec-001",
    type: "consultation",
    title: "Cardiology OPD Consultation",
    doctor: "Dr. Ananya Rao",
    facility: "Nandurbar District Civil Hospital",
    date: "2026-08-12",
    displayDate: "12 Aug 2026",
    summary: "Patient presented with mild exertional dyspnea and chest discomfort. ECG normal sinus rhythm. Prescribed Metoprolol and Atorvastatin.",
    diagnosis: "Exertional Angina (Class I), Essential Hypertension",
    prescriptions: ["Metoprolol 50mg", "Aspirin 75mg", "Atorvastatin 20mg"],
    tests: ["12-Lead ECG", "Lipid Profile"],
    hasDocument: true,
    fileSize: "1.2 MB",
  },
  {
    id: "rec-002",
    type: "report",
    title: "12-Lead Diagnostic ECG Report",
    doctor: "Dr. Ananya Rao",
    facility: "Nandurbar District Civil Hospital",
    date: "2026-08-12",
    displayDate: "12 Aug 2026",
    summary: "Normal sinus rhythm, heart rate 74 bpm. No acute ST-T elevation or pathological Q waves observed.",
    hasDocument: true,
    fileSize: "840 KB",
  },
  {
    id: "rec-003",
    type: "consultation",
    title: "General Medicine Diabetes Review",
    doctor: "Dr. Prakash More",
    facility: "Shahada Community Health Centre",
    date: "2026-07-01",
    displayDate: "01 Jul 2026",
    summary: "Fasting blood sugar 128 mg/dL, Post-prandial 164 mg/dL. Continued on Metformin 500mg BD.",
    diagnosis: "Type 2 Diabetes Mellitus (Controlled)",
    prescriptions: ["Metformin 500mg"],
    hasDocument: true,
    fileSize: "950 KB",
  },
  {
    id: "rec-004",
    type: "scan",
    title: "Chest Digital X-Ray (PA View)",
    doctor: "Dr. Ganesh Shinde",
    facility: "Navapur Sub-District Hospital",
    date: "2026-05-14",
    displayDate: "14 May 2026",
    summary: "Cardiothoracic ratio normal. Lung fields clear, no focal consolidation or pleural effusion.",
    hasDocument: true,
    fileSize: "3.4 MB",
  },
  {
    id: "rec-005",
    type: "consent",
    title: "Informed Consent — Coronary Angiogram & Assessment",
    doctor: "Dr. Ananya Rao (Supervising Clinician)",
    facility: "Nandurbar District Civil Hospital",
    date: "2026-08-30",
    displayDate: "30 Aug 2026",
    summary: "AI-assisted informed consent recorded via PRAGATI AI Care (Session PRG-AIC-7829). Patient comprehension verified at 100%. Clinician review and signature completed by Dr. Ananya Rao (MMC-2014-08-3921).",
    diagnosis: "Informed Consent Declared & Approved",
    hasDocument: true,
    fileSize: "1.6 MB",
  },
];

export const DEMO_REFERRAL = {
  id: "REF-MH-2026-0041",
  fromFacility: "Dhadgaon Rural Hospital & PHC Hub",
  toFacility: "Nandurbar District Civil Hospital",
  referringFacility: "Dhadgaon Rural Hospital & PHC Hub",
  referringDoctor: "Dr. Vijay Chavan",
  receivingFacility: "Nandurbar District Civil Hospital",
  receivingDoctor: "Dr. Ananya Rao",
  specialty: "Cardiology",
  reason: "Exertional chest discomfort with borderline ECG changes requiring specialist evaluation and echocardiography.",
  urgency: "Urgent",
  status: "scheduled",
  dateIssued: "24 Aug 2026",
  appointmentDate: "30 Aug 2026",
  appointmentTime: "10:30 AM",
  transportSupported: true,
  consentGiven: true,
  abhaId: "77-8923-4512-6734",
};
