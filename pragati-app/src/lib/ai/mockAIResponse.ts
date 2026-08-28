// ─── PRAGATI ASSIST — CRITICAL INTENT ROUTER & DATA-GROUNDED ENGINE ─────────
// Rule: NEVER respond with a generic introduction when the patient has asked a meaningful question.
// Multi-step conversational triage engine with safety, memory, and zero hallucination.

import { ChatMessage, UserRole, AssistantLanguage } from "./types";
import { patientTools, doctorTools, providerTools, governmentTools } from "./assistantTools";
import { symptomTriageEngine } from "./symptomTriageEngine";
import { healthcareIntentRouter } from "./healthcareIntentRouter";
import { complaintAssessmentEngine } from "./complaintAssessmentEngine";
import { DEMO_PATIENT } from "@/data/patient";
import { DEMO_FACILITIES } from "@/data/facilities";

export async function generateAssistantResponse(
  query: string,
  role: UserRole,
  language: AssistantLanguage = "en"
): Promise<ChatMessage> {
  const q = query.trim().toLowerCase();
  const timestamp = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const msgId = `msg-${Date.now()}`;

  // ── ROUTE BY ROLE ──
  if (role === "doctor") {
    return handleDoctorQuery(q, timestamp, msgId, language);
  }
  if (role === "provider") {
    return handleProviderQuery(q, timestamp, msgId, language);
  }
  if (role === "government") {
    return handleGovernmentQuery(q, timestamp, msgId, language);
  }

  // Default: Patient Role
  return handlePatientQuery(query, timestamp, msgId, language);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PATIENT INTENT ROUTER & ENGINE
// ─────────────────────────────────────────────────────────────────────────────

async function handlePatientQuery(
  rawQuery: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): Promise<ChatMessage> {
  const q = rawQuery.trim().toLowerCase();

  // If an active clinical assessment session is in progress, route incoming answers
  const activeAssessment = complaintAssessmentEngine.getSession();
  if (activeAssessment && activeAssessment.step === "ASSESSING") {
    const isExplicitPortalOverride =
      q === "what is my token" ||
      q === "check my active token" ||
      q === "when is my next appointment" ||
      q === "what medicines am i taking" ||
      q === "my records" ||
      q === "clear" ||
      q === "reset";

    if (!isExplicitPortalOverride) {
      return await complaintAssessmentEngine.processUserMessage(rawQuery, timestamp, msgId, language);
    }
  }

  // ── A. SIMPLE GREETINGS ONLY ("hi", "hello", "hey", "namaste", "vanakkam") ──
  const isSimpleGreeting =
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q === "hi pragati" ||
    q === "hello pragati" ||
    q === "namaste" ||
    q === "namaskar" ||
    q === "vanakkam";

  if (isSimpleGreeting) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        language === "mr"
          ? "नमस्कार! आज मी तुम्हाला आरोग्य, लक्षणे, तपासणी किंवा डॉक्टरांच्या भेटीबद्दल कशी मदत करू शकेन?"
          : language === "ta"
          ? "வணக்கம்! இன்று உங்கள் உடல்நலம், அறிகுறிகள், சந்திப்புகள் அல்லது மருத்துவமனை சேவைகளில் நான் எவ்வாறு உதவ முடியும்?"
          : "Hi! How can I help you today?",
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: [
        "Skin allergy",
        "I have fever",
        "I need ECG",
        "What is my token?",
        "Find Care near me",
      ],
    };
  }

  // ── B. DIRECT PORTAL & EMERGENCY TOOLS (Token, Appointments, Medications, Records, 108 Emergency) ──
  if (
    q.includes("emergency") ||
    q.includes("108") ||
    q.includes("ambulance") ||
    q.includes("heart attack") ||
    q.includes("severe chest pain") ||
    q.includes("cannot breathe") ||
    q.includes("unconscious")
  ) {
    return await healthcareIntentRouter.processUserMessage(rawQuery, timestamp, msgId, language);
  }

  // ── E. TOKEN & QUEUE INTENT ──
  if (
    q.includes("token") ||
    q.includes("queue") ||
    q.includes("turn") ||
    q.includes("ahead of me") ||
    q.includes("where am i") ||
    q.includes("how many people") ||
    q.includes("टोकन") ||
    q.includes("டோக்கன்")
  ) {
    const token = patientTools.getActiveToken();

    if (!token) {
      return {
        id: msgId,
        sender: "assistant",
        text: "You do not currently have an active OPD token.",
        timestamp,
        role: "patient",
        language,
        actionLink: {
          label: "Find Care & Book Token",
          href: "/patient/find-care",
        },
      };
    }

    const ahead = token.patientsAhead;
    const waitText = token.estimatedWaitMinutes ? `approximately ${token.estimatedWaitMinutes} minutes` : "a short waiting window";

    return {
      id: msgId,
      sender: "assistant",
      text:
        `Your active token is #${token.tokenNumber} at ${token.facilityName}, ${token.specialty} OPD.\n\n` +
        `• Now Serving: #${token.nowServing}\n` +
        `• Patients Ahead: ${ahead}\n` +
        `• Estimated Waiting Time: ${waitText}\n` +
        `• Doctor: ${token.doctorName}`,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "token_status",
        data: {
          tokenNumber: token.tokenNumber,
          nowServing: token.nowServing,
          patientsAhead: ahead,
          estimatedWaitMinutes: token.estimatedWaitMinutes,
          facilityName: token.facilityName,
          specialty: token.specialty,
          doctorName: token.doctorName,
        },
      },
      actionLink: {
        label: "Track Live OPD Queue",
        href: "/patient/token",
      },
      suggestedPrompts: [
        "When is my next appointment?",
        "What medicines am I taking?",
        "Where is the hospital?",
      ],
    };
  }

  // ── F. APPOINTMENT INTENT ──
  if (
    q.includes("appointment") ||
    q.includes("visit") ||
    q.includes("when is my follow up") ||
    q.includes("checkup") ||
    q.includes("भेट") ||
    q.includes("சந்திப்பு")
  ) {
    const appointments = patientTools.getUpcomingAppointments();

    if (!appointments || appointments.length === 0) {
      return {
        id: msgId,
        sender: "assistant",
        text: "You don't currently have any scheduled upcoming appointments.",
        timestamp,
        role: "patient",
        language,
        actionLink: {
          label: "Find Care & Book Appointment",
          href: "/patient/find-care",
        },
      };
    }

    const next = appointments[0];
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Your next appointment is on ${next.date} at ${next.time} with ${next.doctor} (${next.specialty}) at ${next.facility}.\n\n` +
        `• Status: Confirmed\n` +
        `• Department: ${next.specialty}\n` +
        `• Clinical Reason: Exertional Angina Follow-up & 12-Lead ECG Review`,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "appointment_list",
        data: appointments,
      },
      actionLink: {
        label: "View All Appointments",
        href: "/patient/appointments",
      },
      suggestedPrompts: [
        "What medicines am I taking?",
        "Check my active token",
        "What is my referral status?",
      ],
    };
  }

  // ── G. PRESCRIPTIONS & MEDICATIONS INTENT ──
  if (
    q.includes("medicine") ||
    q.includes("prescription") ||
    q.includes("tablet") ||
    q.includes("dose") ||
    q.includes("taking") ||
    q.includes("metformin") ||
    q.includes("metoprolol") ||
    q.includes("refill") ||
    q.includes("औषध") ||
    q.includes("மருந்து")
  ) {
    const meds = patientTools.getActiveMedications();

    if (!meds || meds.length === 0) {
      return {
        id: msgId,
        sender: "assistant",
        text: "You don't currently have any active medications listed in your profile.",
        timestamp,
        role: "patient",
        language,
      };
    }

    const medLines = meds.map((m) => `• ${m.name} (${m.dose}) — ${m.timing || m.frequency} [${m.daysRemaining} days remaining]`).join("\n");

    return {
      id: msgId,
      sender: "assistant",
      text:
        `You currently have ${meds.length} active medications prescribed by Dr. Ananya Natarajan at Government General Hospital, Chennai:\n\n${medLines}\n\n` +
        `💡 You can reserve refills or view digital barcodes in your prescription wallet.`,
      timestamp,
      role: "patient",
      language,
      actionLink: {
        label: "View Digital Prescriptions & Refills",
        href: "/patient/prescriptions",
      },
      suggestedPrompts: [
        "When is my next appointment?",
        "Where is the nearest pharmacy?",
        "Check my token",
      ],
    };
  }

  // ── H. REFERRAL STATUS INTENT ──
  if (
    q.includes("referral") ||
    q.includes("referred") ||
    q.includes("dhadgaon") ||
    q.includes("संदर्भ") ||
    q.includes("பரிந்துரை")
  ) {
    const ref = patientTools.getReferralStatus();

    if (!ref) {
      return {
        id: msgId,
        sender: "assistant",
        text: "You don't currently have an active inter-facility referral.",
        timestamp,
        role: "patient",
        language,
      };
    }

    return {
      id: msgId,
      sender: "assistant",
      text:
        `Your clinical referral from ${ref.referringFacility} to ${ref.receivingFacility} has been accepted.\n\n` +
        `• Specialty: ${ref.specialty} Specialist\n` +
        `• Status: Accepted & Scheduled\n` +
        `• Receiving Doctor: ${ref.receivingDoctor}\n` +
        `• Scheduled Date: ${ref.appointmentDate} at ${ref.appointmentTime}\n` +
        `• Reason: ${ref.reason}`,
      timestamp,
      role: "patient",
      language,
      actionLink: {
        label: "Track Referral Pathway",
        href: "/patient/referrals",
      },
      suggestedPrompts: [
        "When is my next appointment?",
        "Check my active token",
        "What medicines am I taking?",
      ],
    };
  }

  // ── I. TODAY'S SCHEDULE & REMINDERS INTENT ──
  if (
    q.includes("today") ||
    q.includes("schedule") ||
    q.includes("remind") ||
    q.includes("what do i need to do") ||
    q.includes("आज")
  ) {
    const today = patientTools.getTodaySchedule();
    const token = today.activeToken;
    const nextAppt = today.nextAppointment;

    return {
      id: msgId,
      sender: "assistant",
      text:
        `Here is your healthcare summary for today (${today.date}):\n\n` +
        `• Active Medication: Metformin 500mg (Morning with breakfast & Night with dinner)\n` +
        (token ? `• Active OPD Token: #${token.tokenNumber} at ${token.facilityName} (Currently serving #${token.nowServing})\n` : "• No OPD token currently active\n") +
        (nextAppt ? `• Next Scheduled Visit: ${nextAppt.date} at ${nextAppt.time} with ${nextAppt.doctor} at ${nextAppt.facility}\n` : ""),
      timestamp,
      role: "patient",
      language,
      actionLink: {
        label: "Open Care Overview",
        href: "/patient/dashboard",
      },
    };
  }

  // ── J. HEALTH RECORDS & LAB REPORTS INTENT ──
  if (
    q.includes("record") ||
    q.includes("report") ||
    q.includes("ecg result") ||
    q.includes("blood test") ||
    q.includes("lab") ||
    q.includes("history") ||
    q.includes("abha")
  ) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Your longitudinal health records are securely linked with your ABHA ID (${DEMO_PATIENT.abhaId}):\n\n` +
        `1. 12-Lead ECG Report (24 Aug 2026) — Normal Sinus Rhythm, HR 72 bpm, QTc 418ms (Cardiology OPD, Nandurbar Civil Hospital)\n` +
        `2. Comprehensive Lipid Panel (18 Aug 2026) — Total Cholesterol 192 mg/dL, LDL 118 mg/dL\n` +
        `3. Digital Chest X-Ray PA View (10 Aug 2026) — Clear lung fields, normal cardiothoracic ratio\n` +
        `4. Informed Consent Artefact (26 Aug 2026) — Diagnostic Coronary Angiogram (ABDM Verified)`,
      timestamp,
      role: "patient",
      language,
      actionLink: {
        label: "Open Verified Health Records",
        href: "/patient/records",
      },
    };
  }

  // ── K. HEALTHCARE INTENT CLASSIFICATION & CLINICAL NAVIGATION ROUTER ──
  // Intelligently maps symptoms, specialties, diagnostics, facility searches, and follow-ups.
  return await healthcareIntentRouter.processUserMessage(rawQuery, timestamp, msgId, language);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCTOR ASSISTANT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function handleDoctorQuery(
  q: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  if (q.includes("queue") || q.includes("waiting") || q.includes("patient") || q.includes("token")) {
    const queue = doctorTools.getDoctorQueue();
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Cardiology OPD Live Queue Status (${queue.facility}):\n\n` +
        `• Currently In Consultation: Token #${queue.nowServing}\n` +
        `• Total Patients Waiting: ${queue.totalWaiting}\n` +
        `• Average Consultation Time: ${queue.averageConsultationMinutes} min/patient\n` +
        `• Next Patient: ${queue.nextPatient.name} (Token #${queue.nextPatient.tokenNumber}, ${queue.nextPatient.complaint})`,
      timestamp,
      role: "doctor",
      language,
      actionLink: {
        label: "Open Clinical Consultation Pad",
        href: "/doctor/consultation",
      },
      suggestedPrompts: [
        "Show today's appointments",
        "View patient summary for Arun Sundaram",
        "Issue digital prescription",
      ],
    };
  }

  if (
    q.includes("nearby") ||
    q.includes("facility") ||
    q.includes("hospital") ||
    q.includes("diagnostic") ||
    q.includes("referral") ||
    q.includes("network") ||
    q.includes("catchment")
  ) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Regional Healthcare Network for your registered facility (Government General Hospital, Chennai · Tamil Nadu):\n\n` +
        `1. Medall Heart & Specialty Diagnostic Clinic, Park Town (0.6 km away)\n` +
        `   • Diagnostics: 12-Lead ECG, 2D Echocardiography, TMT\n` +
        `   • Status: Operational (~5m wait)\n\n` +
        `2. Tamil Nadu Government Multi Super Speciality Hospital, Omandurar (1.8 km away)\n` +
        `   • Services: 24/7 Level-1 Cardiac Trauma, Interventional Cath Lab, ICU\n` +
        `   • Public Health Status: 100% Free Super-Speciality Care\n\n` +
        `3. Apollo Hospitals, Greams Road (2.9 km away)\n` +
        `   • Network Role: Ayushman Bharat PM-JAY Empaneled Partner (Cashless)\n\n` +
        `4. Government Stanley Medical College Hospital (3.2 km away)\n` +
        `   • Network Role: Secondary Referral Hub & Tertiary Care Partner`,
      timestamp,
      role: "doctor",
      language,
      actionLink: {
        label: "View Referral Network",
        href: "/doctor/dashboard",
      },
      suggestedPrompts: [
        "How many patients are waiting for me?",
        "Show today's appointments",
        "View patient summary for Arun Sundaram",
      ],
    };
  }

  if (q.includes("appointment") || q.includes("today") || q.includes("schedule")) {
    const appts = doctorTools.getTodayAppointments();
    const apptList = appts.map((a) => `• ${a.time}: ${a.patientName} (${a.type}) — ${a.reason}`).join("\n");
    return {
      id: msgId,
      sender: "assistant",
      text: `You have ${appts.length} scheduled consultations today in Cardiology OPD:\n\n${apptList}`,
      timestamp,
      role: "doctor",
      language,
      actionLink: {
        label: "View Doctor Schedule",
        href: "/doctor/dashboard",
      },
    };
  }

  if (q.includes("arun") || q.includes("sundaram") || q.includes("arjun") || q.includes("history") || q.includes("record")) {
    const pt = doctorTools.getPatientSummary("Arun Sundaram");
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Authorized Patient Clinical Record for ${pt.name} (${pt.age}y, ${pt.gender}) · ABHA: ${pt.abhaId}:\n\n` +
        `• Diagnosis: ${pt.diagnosis}\n` +
        `• Baseline Vitals: ${pt.vitals}\n` +
        `• Recent 12-Lead ECG: ${pt.recentECG}\n` +
        `• Current Medications:\n  ${pt.currentMeds.join("\n  ")}\n` +
        `• Referral Continuity: ${pt.referralPathway}`,
      timestamp,
      role: "doctor",
      language,
      actionLink: {
        label: "Open Full Patient Chart",
        href: "/doctor/patients",
      },
    };
  }

  return {
    id: msgId,
    sender: "assistant",
    text:
      "PRAGATI Clinical Assist is ready. You can query today's OPD queue, view patient clinical histories with ABHA consent, review ECG telemetry, or draft electronic prescriptions.",
    timestamp,
    role: "doctor",
    language,
    suggestedPrompts: [
      "How many patients are waiting for me?",
      "Show today's appointments",
      "View patient summary for Arun Sundaram",
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PROVIDER / PHARMACY ASSISTANT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function handleProviderQuery(
  q: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  if (q.includes("metformin") || q.includes("medicine") || q.includes("inventory") || q.includes("stock") || q.includes("drug")) {
    const stock = providerTools.getInventory(q.includes("metformin") ? "metformin" : undefined);
    const stockList = stock.map((s) => `• ${s.medicine}: ${s.stockUnits} units [${s.status.toUpperCase()}]`).join("\n");
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Hospital Central Pharmacy Stock Status:\n\n${stockList}\n\n` +
        (q.includes("metformin") ? "⚠️ Metformin 500mg is currently OUT OF STOCK. Emergency buffer PO #4421 has been dispatched to TNMSC." : ""),
      timestamp,
      role: "provider",
      language,
      actionLink: {
        label: "Open Medicine Inventory",
        href: "/provider/medicines",
      },
    };
  }

  if (q.includes("diagnostic") || q.includes("ecg") || q.includes("x-ray") || q.includes("lab") || q.includes("capacity")) {
    const diag = providerTools.getDiagnosticCapacity();
    const diagList = diag.map((d) => `• ${d.modality}: ${d.status} (${d.uptimePct} uptime) — ${d.queueLength} in queue (~${d.waitTimeMinutes}m wait)`).join("\n");
    return {
      id: msgId,
      sender: "assistant",
      text: `Diagnostic Modality Operations & Uptime Report:\n\n${diagList}`,
      timestamp,
      role: "provider",
      language,
      actionLink: {
        label: "Manage Diagnostic Services",
        href: "/provider/diagnostics",
      },
    };
  }

  if (
    q.includes("nearby") ||
    q.includes("facility") ||
    q.includes("hospital") ||
    q.includes("demand") ||
    q.includes("network") ||
    q.includes("service area")
  ) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Connected Healthcare Network for your registered business location (Chennai Central Pharmacy & Diagnostics, Tamil Nadu · 15 km Service Radius):\n\n` +
        `• Connected Inpatient Facilities: Government General Hospital, Chennai (0.2 km)\n` +
        `• Super-Speciality Referral Center: Tamil Nadu Multi Super Speciality Hospital, Omandurar (1.8 km)\n` +
        `• Primary Care Spokes: Urban PHC Triplicane (2.4 km)\n` +
        `• Empaneled Hospital Network: Apollo Hospitals, Greams Road (2.9 km)\n` +
        `• Active Dispensing Queue: 8 Tokens waiting (~5 min fulfillment time)`,
      timestamp,
      role: "provider",
      language,
      actionLink: {
        label: "Open Pharmacy Operations",
        href: "/provider/dashboard",
      },
      suggestedPrompts: [
        "Check Metformin 500mg stock",
        "View medicine inventory",
        "Check diagnostic lab queue",
      ],
    };
  }

  return {
    id: msgId,
    sender: "assistant",
    text:
      "PRAGATI Provider & Pharmacy Operations Assist is active. You can check medicine stock units, pending refill reservations, or diagnostic lab throughput.",
    timestamp,
    role: "provider",
    language,
    suggestedPrompts: [
      "Check Metformin 500mg stock",
      "View medicine inventory",
      "Which hospitals are near my pharmacy?",
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GOVERNMENT / HEALTH INTELLIGENCE ASSISTANT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function handleGovernmentQuery(
  q: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  if (
    q.includes("chennai") ||
    q.includes("district") ||
    q.includes("gap") ||
    q.includes("index") ||
    q.includes("access") ||
    q.includes("underserved") ||
    q.includes("shortage") ||
    q.includes("tamil nadu") ||
    q.includes("nandurbar")
  ) {
    const analytics = governmentTools.getDistrictAnalytics(q.includes("chennai") ? "chennai" : undefined);
    const dList = analytics
      .map(
        (d) =>
          `• ${d.district} (${d.state}): Health Index ${d.indexScore}/100 [${d.tier}] — Specialist Coverage: ${d.specialistCoverage}, Diagnostic Uptime: ${d.diagnosticUptime}, Shortages: ${d.acuteShortages}`
      )
      .join("\n");
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Administrative Surveillance Context: Tamil Nadu State Health Command (Chennai District Focus):\n\n${dList}\n\n` +
        `Summary: Chennai District demonstrates high specialist coverage (92%) and 96% diagnostic uptime. Continuous teleconsultation links are active for suburban peripheral health centres.`,
      timestamp,
      role: "government",
      language,
      actionLink: {
        label: "Open State Geographic Map",
        href: "/government/map",
      },
      suggestedPrompts: [
        "Show healthcare shortages in Chennai",
        "View district accessibility index",
        "Check telemedicine load across zones",
      ],
    };
  }

  if (q.includes("shortage") || q.includes("vacancy") || q.includes("triage")) {
    const shortages = governmentTools.getResourceShortages();
    const sList = shortages.map((s) => `• ${s.resource} (${s.district}): ${s.status} -> ${s.action}`).join("\n");
    return {
      id: msgId,
      sender: "assistant",
      text: `Statewide Critical Resource Shortages & Remediation Ledger:\n\n${sList}`,
      timestamp,
      role: "government",
      language,
      actionLink: {
        label: "View Shortage Triage Ledger",
        href: "/government/shortages",
      },
    };
  }

  return {
    id: msgId,
    sender: "assistant",
    text:
      "PRAGATI Health Intelligence Assist is active. You can query statewide district health index scores, specialist vacancy rates, diagnostic uptimes, and pharmaceutical stock buffers across Maharashtra.",
    timestamp,
    role: "government",
    language,
    suggestedPrompts: [
      "Show Nandurbar district healthcare gap",
      "Which districts have critical shortages?",
      "View statewide diagnostic uptime",
    ],
  };
}
