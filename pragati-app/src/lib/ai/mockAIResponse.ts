// ─── PRAGATI ASSIST — CRITICAL INTENT ROUTER & DATA-GROUNDED ENGINE ─────────
// Rule: NEVER respond with a generic introduction when the patient has asked a meaningful question.
// Multi-step conversational triage engine with safety, memory, and zero hallucination.

import { ChatMessage, UserRole, AssistantLanguage } from "./types";
import { patientTools, doctorTools, providerTools, governmentTools } from "./assistantTools";
import { symptomTriageEngine } from "./symptomTriageEngine";
import { DEMO_PATIENT } from "@/data/patient";
import { DEMO_FACILITIES } from "@/data/facilities";

export function generateAssistantResponse(
  query: string,
  role: UserRole,
  language: AssistantLanguage = "en"
): ChatMessage {
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

function handlePatientQuery(
  rawQuery: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  const q = rawQuery.trim().toLowerCase();

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
        "I have fever",
        "What is my token?",
        "When is my next appointment?",
        "Find Care near me",
      ],
    };
  }

  // ── B. SYMPTOM CONVERSATION ENGINE (Nausea, Fever, Headache, Migraine, Cough, etc.) ──
  const triageResponse = symptomTriageEngine.processSymptomQuery(rawQuery, timestamp, msgId, language);
  if (triageResponse) {
    return triageResponse;
  }

  // ── C. "WHAT SHOULD I DO?" / "WHAT MEDICINE CAN I TAKE?" ──
  if (
    q.includes("what should i do") ||
    q.includes("how to get rid") ||
    q.includes("how to cure") ||
    q.includes("what medicine should i take") ||
    q.includes("medicine for fever") ||
    q.includes("tablet for headache") ||
    q.includes("medicine for nausea")
  ) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "Fever, nausea, or discomfort is usually a sign that your body is responding to an underlying cause. The safest approach is to monitor symptoms carefully and seek professional advice.\n\n" +
        "Safe General Guidance:\n" +
        "• Rest adequately and drink plenty of fluids (water, ORS, warm broths) to avoid dehydration.\n" +
        "• For over-the-counter fever reducers such as Paracetamol, always check package labeling or consult a healthcare professional/pharmacist for appropriate dosage based on your age and health history.\n" +
        "• Avoid taking multiple combination remedies simultaneously without medical advice.\n" +
        "• Never administer aspirin to children or teenagers.\n\n" +
        "Would you like to find verified public healthcare facilities near your current location?",
      timestamp,
      role: "patient",
      language,
      actionLink: {
        label: "Find Healthcare Facilities Near You",
        href: "/patient/find-care?specialty=general",
      },
      suggestedPrompts: [
        "Find Healthcare Near Me",
        "Check my active medications",
        "Check my OPD token",
      ],
    };
  }

  // ── D. EMERGENCY INTENT (Acute chest pain, 108, heart attack, emergency) ──
  if (
    q.includes("emergency") ||
    q.includes("108") ||
    q.includes("ambulance") ||
    q.includes("heart attack") ||
    q.includes("chest pain severe") ||
    q.includes("cannot breathe") ||
    q.includes("unconscious")
  ) {
    const nearestEmergency = DEMO_FACILITIES.find((f) => f.emergencyCapability) || DEMO_FACILITIES[0];
    return {
      id: msgId,
      sender: "assistant",
      text:
        language === "mr"
          ? "तातडीची वैद्यकीय मदत आवश्यक आहे. कृपया विलंब न करता त्वरित १०८ रुग्णवाहिकेला कॉल करा."
          : language === "ta"
          ? "அவசர மருத்துவ உதவி தேவை. தாமதிக்காமல் உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்."
          : "🚨 EMERGENCY ALERT: For acute chest pain, severe trauma, or breathing difficulty, immediate hospital stabilization is critical. Please call 108 emergency ambulance now.",
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "facility_list",
        data: [
          {
            id: nearestEmergency.id,
            name: nearestEmergency.name,
            type: nearestEmergency.type,
            distanceKm: nearestEmergency.distanceKm || 2.4,
            travelMinutes: nearestEmergency.travelMinutes || 10,
            specialistAvailable: true,
            specialistName: "24/7 Trauma ICU",
            diagnosticAvailable: true,
            diagnosticWaitMinutes: 5,
            queueWaitMinutes: 5,
            isBestMatch: true,
          },
        ],
      },
      actionLink: {
        label: "Call 108 Emergency Now",
        href: "tel:108",
      },
      suggestedPrompts: [
        "Call 108 Emergency",
        "Where is the closest hospital?",
        "Check my active token",
      ],
    };
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

  // ── K. NEARBY / BEST MATCH FACILITY & SERVICE DISCOVERY (Government + Private) ──
  if (
    q.includes("near me") ||
    q.includes("nearby") ||
    q.includes("ecg") ||
    q.includes("cardiology") ||
    q.includes("cardiologist") ||
    q.includes("hospital") ||
    q.includes("closest") ||
    q.includes("nearest") ||
    q.includes("find care") ||
    q.includes("clinic") ||
    q.includes("phc") ||
    q.includes("chc") ||
    q.includes("pharmacy") ||
    q.includes("private") ||
    q.includes("government") ||
    q.includes("govt")
  ) {
    const isPrivateOnly = (q.includes("private") || q.includes("pvt")) && !q.includes("government") && !q.includes("govt");
    const isGovtOnly = (q.includes("government") || q.includes("govt") || q.includes("public")) && !q.includes("private");
    const isEcg = q.includes("ecg");
    const isCardio = q.includes("cardio") || q.includes("heart");

    let filtered = DEMO_FACILITIES;
    if (isPrivateOnly) {
      filtered = DEMO_FACILITIES.filter((f) => f.ownershipSector === "PRIVATE" || f.ownership === "private" || f.ownership === "private_empaneled");
    } else if (isGovtOnly) {
      filtered = DEMO_FACILITIES.filter((f) => f.ownershipSector === "GOVERNMENT" || f.ownership === "government");
    }

    if (isCardio) {
      filtered = filtered.filter((f) => (f.specialties || []).some((s: string) => s.toLowerCase().includes("cardio")));
    }
    if (isEcg) {
      filtered = filtered.filter((f) => (f.services?.some(s => s.toLowerCase().includes("ecg")) || (f.diagnostics || []).some((d) => d.name.toLowerCase().includes("ecg"))));
    }

    if (filtered.length === 0) {
      filtered = DEMO_FACILITIES.slice(0, 2);
    }

    const facilities = filtered.slice(0, 2).map((f, idx) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      distanceKm: f.distanceKm || (idx === 0 ? 2.4 : 3.8),
      travelMinutes: f.travelMinutes || (idx === 0 ? 10 : 18),
      matchScore: idx === 0 ? 96 : 88,
      specialistAvailable: true,
      specialistName: isCardio ? (f.doctors?.find((d) => d.specialty.includes("Cardio"))?.name || "Cardiologist on Duty") : (f.doctors?.[0]?.name || "Doctor on Duty"),
      diagnosticAvailable: true,
      diagnosticWaitMinutes: isEcg ? 5 : 15,
      queueWaitMinutes: f.queue?.estimatedWait || 12,
      isBestMatch: idx === 0,
    }));

    let intro = "Based on your current location, here are verified healthcare facilities (Government & Private):";
    if (isPrivateOnly && isCardio) {
      intro = "Here are verified private cardiology clinics and multi-specialty hospitals near your current location:";
    } else if (isPrivateOnly && isEcg) {
      intro = "Here are verified private hospitals and diagnostic centers with active 12-lead ECG near you:";
    } else if (isPrivateOnly) {
      intro = "Here are verified private healthcare facilities and clinics near your current location:";
    } else if (isGovtOnly && isEcg) {
      intro = "Here are verified government public hospitals with active 12-lead ECG machines (100% free):";
    } else if (isGovtOnly) {
      intro = "Here are verified government public healthcare facilities near your current location (Free Care):";
    } else if (isEcg) {
      intro = "Here are verified healthcare facilities (Government & Private) with active 12-lead ECG machines near your current location:";
    } else if (isCardio) {
      intro = "Here are verified healthcare facilities with active Cardiology specialist consultations near you:";
    }

    return {
      id: msgId,
      sender: "assistant",
      text:
        `${intro}\n\n` +
        `1. ${facilities[0].name} — ${facilities[0].distanceKm} km away\n` +
        `   • Type: ${facilities[0].type}\n` +
        `   • Status: Open Now (Queue: ~${facilities[0].queueWaitMinutes} min wait)\n` +
        `   • Diagnostics: 12-Lead ECG Operational\n` +
        `   • Doctor: ${facilities[0].specialistName}\n\n` +
        `2. ${facilities[1].name} — ${facilities[1].distanceKm} km away (~${facilities[1].travelMinutes} min travel)\n` +
        `   • Type: ${facilities[1].type}\n\n` +
        `Would you like to book an OPD token, start a teleconsultation, or get driving directions?`,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "facility_list",
        data: facilities,
      },
      actionLink: {
        label: "Open Care Finder & Map",
        href: "/patient/find-care",
      },
      suggestedPrompts: [
        "Book a token",
        "Find private hospitals near me",
        "Find government hospitals near me",
      ],
    };
  }

  // ── L. CLEAN CONVERSATIONAL FALLBACK ──
  return {
    id: msgId,
    sender: "assistant",
    text:
      "I'm here to help. If you're feeling unwell, please tell me your symptoms and I will help guide you to safe care and nearby public facilities.",
    timestamp,
    role: "patient",
    language,
    suggestedPrompts: [
      "I got food poisoning",
      "I got fever",
      "What is my token?",
      "When is my next appointment?",
    ],
  };
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
