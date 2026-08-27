import { UserRole } from "./types";

export type ResourceScope =
  | "patient_own_records"
  | "patient_token"
  | "patient_prescriptions"
  | "patient_referrals"
  | "public_facilities"
  | "doctor_opd_queue"
  | "doctor_consultation_pad"
  | "doctor_patient_records"
  | "provider_inventory"
  | "provider_service_availability"
  | "provider_resupply"
  | "government_state_analytics"
  | "government_district_gaps";

const PERMISSION_MATRIX: Record<UserRole, ResourceScope[]> = {
  patient: [
    "patient_own_records",
    "patient_token",
    "patient_prescriptions",
    "patient_referrals",
    "public_facilities",
  ],
  doctor: [
    "doctor_opd_queue",
    "doctor_consultation_pad",
    "doctor_patient_records",
    "public_facilities",
  ],
  provider: [
    "provider_inventory",
    "provider_service_availability",
    "provider_resupply",
    "public_facilities",
  ],
  government: [
    "government_state_analytics",
    "government_district_gaps",
    "public_facilities",
  ],
  guest: [
    "public_facilities",
  ],
};

export const permissionGuard = {
  canAccess(role: UserRole, resource: ResourceScope): boolean {
    const allowed = PERMISSION_MATRIX[role] || PERMISSION_MATRIX.guest;
    return allowed.includes(resource);
  },

  sanitizeQueryByRole(query: string, role: UserRole): { allowed: boolean; reason?: string } {
    const lower = query.toLowerCase();

    // Patients cannot inspect government or provider backend analytics
    if (role === "patient") {
      if (
        lower.includes("government analytics") ||
        lower.includes("district gap report") ||
        lower.includes("other patient") ||
        lower.includes("state workload")
      ) {
        return {
          allowed: false,
          reason: "As a Patient, you have access to your own personal health records, token queue, and public care facilities.",
        };
      }
    }

    // Doctors cannot access state-level confidential policy documents
    if (role === "doctor") {
      if (lower.includes("state budget allocation") || lower.includes("district admin policy")) {
        return {
          allowed: false,
          reason: "Clinical Assistant is focused on your hospital OPD queue, clinical consultations, and patient history.",
        };
      }
    }

    // Providers cannot access patient medical records
    if (role === "provider") {
      if (lower.includes("confidential diagnosis") || lower.includes("patient psychological history")) {
        return {
          allowed: false,
          reason: "Operations Assist has access to pharmacy inventory, diagnostic status, and transfer requests only.",
        };
      }
    }

    return { allowed: true };
  },
};
