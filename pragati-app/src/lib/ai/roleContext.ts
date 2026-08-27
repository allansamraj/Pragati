import { UserRole, AssistantConfig } from "./types";
import { DEMO_PATIENT } from "@/data/patient";
import { DEMO_FACILITIES } from "@/data/facilities";
import { DEFAULT_DOCTOR_LOCATION, DEFAULT_PROVIDER_LOCATION, DEFAULT_GOVERNMENT_LOCATION } from "@/lib/services/locationService";

export function getAssistantConfig(role: UserRole): AssistantConfig {
  switch (role) {
    case "doctor":
      return {
        role: "doctor",
        assistantName: "PRAGATI Clinical Assist",
        subtitle: "Clinical Workflow & Consultation Support",
        badgeLabel: "Doctor Console",
        accentColor: "#059669", // Emerald
        welcomeMessage: `Good morning, ${DEFAULT_DOCTOR_LOCATION.doctorName}. You have 24 patients waiting in today's OPD queue at ${DEFAULT_DOCTOR_LOCATION.facilityName}.`,
        suggestedActions: [
          "Today's Queue",
          "Patient Summary (#41)",
          "Pending Referrals",
          "Write Prescription",
          "Facility Availability",
        ],
      };

    case "provider":
      return {
        role: "provider",
        assistantName: "PRAGATI Operations Assist",
        subtitle: "Pharmacy Inventory & Lab Operations",
        badgeLabel: "Pharmacy & Stores",
        accentColor: "#B45309", // Amber
        welcomeMessage: `Good morning, R. Karthikeyan. You have 3 medicine inventory alerts and 1 diagnostic update requiring review at ${DEFAULT_PROVIDER_LOCATION.facilityName}.`,
        suggestedActions: [
          "Low Stock Medicines",
          "Medicine Inventory",
          "Service Availability",
          "Pending Transfers",
          "Request Resupply",
        ],
      };

    case "government":
      return {
        role: "government",
        assistantName: "PRAGATI Health Intelligence",
        subtitle: "Tamil Nadu Public Health Surveillance",
        badgeLabel: "Gov of Tamil Nadu",
        accentColor: "#1E3A8A", // Indigo/Blue
        welcomeMessage: `Welcome to ${DEFAULT_GOVERNMENT_LOCATION.state} Healthcare Intelligence. Surveillance active across ${DEFAULT_GOVERNMENT_LOCATION.district} and regional zones. What would you like to analyze?`,
        suggestedActions: [
          "Accessibility Overview",
          "District Gaps (Chennai)",
          "Specialist Shortages",
          "Workload Heatmap",
          "Demand Trends",
        ],
      };

    case "patient":
    default:
      return {
        role: "patient",
        assistantName: "PRAGATI Care",
        subtitle: "Patient Healthcare & Access Guide",
        badgeLabel: "Patient Support",
        accentColor: "#7C2D2D", // Burgundy
        welcomeMessage: `Hi ${DEMO_PATIENT.name.split(" ")[0]}! I'm PRAGATI Care. Tell me what symptoms you're having or what care you need help with.`,
        suggestedActions: [
          "Find Care",
          "Check My Token (#41)",
          "Upcoming Appointments",
          "My Health Records",
          "My Prescriptions",
          "Emergency Help",
        ],
      };
  }
}

export function getRoleLiveContext(role: UserRole) {
  const patient = DEMO_PATIENT;
  const facilities = DEMO_FACILITIES;

  switch (role) {
    case "doctor":
      return {
        doctorName: DEFAULT_DOCTOR_LOCATION.doctorName,
        specialty: DEFAULT_DOCTOR_LOCATION.department,
        facility: DEFAULT_DOCTOR_LOCATION.facilityName,
        registration: "TMC-2014-08-3921",
        queueCount: 24,
        nowServingToken: 40,
        nextPatient: {
          tokenNumber: 41,
          name: DEMO_PATIENT.name,
          age: DEMO_PATIENT.age,
          gender: DEMO_PATIENT.gender,
          abhaId: DEMO_PATIENT.abhaId,
          reason: "Cardiology follow-up & mild exertion discomfort",
          recentEcgDate: "24 Aug 2026",
          medicationsCount: DEMO_PATIENT.currentMedications.length,
        },
        pendingReferralsCount: 3,
      };

    case "provider":
      return {
        facilityName: DEFAULT_PROVIDER_LOCATION.facilityName,
        pharmacistName: "R. Karthikeyan",
        lowStockItems: [
          { name: "Amoxicillin 250mg", stock: 48, threshold: 50, status: "LIMITED" },
          { name: "Metformin 500mg", stock: 0, threshold: 100, status: "UNAVAILABLE" },
          { name: "Atorvastatin 20mg", stock: 12, threshold: 30, status: "LIMITED" },
        ],
        diagnosticServices: [
          { name: "12-Lead ECG", status: "AVAILABLE", waitMinutes: 15 },
          { name: "X-Ray Chest", status: "AVAILABLE", waitMinutes: 20 },
          { name: "CT Scan (128-slice)", status: "LIMITED", waitMinutes: 45 },
        ],
      };

    case "government":
      return {
        state: DEFAULT_GOVERNMENT_LOCATION.state,
        totalDistricts: 38,
        facilitiesCount: 1284,
        topGaps: [
          { district: "Chennai", issue: "High OPD patient workload during monsoon season", severity: "MODERATE" },
          { district: "Villupuram", issue: "Diagnostic lab machine turnaround delay", severity: "MODERATE" },
          { district: "Dharmapuri", issue: "Specialist shortage in cardiology & pediatrics", severity: "HIGH" },
        ],
      };

    case "patient":
    default:
      return {
        patientName: patient.name,
        abhaId: patient.abhaId,
        location: patient.location,
        activeToken: patient.activeToken,
        upcomingAppointment: patient.upcomingAppointments[0],
        medications: patient.currentMedications,
        nearestFacilities: facilities.slice(0, 3),
      };
  }
}
