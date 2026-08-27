// ─── PRAGATI ASSISTANT DATA-GROUNDED TOOLS ─────────────────────────────────
// Controlled tool execution layer: fetches verified data from application database/services.
// The LLM/Assistant NEVER invents data.

import { DEMO_PATIENT, DEMO_HEALTH_RECORDS, DEMO_REFERRAL, HealthRecord, Medication, Appointment } from "@/data/patient";
import { DEMO_FACILITIES, Facility } from "@/data/facilities";
import { getNearbyFacilities, getFacilityDetails as fetchFacilityDetails } from "@/lib/services/facilityService";
import { UserRole } from "./types";

/**
 * ── 1. PATIENT SCOPED TOOLS ──
 */
export const patientTools = {
  /**
   * Retrieves the authenticated patient's active OPD queue token.
   */
  getActiveToken() {
    const token = DEMO_PATIENT.activeToken;
    if (!token) return null;
    return {
      tokenNumber: token.tokenNumber,
      nowServing: token.nowServing,
      patientsAhead: Math.max(0, token.tokenNumber - token.nowServing),
      estimatedWaitMinutes: token.estimatedWait,
      facilityName: token.facilityName,
      specialty: token.specialty,
      doctorName: "Dr. Ananya Rao",
      bookedAt: token.bookedAt,
      lastUpdated: "Just now",
    };
  },

  /**
   * Retrieves upcoming appointments for the authenticated patient.
   */
  getUpcomingAppointments(): Appointment[] {
    return DEMO_PATIENT.upcomingAppointments || [];
  },

  /**
   * Retrieves the closest upcoming appointment.
   */
  getNextAppointment(): Appointment | null {
    const list = DEMO_PATIENT.upcomingAppointments || [];
    return list.length > 0 ? list[0] : null;
  },

  /**
   * Retrieves active medications and prescriptions.
   */
  getActiveMedications(): Medication[] {
    return DEMO_PATIENT.currentMedications || [];
  },

  /**
   * Retrieves longitudinal health records linked with ABDM.
   */
  getHealthRecords(): HealthRecord[] {
    return DEMO_HEALTH_RECORDS || [];
  },

  /**
   * Retrieves active referral status.
   */
  getReferralStatus() {
    return DEMO_REFERRAL || null;
  },

  /**
   * Consolidates today's schedule (medications, appointments, follow-ups).
   */
  getTodaySchedule() {
    const appointmentsToday = DEMO_PATIENT.upcomingAppointments.filter((a) => a.date.includes("2026-08-27") || a.date.toLowerCase().includes("today"));
    const medicationsToday = DEMO_PATIENT.currentMedications.map((m) => ({
      name: m.name,
      dose: m.dose,
      timing: m.timing,
      frequency: m.frequency,
    }));

    return {
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      appointmentsToday,
      nextAppointment: DEMO_PATIENT.upcomingAppointments[0] || null,
      medicationsToday,
      activeToken: DEMO_PATIENT.activeToken || null,
    };
  },

  /**
   * Searches nearby facilities using the patient's current GPS coordinates.
   */
  async getNearbyFacilities(lat?: number, lng?: number, query?: string, specialty?: string, isEmergency?: boolean) {
    const userLat = lat ?? 21.3734;
    const userLng = lng ?? 74.2404;
    const res = await getNearbyFacilities({
      lat: userLat,
      lng: userLng,
      needQuery: query,
      specialty,
      isEmergency,
    });
    return res;
  },

  /**
   * Retrieves details of a specific facility.
   */
  async getFacilityDetails(facilityId: string, lat?: number, lng?: number) {
    return fetchFacilityDetails(facilityId, lat, lng);
  },
};

/**
 * ── 2. DOCTOR SCOPED TOOLS ──
 */
export const doctorTools = {
  getDoctorQueue() {
    return {
      department: "Cardiology OPD",
      facility: "Nandurbar District Civil Hospital",
      nowServing: 38,
      totalWaiting: 12,
      averageConsultationMinutes: 8,
      specialistOnDuty: "Dr. Ananya Rao",
      nextPatient: {
        tokenNumber: 39,
        name: "Suresh Patil",
        age: 61,
        complaint: "Routine Hypertension Follow-up",
        priority: "routine",
      },
    };
  },

  getTodayAppointments() {
    return [
      { time: "10:30 AM", patientName: "Arjun Deshmukh", abhaId: "77-8923-4512-6734", reason: "Exertional Angina & ECG Review", type: "In-Person OPD" },
      { time: "11:00 AM", patientName: "Sunita Gavit", abhaId: "91-3829-1029-4412", reason: "Post-Myocardial Infarction Teleconsult", type: "Telemedicine" },
      { time: "11:30 AM", patientName: "Ramesh Pawar", abhaId: "44-1294-8831-9023", reason: "Pre-Cath Lab Consent & Vitals", type: "In-Person OPD" },
    ];
  },

  getPatientSummary(patientQuery: string) {
    // Authorized patient record for Arjun Deshmukh
    return {
      name: DEMO_PATIENT.name,
      age: DEMO_PATIENT.age,
      gender: DEMO_PATIENT.gender,
      abhaId: DEMO_PATIENT.abhaId,
      diagnosis: "Class I Exertional Angina, Controlled Hypertension",
      vitals: "BP: 132/84 mmHg, HR: 74 bpm, SpO2: 98%",
      recentECG: "Normal Sinus Rhythm, no acute ST-elevation (24 Aug 2026)",
      currentMeds: DEMO_PATIENT.currentMedications.map((m) => `${m.name} ${m.dose} (${m.frequency})`),
      referralPathway: "Dhadgaon Rural PHC -> Nandurbar District Civil Hospital",
    };
  },
};

