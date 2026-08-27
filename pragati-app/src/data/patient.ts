export interface ReferralRecord {
  id: string;
  referringFacility: string;
  targetFacility: string;
  department: string;
  reason: string;
  status: "Active" | "Completed" | "Pending";
  date: string;
}

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
  referrals?: ReferralRecord[];
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dose: string;
  frequency: string;
  timing?: string;
  duration: string;
  prescribedBy: string;
  prescribedDate: string;
  facility?: string;
  rxNumber?: string;
  daysRemaining: number;
  refillNeeded: boolean;
  instructions?: string;
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
  estimatedWaitMinutes?: number;
  patientsAhead?: number;
  doctorName?: string;
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
  labValues?: { parameter: string; result: string; unit: string; normalRange: string; status: "normal" | "high" | "low" }[];
  radiologyFindings?: string;
  hospitalDept?: string;
}

export const DEMO_PATIENT: Patient = {
  id: "pat-001",
  name: "Arjun Deshmukh",
  age: 54,
  gender: "Male",
  abhaId: "77-8923-4512-6734",
  phone: "+91 98400 12345",
  location: "Chennai, Tamil Nadu",
  bloodGroup: "B+",
  knownConditions: ["Essential Hypertension", "Type 2 Diabetes Mellitus", "Mild Dyslipidemia"],
  currentMedications: [
    {
      id: "med-001",
      name: "Metoprolol Succinate ER 50mg",
      genericName: "Metoprolol Succinate (Beta-Blocker)",
      dose: "50mg",
      frequency: "Once daily",
      timing: "Morning after breakfast",
      duration: "30 days",
      prescribedBy: "Dr. Ananya Rao, MD, DM (Cardiology)",
      prescribedDate: "12 Aug 2026",
      facility: "Government General Hospital, Chennai",
      rxNumber: "RX-TN-2026-8812",
      daysRemaining: 18,
      refillNeeded: false,
      instructions: "Take with water. Do not skip doses. Monitor pulse rate.",
    },
    {
      id: "med-002",
      name: "Ecosprin (Aspirin) 75mg",
      genericName: "Acetylsalicylic Acid (Antiplatelet)",
      dose: "75mg",
      frequency: "Once daily",
      timing: "After lunch",
      duration: "30 days",
      prescribedBy: "Dr. Ananya Rao, MD, DM (Cardiology)",
      prescribedDate: "12 Aug 2026",
      facility: "Government General Hospital, Chennai",
      rxNumber: "RX-TN-2026-8812",
      daysRemaining: 18,
      refillNeeded: false,
      instructions: "Take with food to prevent gastric irritation.",
    },
    {
      id: "med-003",
      name: "Atorvastatin 20mg",
      genericName: "Atorvastatin Calcium (Statin)",
      dose: "20mg",
      frequency: "Once daily",
      timing: "Bedtime",
      duration: "30 days",
      prescribedBy: "Dr. Ananya Rao, MD, DM (Cardiology)",
      prescribedDate: "12 Aug 2026",
      facility: "Government General Hospital, Chennai",
      rxNumber: "RX-TN-2026-8812",
      daysRemaining: 18,
      refillNeeded: false,
      instructions: "Lipid management. Avoid grapefruit juice.",
    },
    {
      id: "med-004",
      name: "Metformin 500mg",
      genericName: "Metformin HCl (Biguanide)",
      dose: "500mg",
      frequency: "Twice daily",
      timing: "Morning & Night with meals",
      duration: "60 days",
      prescribedBy: "Dr. S. Karthikeyan, MD (General Medicine)",
      prescribedDate: "01 Jul 2026",
      facility: "Urban Primary Health Centre (UPHC), Triplicane",
      rxNumber: "RX-TN-2026-7640",
      daysRemaining: 2,
      refillNeeded: true,
      instructions: "Glycemic control. Check fasting blood sugar regularly.",
    },
    {
      id: "med-005",
      name: "Sorbitrate (Isosorbide Dinitrate) 5mg",
      genericName: "Isosorbide Dinitrate (Vasodilator)",
      dose: "5mg",
      frequency: "SOS / As Needed",
      timing: "Sublingually under tongue during chest discomfort",
      duration: "15 tablets",
      prescribedBy: "Dr. Ananya Rao, MD, DM (Cardiology)",
      prescribedDate: "12 Aug 2026",
      facility: "Government General Hospital, Chennai",
      rxNumber: "RX-TN-2026-8812",
      daysRemaining: 12,
      refillNeeded: false,
      instructions: "Emergency relief. If pain persists >10 mins, immediately call 108.",
    },
  ],
  upcomingAppointments: [
    {
      id: "apt-001",
      type: "OPD Consultation",
      specialty: "Cardiology",
      doctor: "Dr. Ananya Rao",
      facility: "Government General Hospital, Chennai",
      date: "Today, 27 Aug 2026",
      time: "10:30 AM",
      status: "confirmed",
      notes: "Follow-up for exertional chest tightness. Pre-procedure assessment.",
    },
    {
      id: "apt-002",
      type: "Telemedicine Review",
      specialty: "General Medicine",
      doctor: "Dr. S. Karthikeyan",
      facility: "Government General Hospital, Chennai",
      date: "05 Sep 2026",
      time: "11:00 AM",
      status: "confirmed",
      notes: "Diabetes & Blood Pressure Quarterly Review",
    },
  ],
  activeToken: {
    tokenNumber: 41,
    nowServing: 40,
    patientsAhead: 1,
    facilityName: "Government General Hospital, Chennai",
    specialty: "Cardiology OPD",
    doctorName: "Dr. Ananya Rao",
    bookedAt: "08:30 AM",
    estimatedWait: 8,
    estimatedWaitMinutes: 8,
  },
  referrals: [
    {
      id: "ref-001",
      referringFacility: "Urban Primary Health Centre (UPHC), Triplicane",
      targetFacility: "Government General Hospital, Chennai",
      department: "Department of Cardiology",
      reason: "Class I Exertional Angina with abnormal baseline ECG",
      status: "Active",
      date: "12 Aug 2026",
    },
  ],
};

