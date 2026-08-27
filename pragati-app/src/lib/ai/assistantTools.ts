// ─── PRAGATI ASSISTANT INTELLIGENCE & ROLE TOOL SCOPES ───────────────────────
// Provides clean, isolated tool execution for Patient, Doctor, Provider,
// and Government administrative contexts.

import { DEMO_PATIENT } from "@/data/patient";
import { getNearbyFacilities, getFacilityDetails as fetchFacilityDetails } from "@/lib/services/facilityService";
import { DEMO_FACILITIES } from "@/data/facilities";
import { DEFAULT_DOCTOR_LOCATION, DEFAULT_PROVIDER_LOCATION, DEFAULT_GOVERNMENT_LOCATION } from "@/lib/services/locationService";

/**
 * ── 1. PATIENT SCOPED TOOLS ──
 */
export const patientTools = {
  /**
   * Retrieves the authenticated patient's clinical summary, active medications, and upcoming visits.
   */
  getPatientHealthProfile() {
    return {
      name: DEMO_PATIENT.name,
      age: DEMO_PATIENT.age,
      gender: DEMO_PATIENT.gender,
      abhaId: DEMO_PATIENT.abhaId,
      bloodGroup: DEMO_PATIENT.bloodGroup,
      location: DEMO_PATIENT.location,
      conditions: DEMO_PATIENT.knownConditions,
      activeMedicationsCount: DEMO_PATIENT.currentMedications.length,
      upcomingAppointmentsCount: DEMO_PATIENT.upcomingAppointments.length,
      activeToken: DEMO_PATIENT.activeToken || null,
    };
  },

  /**
   * Retrieves patient's active prescriptions and refill statuses.
   */
  getActiveMedications() {
    return DEMO_PATIENT.currentMedications.map((m) => ({
      id: m.id,
      name: m.name,
      dose: m.dose,
      frequency: m.frequency,
      timing: m.timing,
      prescribedBy: m.prescribedBy,
      facility: m.facility,
      daysRemaining: m.daysRemaining,
      refillNeeded: m.refillNeeded,
      instructions: m.instructions,
    }));
  },

  /**
   * Retrieves daily itinerary: appointments, medication schedule, and queue token.
   */
  getTodaySchedule() {
    const appointmentsToday = DEMO_PATIENT.upcomingAppointments.filter((a) =>
      a.date.toLowerCase().includes("today")
    );

    const medicationsToday = DEMO_PATIENT.currentMedications.map((m) => ({
      name: m.name,
      dose: m.dose,
      timing: m.timing,
      instructions: m.instructions,
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
   * Retrieves active token for today's OPD consultation.
   */
  getActiveToken() {
    return DEMO_PATIENT.activeToken || null;
  },

  /**
   * Retrieves upcoming appointments list.
   */
  getUpcomingAppointments() {
    return DEMO_PATIENT.upcomingAppointments || [];
  },

  /**
   * Retrieves active referral letters and pathway continuity.
   */
  getReferralStatus() {
    return {
      referringFacility: "Urban Primary Health Centre (UPHC), Triplicane",
      receivingFacility: "Government General Hospital, Chennai",
      specialty: "Cardiology",
      receivingDoctor: "Dr. Ananya Rao, MD, DM",
      appointmentDate: "Today, 27 Aug 2026",
      appointmentTime: "10:30 AM",
      reason: "Class I Exertional Angina with abnormal baseline ECG",
      status: "Accepted & Scheduled",
    };
  },

  /**
   * Searches nearby facilities using the patient's current GPS / Selected coordinates.
   */
  async getNearbyFacilities(lat?: number, lng?: number, query?: string, specialty?: string, isEmergency?: boolean) {
    const userLat = lat ?? 13.0827;
    const userLng = lng ?? 80.2707;
    const res = await getNearbyFacilities({
      lat: userLat,
      lng: userLng,
      needQuery: query,
      specialty,
      isEmergency,
      facilityType: "ALL",
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
 * ── 2. DOCTOR SCOPED TOOLS (REGISTERED FACILITY CONTEXT) ──
 */
export const doctorTools = {
  getDoctorQueue() {
    return {
      department: "Cardiology OPD",
      facility: DEFAULT_DOCTOR_LOCATION.facilityName,
      room: DEFAULT_DOCTOR_LOCATION.room,
      counter: DEFAULT_DOCTOR_LOCATION.counter,
      nowServing: 40,
      totalWaiting: 11,
      averageConsultationMinutes: 8,
      specialistOnDuty: DEFAULT_DOCTOR_LOCATION.doctorName,
      nextPatient: {
        tokenNumber: 41,
        name: DEMO_PATIENT.name,
        age: DEMO_PATIENT.age,
        complaint: "Exertional Angina & ECG Review",
        priority: "routine",
      },
    };
  },

  getTodayAppointments() {
    return [
      { time: "10:30 AM", patientName: "Arjun Deshmukh", abhaId: "77-8923-4512-6734", reason: "Exertional Angina & ECG Review", type: "In-Person OPD" },
      { time: "11:00 AM", patientName: "K. Soundararajan", abhaId: "91-3829-1029-4412", reason: "Post-Angioplasty Teleconsult", type: "Telemedicine" },
      { time: "11:30 AM", patientName: "Lakshmi Narayanan", abhaId: "44-1294-8831-9023", reason: "Pre-Cath Lab Consent & Vitals", type: "In-Person OPD" },
    ];
  },

  getPatientSummary(patientQuery: string) {
    return {
      name: DEMO_PATIENT.name,
      age: DEMO_PATIENT.age,
      gender: DEMO_PATIENT.gender,
      abhaId: DEMO_PATIENT.abhaId,
      diagnosis: "Class I Exertional Angina, Controlled Hypertension",
      vitals: "BP: 130/82 mmHg, HR: 72 bpm, SpO2: 98%",
      recentECG: "Normal Sinus Rhythm, no acute ST-elevation (24 Aug 2026)",
      currentMeds: DEMO_PATIENT.currentMedications.map((m) => `${m.name} ${m.dose} (${m.frequency})`),
      referralPathway: "Urban PHC Triplicane -> Government General Hospital, Chennai",
    };
  },

  getNearbyDoctorNetwork() {
    return {
      facility: DEFAULT_DOCTOR_LOCATION.facilityName,
      coordinates: { lat: DEFAULT_DOCTOR_LOCATION.lat, lng: DEFAULT_DOCTOR_LOCATION.lng },
      referralSpokes: [
        { name: "Government Stanley Medical College Hospital", type: "Government Tertiary Care", distanceKm: 3.2, role: "Tertiary Referral Partner" },
        { name: "Tamil Nadu Multi Super Speciality Hospital (Omandurar)", type: "Super-Specialty Center", distanceKm: 1.8, role: "Advanced Cath Lab & Cardiothoracic Surgery" },
        { name: "Medall Heart & Diagnostic Clinic, Park Town", type: "Private Diagnostic Partner", distanceKm: 0.6, role: "Rapid 12-Lead ECG / 2D Echo" },
        { name: "Apollo Hospitals (Greams Road)", type: "Private PM-JAY Empaneled", distanceKm: 2.9, role: "Emergency Cath Lab Overflow" },
      ],
    };
  },
};

/**
 * ── 3. PROVIDER / PHARMACY SCOPED TOOLS (REGISTERED BUSINESS CONTEXT) ──
 */
export const providerTools = {
  getInventory(searchQuery?: string) {
    const stock = [
      { medicine: "Metoprolol 50mg", stockUnits: 96, status: "available", minBuffer: 30 },
      { medicine: "Atorvastatin 20mg", stockUnits: 12, status: "limited", minBuffer: 40, resupplyPending: true },
      { medicine: "Aspirin 75mg", stockUnits: 380, status: "available", minBuffer: 100 },
      { medicine: "Paracetamol 500mg", stockUnits: 240, status: "available", minBuffer: 50 },
      { medicine: "Metformin 500mg", stockUnits: 0, status: "unavailable", minBuffer: 100, urgentResupplyNeeded: true },
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
      { modality: "12-Lead ECG", status: "Operational", queueLength: 2, waitTimeMinutes: 5, uptimePct: "99.8%" },
      { modality: "Digital X-Ray", status: "Operational", queueLength: 4, waitTimeMinutes: 10, uptimePct: "98.5%" },
      { modality: "Lipid / Biochemistry Panel", status: "Operational", queueLength: 6, waitTimeMinutes: 15, uptimePct: "97.2%" },
      { modality: "CT Scan", status: "Operational", queueLength: 3, waitTimeMinutes: 20, uptimePct: "96.0%" },
    ];
  },

  getConnectedHospitalNetwork() {
    return {
      provider: DEFAULT_PROVIDER_LOCATION.facilityName,
      serviceRadiusKm: DEFAULT_PROVIDER_LOCATION.serviceRadiusKm,
      connectedFacilities: [
        { name: "Government General Hospital, Chennai", distanceKm: 0.2, type: "Government Hospital", ordersToday: 38 },
        { name: "Tamil Nadu Multi Super Speciality Hospital (Omandurar)", distanceKm: 1.8, type: "Government Super-Speciality", ordersToday: 14 },
        { name: "Urban PHC Triplicane", distanceKm: 2.4, type: "Government Urban PHC", ordersToday: 9 },
        { name: "Apollo Hospitals (Greams Road)", distanceKm: 2.9, type: "Private Hospital", ordersToday: 6 },
      ],
    };
  },
};

/**
 * ── 4. GOVERNMENT / HEALTH INTELLIGENCE SCOPED TOOLS (ADMINISTRATIVE CONTEXT) ──
 */
export const governmentTools = {
  getDistrictAnalytics(districtQuery?: string) {
    const districts = [
      { state: "Tamil Nadu", district: "Chennai", indexScore: 88, tier: "Good Access", facilitiesMonitored: 142, specialistCoverage: "92%", diagnosticUptime: "96%", acuteShortages: 1 },
      { state: "Tamil Nadu", district: "Thiruvallur", indexScore: 68, tier: "Moderate Gap", facilitiesMonitored: 76, specialistCoverage: "64%", diagnosticUptime: "82%", acuteShortages: 2 },
      { state: "Tamil Nadu", district: "Chengalpattu", indexScore: 74, tier: "Moderate Gap", facilitiesMonitored: 88, specialistCoverage: "71%", diagnosticUptime: "88%", acuteShortages: 1 },
      { state: "Tamil Nadu", district: "Coimbatore", indexScore: 86, tier: "Good Access", facilitiesMonitored: 120, specialistCoverage: "88%", diagnosticUptime: "94%", acuteShortages: 0 },
      { state: "Tamil Nadu", district: "Madurai", indexScore: 79, tier: "Good Access", facilitiesMonitored: 94, specialistCoverage: "80%", diagnosticUptime: "90%", acuteShortages: 1 },
      { state: "Maharashtra", district: "Nandurbar", indexScore: 42, tier: "High Gap", facilitiesMonitored: 44, specialistCoverage: "34%", diagnosticUptime: "68%", acuteShortages: 4 },
      { state: "Maharashtra", district: "Pune", indexScore: 88, tier: "Good Access", facilitiesMonitored: 184, specialistCoverage: "89%", diagnosticUptime: "96%", acuteShortages: 0 },
    ];

    if (districtQuery) {
      const q = districtQuery.toLowerCase();
      return districts.filter((d) => d.district.toLowerCase().includes(q) || d.state.toLowerCase().includes(q));
    }
    return districts;
  },

  getResourceShortages() {
    return [
      { resource: "Metformin 500mg Buffer", state: "Tamil Nadu", district: "Chennai District (Central Hub)", status: "Below 10% stock buffer", action: "TNMSC Emergency PO #4421 issued" },
      { resource: "Digital X-Ray Sensor Calibration", state: "Tamil Nadu", district: "Thiruvallur (Ponneri GH)", status: "Routine maintenance calibration", action: "Biomedical engineer dispatched" },
      { resource: "Cardiologist Specialists", state: "Maharashtra", district: "Nandurbar", status: "Critical Shortage (2 sanctioned, 0 in position)", action: "PRAGATI Tele-Cardiology Active" },
    ];
  },
};
