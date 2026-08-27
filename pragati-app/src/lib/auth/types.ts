// ─── PRAGATI AUTH TYPES — MAHARASHTRA ─────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "provider" | "government";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Patient specific
  abhaId?: string;
  // Doctor specific
  mciRegNumber?: string;
  specialization?: string;
  // Provider / Pharmacy specific
  facilityName?: string;
  facilityId?: string;
  department?: string;
  providerRole?: string;
  // Government specific
  govDepartment?: string;
  districtAccess?: string[];
}

export interface Session {
  user: DemoUser;
  role: UserRole;
  isAuthenticated: boolean;
  loginAt: string;
  expiresAt: string;
  isDemoSession: boolean;
}

export interface AuthResult {
  success: boolean;
  session?: Session;
  error?: string;
}

// ─── DEMO CREDENTIALS ─────────────────────────────────────────────────────────

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string; user: DemoUser }> = {
  patient: {
    email: "patient@pragati.demo",
    password: "Patient@Pragati26",
    user: {
      id: "demo-patient-001",
      name: "Arjun Deshmukh",
      email: "patient@pragati.demo",
      role: "patient",
      abhaId: "77-8923-4512-6734",
    },
  },
  doctor: {
    email: "doctor@pragati.demo",
    password: "Doctor@Pragati26",
    user: {
      id: "demo-doc-001",
      name: "Dr. Ananya Rao",
      email: "doctor@pragati.demo",
      role: "doctor",
      facilityName: "Government General Hospital, Chennai",
      facilityId: "fac-chn-001",
      department: "Cardiology",
      specialization: "Senior Interventional Cardiologist",
      mciRegNumber: "TMC-2014-08-3921",
    },
  },
  provider: {
    email: "provider@pragati.demo",
    password: "Provider@Pragati26",
    user: {
      id: "demo-provider-001",
      name: "Chennai Central Pharmacy & Diagnostics",
      email: "provider@pragati.demo",
      role: "provider",
      facilityName: "Chennai Central Pharmacy & Diagnostics",
      facilityId: "fac-chn-008",
      department: "Central Pharmacy & Diagnostic Services",
      providerRole: "Lead Pharmacist & Operations Head",
    },
  },
  government: {
    email: "government@pragati.demo",
    password: "Government@Pragati26",
    user: {
      id: "demo-govt-001",
      name: "Tamil Nadu State Health Command",
      email: "government@pragati.demo",
      role: "government",
      govDepartment: "Department of Health & Family Welfare, Government of Tamil Nadu",
      districtAccess: ["Chennai District", "All Districts"],
    },
  },
};

// ─── ROLE ROUTE MAP ───────────────────────────────────────────────────────────

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  provider: "/provider/dashboard",
  government: "/government/dashboard",
};

export const ROLE_LOGIN: Record<UserRole, string> = {
  patient: "/login/patient",
  doctor: "/login/doctor",
  provider: "/login/provider",
  government: "/login/government",
};

export const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  patient: "/patient",
  doctor: "/doctor",
  provider: "/provider",
  government: "/government",
};