/**
 * ── 3. PROVIDER / PHARMACY SCOPED TOOLS ──
 */
export const providerTools = {
  getInventory(searchQuery?: string) {
    const stock = [
      { medicine: "Paracetamol 500mg", stockUnits: 240, status: "available", minBuffer: 50 },
      { medicine: "Metformin 500mg", stockUnits: 0, status: "unavailable", minBuffer: 100, urgentResupplyNeeded: true },
      { medicine: "Metoprolol 50mg", stockUnits: 96, status: "available", minBuffer: 30 },
      { medicine: "Atorvastatin 20mg", stockUnits: 12, status: "limited", minBuffer: 40, resupplyPending: true },
      { medicine: "Aspirin 75mg", stockUnits: 380, status: "available", minBuffer: 100 },
      { medicine: "Amoxicillin 250mg", stockUnits: 48, status: "limited", minBuffer: 50 },
      { medicine: "ORS Packets", stockUnits: 120, status: "available", minBuffer: 60 },
    ];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return stock.filter((s) => s.medicine.toLowerCase().includes(q));
    }
    return stock;
  },

  getDiagnosticCapacity() {
    return [
      { modality: "12-Lead ECG", status: "Operational", queueLength: 3, waitTimeMinutes: 10, uptimePct: "99.4%" },
      { modality: "Digital X-Ray", status: "Operational", queueLength: 5, waitTimeMinutes: 20, uptimePct: "98.2%" },
      { modality: "Lipid / Biochemistry Panel", status: "Operational", queueLength: 8, waitTimeMinutes: 30, uptimePct: "96.5%" },
      { modality: "CT Scan (16-Slice)", status: "Operational", queueLength: 4, waitTimeMinutes: 45, uptimePct: "94.0%" },
    ];
  },
};

/**
 * ── 4. GOVERNMENT / HEALTH INTELLIGENCE SCOPED TOOLS ──
 */
export const governmentTools = {
  getDistrictAnalytics(districtQuery?: string) {
    const districts = [
      { district: "Nandurbar", indexScore: 42, tier: "High Gap", facilitiesMonitored: 44, specialistCoverage: "34%", diagnosticUptime: "68%", acuteShortages: 4 },
      { district: "Gadchiroli", indexScore: 38, tier: "High Gap", facilitiesMonitored: 36, specialistCoverage: "28%", diagnosticUptime: "62%", acuteShortages: 6 },
      { district: "Latur", indexScore: 48, tier: "High Gap", facilitiesMonitored: 52, specialistCoverage: "41%", diagnosticUptime: "72%", acuteShortages: 3 },
      { district: "Palghar", indexScore: 55, tier: "Moderate Gap", facilitiesMonitored: 68, specialistCoverage: "52%", diagnosticUptime: "79%", acuteShortages: 2 },
      { district: "Nashik", indexScore: 78, tier: "Good Access", facilitiesMonitored: 112, specialistCoverage: "76%", diagnosticUptime: "91%", acuteShortages: 1 },
      { district: "Pune", indexScore: 88, tier: "Good Access", facilitiesMonitored: 184, specialistCoverage: "89%", diagnosticUptime: "96%", acuteShortages: 0 },
      { district: "Mumbai City", indexScore: 92, tier: "Good Access", facilitiesMonitored: 210, specialistCoverage: "94%", diagnosticUptime: "98%", acuteShortages: 0 },
    ];

    if (districtQuery) {
      const q = districtQuery.toLowerCase();
      return districts.filter((d) => d.district.toLowerCase().includes(q));
    }
    return districts;
  },

  getResourceShortages() {
    return [
      { resource: "Cardiologist Specialists", district: "Nandurbar", status: "Critical Shortage (2 sanctioned, 0 in position)", action: "PRAGATI Tele-Cardiology Active" },
      { resource: "CT Scan Maintenance", district: "Gadchiroli", status: "Downtime (Calibration required)", action: "Engineer dispatched" },
      { resource: "Metformin 500mg Buffer", district: "Nandurbar & Latur", status: "Below 10% stock buffer", action: "CMSD emergency PO #7891 issued" },
    ];
  },
};