export const DEMO_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: "rec-001",
    type: "consultation",
    title: "Cardiology OPD Clinical Evaluation & Prescription",
    doctor: "Dr. Ananya Rao, MD, DM (Cardiology) · MMC-2014-08-3921",
    facility: "Nandurbar District Civil Hospital",
    hospitalDept: "Department of Cardiology",
    date: "2026-08-12",
    displayDate: "12 Aug 2026",
    summary: "Patient presented with mild exertional dyspnea and chest heaviness upon walking uphill. BP 138/88 mmHg, HR 74 bpm. ECG showed sinus rhythm. Prescribed Metoprolol ER 50mg, Aspirin 75mg, and Atorvastatin 20mg. Advised diagnostic coronary angiogram.",
    diagnosis: "Class I Exertional Angina, Controlled Essential Hypertension",
    prescriptions: ["Metoprolol ER 50mg (OD)", "Aspirin 75mg (OD)", "Atorvastatin 20mg (HS)", "Sorbitrate 5mg (SOS)"],
    tests: ["12-Lead Resting ECG", "Lipid Profile Panel", "Renal Function Test"],
    hasDocument: true,
    fileSize: "1.2 MB",
  },
  {
    id: "rec-002",
    type: "report",
    title: "12-Lead Diagnostic Electrocardiogram (ECG) Report",
    doctor: "Dr. Ananya Rao, MD, DM · Dr. Ganesh Shinde (Cardiologist)",
    facility: "Nandurbar District Civil Hospital · Diagnostic Wing",
    hospitalDept: "Cardiac Diagnostics & Tele-ECG Lab",
    date: "2026-08-12",
    displayDate: "12 Aug 2026",
    summary: "Normal sinus rhythm at 74 bpm. PR Interval 154 ms, QRS Duration 88 ms, QTc 412 ms. Normal axis (+45°). No acute ST-elevation or pathological Q-waves. Non-specific T-wave flattening in lead V5-V6.",
    diagnosis: "Sinus Rhythm with Borderline Anterolateral Ischemia",
    labValues: [
      { parameter: "Ventricular Heart Rate", result: "74", unit: "BPM", normalRange: "60 - 100", status: "normal" },
      { parameter: "PR Interval", result: "154", unit: "ms", normalRange: "120 - 200", status: "normal" },
      { parameter: "QRS Duration", result: "88", unit: "ms", normalRange: "80 - 120", status: "normal" },
      { parameter: "QTc Interval", result: "412", unit: "ms", normalRange: "< 440", status: "normal" },
      { parameter: "P-R-T Axis", result: "52 / 45 / 38", unit: "degrees", normalRange: "-30 to +90", status: "normal" },
    ],
    hasDocument: true,
    fileSize: "840 KB",
  },
  {
    id: "rec-003",
    type: "report",
    title: "Comprehensive Lipid Profile & Fasting Blood Chemistry",
    doctor: "Dr. Sandeep Deshmukh, MD (Biochemistry)",
    facility: "Nandurbar District Civil Hospital · Central Clinical Pathology Lab",
    hospitalDept: "Clinical Biochemistry & Pathology",
    date: "2026-08-12",
    displayDate: "12 Aug 2026",
    summary: "Serum Lipid profile shows mild elevation in Triglycerides and LDL-C. Fasting blood sugar is slightly above target at 118 mg/dL. HbA1c is 6.7% indicating fair glycemic control under Metformin.",
    diagnosis: "Mild Hypertriglyceridemia & Controlled Type 2 Diabetes",
    labValues: [
      { parameter: "Total Cholesterol", result: "186", unit: "mg/dL", normalRange: "< 200", status: "normal" },
      { parameter: "HDL Cholesterol ('Good')", result: "42", unit: "mg/dL", normalRange: "> 40", status: "normal" },
      { parameter: "LDL Cholesterol ('Bad')", result: "114", unit: "mg/dL", normalRange: "< 100", status: "high" },
      { parameter: "Serum Triglycerides", result: "168", unit: "mg/dL", normalRange: "< 150", status: "high" },
      { parameter: "Fasting Blood Sugar (FBS)", result: "118", unit: "mg/dL", normalRange: "70 - 100", status: "high" },
      { parameter: "Glycated Hemoglobin (HbA1c)", result: "6.7", unit: "%", normalRange: "< 5.7 (Target <7.0)", status: "normal" },
      { parameter: "Serum Creatinine", result: "0.92", unit: "mg/dL", normalRange: "0.7 - 1.3", status: "normal" },
      { parameter: "eGFR (Estimated)", result: "92", unit: "mL/min/1.73m²", normalRange: "> 90", status: "normal" },
    ],
    hasDocument: true,
    fileSize: "680 KB",
  },
  {
    id: "rec-004",
    type: "scan",
    title: "Digital Chest Radiograph (PA View X-Ray)",
    doctor: "Dr. Ganesh Shinde, MD (Radiodiagnosis)",
    facility: "Navapur Sub-District Hospital · Radiology Unit",
    hospitalDept: "Department of Radiodiagnosis",
    date: "2026-05-14",
    displayDate: "14 May 2026",
    summary: "Cardiothoracic ratio is within normal limits (0.46). Aortic arch is normal. Bilateral bronchovascular markings within normal limits. Both costophrenic and cardiophrenic angles are clear. Bony thorax is intact.",
    radiologyFindings: "Normal chest radiograph with no evidence of cardiomegaly, pulmonary edema, active infiltration, or pleural effusion.",
    hasDocument: true,
    fileSize: "3.4 MB",
  },
  {
    id: "rec-005",
    type: "consent",
    title: "Informed Consent — Diagnostic Coronary Angiogram & Hemodynamic Assessment",
    doctor: "Dr. Ananya Rao, MD, DM (Cardiology) · MMC-2014-08-3921",
    facility: "Nandurbar District Civil Hospital · Cath Lab & Daycare",
    hospitalDept: "Cardiac Catheterization Laboratory",
    date: "2026-08-30",
    displayDate: "30 Aug 2026",
    summary: "AI-assisted informed consent recorded via PRAGATI AI Care (Session ID: PRG-AIC-7829). Patient comprehension verified at 100% on procedural steps, expected risks (3-5% minor hematoma), and alternatives. Clinician review digitally signed by Dr. Ananya Rao.",
    diagnosis: "Informed Consent Declared, Verified & Clinician Approved",
    hasDocument: true,
    fileSize: "1.6 MB",
  },
  {
    id: "rec-006",
    type: "discharge",
    title: "Daycare Observation & Discharge Summary — Hypertension Triage",
    doctor: "Dr. Prakash More, MD · Dr. Vijay Chavan, MBBS",
    facility: "Dhadgaon Rural Hospital & Primary Health Hub",
    hospitalDept: "Daycare Observation Ward",
    date: "2026-04-10",
    displayDate: "10 Apr 2026",
    summary: "Patient was admitted for 6 hours of ambulatory BP monitoring following transient giddiness. BP stabilized from 154/96 to 128/82 mmHg after oral administration. Discharged in stable condition with lifestyle counselling.",
    diagnosis: "Transient Stage 2 Hypertension (Stabilized)",
    prescriptions: ["Amlodipine 5mg OD (Discontinued on review)", "Salt-restricted diet"],
    hasDocument: true,
    fileSize: "1.1 MB",
  },
];

export const DEMO_REFERRAL = {
  id: "REF-MH-2026-0041",
  fromFacility: "Dhadgaon Rural Hospital & PHC Hub",
  toFacility: "Nandurbar District Civil Hospital",
  referringFacility: "Dhadgaon Rural Hospital & PHC Hub",
  referringDoctor: "Dr. Vijay Chavan, MBBS",
  receivingFacility: "Nandurbar District Civil Hospital",
  receivingDoctor: "Dr. Ananya Rao, MD, DM (Cardiology)",
  specialty: "Cardiology",
  reason: "Exertional chest discomfort with borderline ECG changes requiring specialist evaluation and coronary assessment.",
  urgency: "Urgent",
  status: "scheduled",
  dateIssued: "24 Aug 2026",
  appointmentDate: "30 Aug 2026",
  appointmentTime: "10:30 AM",
  transportSupported: true,
  consentGiven: true,
  abhaId: "77-8923-4512-6734",
};
