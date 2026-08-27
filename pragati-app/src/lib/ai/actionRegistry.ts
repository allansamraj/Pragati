import { UserRole } from "./types";

export interface AIAction {
  id: string;
  label: string;
  role: UserRole;
  requiresConfirmation: boolean;
  execute: (router: any, payload?: any) => void;
}

export const actionRegistry: Record<string, (router: any, payload?: any) => void> = {
  OPEN_FIND_CARE: (router, payload) => {
    const specialty = payload?.specialty ? `?specialty=${encodeURIComponent(payload.specialty)}` : "";
    router.push(`/patient/find-care${specialty}`);
  },

  OPEN_TOKEN: (router) => {
    router.push("/patient/token");
  },

  OPEN_APPOINTMENTS: (router) => {
    router.push("/patient/appointments");
  },

  OPEN_RECORDS: (router) => {
    router.push("/patient/records");
  },

  OPEN_PRESCRIPTIONS: (router) => {
    router.push("/patient/prescriptions");
  },

  OPEN_REFERRALS: (router) => {
    router.push("/patient/referrals");
  },

  OPEN_TELECONSULT: (router) => {
    router.push("/patient/teleconsult");
  },

  OPEN_DOCTOR_QUEUE: (router) => {
    router.push("/doctor/queue");
  },

  OPEN_DOCTOR_CONSULTATION: (router, payload) => {
    const token = payload?.tokenNumber ? `?token=${payload.tokenNumber}` : "";
    router.push(`/doctor/consultation${token}`);
  },

  OPEN_DOCTOR_PATIENTS: (router) => {
    router.push("/doctor/patients");
  },

  OPEN_DOCTOR_PRESCRIPTIONS: (router) => {
    router.push("/doctor/prescriptions");
  },

  OPEN_PROVIDER_INVENTORY: (router) => {
    router.push("/provider/medicines");
  },

  OPEN_PROVIDER_DIAGNOSTICS: (router) => {
    router.push("/provider/diagnostics");
  },

  OPEN_PROVIDER_REFERRALS: (router) => {
    router.push("/provider/referrals");
  },

  OPEN_GOVERNMENT_DASHBOARD: (router, payload) => {
    const district = payload?.district ? `?district=${encodeURIComponent(payload.district)}` : "";
    router.push(`/government/dashboard${district}`);
  },

  CALL_108: () => {
    window.location.href = "tel:108";
  },
};
