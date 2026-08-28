export type UserRole = "patient" | "doctor" | "provider" | "government" | "guest";

export type AssistantLanguage = "en" | "mr" | "hi" | "ta";

export interface FacilityCardItem {
  id: string;
  name: string;
  type: string;
  distanceKm: number;
  travelMinutes: number;
  matchScore: number;
  specialistAvailable: boolean;
  specialistName?: string;
  diagnosticAvailable: boolean;
  diagnosticWaitMinutes?: number;
  queueWaitMinutes?: number;
  isBestMatch?: boolean;
  recommendationLabel?: string;
  matchTier?: 'BEST_SPECIALTY_MATCH' | 'NEARBY_GENERAL_CARE' | 'GENERAL_CARE_FALLBACK' | 'UNRELATED';
}

export interface TokenStatusItem {
  tokenNumber: number;
  nowServing: number;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  facilityName: string;
  specialty: string;
  doctorName: string;
}

export interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  facility: string;
  status: "confirmed" | "pending" | "completed";
}

export interface PatientSummaryData {
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  location: string;
  currentVisitReason: string;
  recentConsultation: string;
  recentDiagnostic: string;
  activeMedicationsCount: number;
  nextFollowUp: string;
  referralStatus: string;
}

export interface MedicineStockItem {
  id: string;
  name: string;
  stockUnits: number;
  status: "available" | "limited" | "unavailable";
  category: string;
  unit: string;
}

export interface DistrictGapItem {
  rank: string;
  district: string;
  primaryGap: string;
  gapSeverity: "HIGH" | "MODERATE" | "LOW";
  specialistScore: string;
  diagnosticsScore: string;
  teleconsultStatus: string;
}

export interface ConfirmationAction {
  actionType: string;
  title: string;
  description: string;
  payload: Record<string, any>;
  confirmedText: string;
}

export interface EmergencyActionData {
  alertTitle: string;
  alertSubtitle: string;
  recommendedFacility: string;
  distance: string;
  emergencyNumber: string;
}

export interface AIMessageWidget {
  type:
    | "facility_list"
    | "token_status"
    | "appointment_list"
    | "patient_summary"
    | "medicine_inventory"
    | "district_analytics"
    | "confirmation"
    | "emergency"
    | "action_buttons";
  data: any;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  role: UserRole;
  language?: AssistantLanguage;
  widget?: AIMessageWidget;
  suggestedPrompts?: string[];
  actionLink?: {
    label: string;
    href: string;
  };
}

export interface AssistantConfig {
  role: UserRole;
  assistantName: string;
  subtitle: string;
  badgeLabel: string;
  accentColor: string;
  welcomeMessage: string;
  suggestedActions: string[];
}
