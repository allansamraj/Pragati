import { UserRole, AssistantConfig } from "./types";
import { DEMO_PATIENT } from "@/data/patient";
import { DEMO_FACILITIES } from "@/data/facilities";

export function getAssistantConfig(role: UserRole): AssistantConfig {
  switch (role) {
    case "doctor":
      return {
        role: "doctor",
        assistantName: "PRAGATI Clinical Assist",
        subtitle: "Clinical Workflow & Consultation Support",
        badgeLabel: "Doctor Console",
        accentColor: "#059669", // Emerald
        welcomeMessage: "Good morning, Dr. Ananya Rao. You have 24 patients waiting in today's OPD queue at Nandurbar District Civil Hospital.",
        suggestedActions: [
          "Today's Queue",
          "Patient Summary (#42)",
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
        welcomeMessage: "Good morning, Rajesh Kulkarni. You have 3 medicine inventory alerts and 1 diagnostic update requiring review.",
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
        subtitle: "Maharashtra Public Health Surveillance",
        badgeLabel: "Gov of Maharashtra",
        accentColor: "#1E3A8A", // Indigo/Blue
        welcomeMessage: "Welcome to Maharashtra Healthcare Intelligence. Surveillance active across all 36 Maharashtra districts. What would you like to analyze?",
        suggestedActions: [
          "Accessibility Overview",
          "District Gaps (Nandurbar)",
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
        welcomeMessage: "Hi Arjun! I'm PRAGATI Care. Tell me what symptoms you're having or what care you need help with.",
        suggestedActions: [
          "Find Care",
          "Check My Token (#47)",
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
        doctorName: "Dr. Ananya Rao",
        specialty: "Cardiology",
        facility: "Nandurbar District Civil Hospital",
        registration: "MMC-2014-08-3921",
        queueCount: 24,
        nowServingToken: 41,
        nextPatient: {
          tokenNumber: 42,
          name: "Arjun Deshmukh",
          age: 54,
          gender: "Male",
          abhaId: "91-4829-1049-3821",
          reason: "Cardiology follow-up & mild exertion discomfort",
          recentEcgDate: "24 Aug 2026",
          medicationsCount: 2,
        },
        pendingReferralsCount: 3,
      };

    case "provider":
      return {
        facilityName: "Nandurbar District Civil Hospital — Central Pharmacy",
        pharmacistName: "Rajesh Kulkarni",
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
        state: "Maharashtra",
        totalDistricts: 36,
        facilitiesCount: 1284,
        topGaps: [
          { district: "Nandurbar", issue: "Specialist shortage in cardiology & pediatrics", severity: "HIGH" },
          { district: "Gadchiroli", issue: "Diagnostic lab machine turnaround delay", severity: "MODERATE" },
          { district: "Palghar", issue: "High OPD patient workload vs bed capacity", severity: "HIGH" },
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
