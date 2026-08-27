import { ChatMessage, UserRole, AssistantLanguage } from "./types";
import { permissionGuard } from "./permissionGuard";
import { DEMO_FACILITIES } from "@/data/facilities";
import { DEMO_PATIENT } from "@/data/patient";

export function generateAssistantResponse(
  userQuery: string,
  role: UserRole,
  language: AssistantLanguage = "en"
): ChatMessage {
  const q = userQuery.trim().toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const msgId = `msg-${Date.now()}`;

  // 1. Check Role Permission Guard
  const permCheck = permissionGuard.sanitizeQueryByRole(userQuery, role);
  if (!permCheck.allowed) {
    return {
      id: msgId,
      sender: "assistant",
      text: permCheck.reason || "You do not have permission to access this resource.",
      timestamp,
      role,
      language,
    };
  }

  // 2. Emergency Detection (Universal Safety Rule across Patient & Public)
  const isEmergency =
    q.includes("emergency") ||
    q.includes("chest pain") ||
    q.includes("heart attack") ||
    q.includes("cannot breathe") ||
    q.includes("breathlessness") ||
    q.includes("stroke") ||
    q.includes("severe bleeding") ||
    q.includes("unconscious") ||
    q.includes("நெஞ்சு வலி") ||
    q.includes("छातीत दुखणे") ||
    q.includes("सीने में दर्द");

  if (isEmergency && (role === "patient" || role === "guest")) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        language === "mr"
          ? "तातडीची वैद्यकीय आणीबाणी! कृपया नियमित ओपीडीची वाट पाहू नका. त्वरित १०८ रुग्णवाहिका बोलवा."
          : language === "hi"
          ? "चिकित्सा आपातकाल! कृपया नियमित ओपीडी की प्रतीक्षा न करें। तुरंत 108 एम्बुलेंस बुलाएं।"
          : language === "ta"
          ? "மருத்துவ அவசரநிலை! உடனடியாக 108 அவசர ஆம்புலன்ஸ் அழைக்கவும்."
          : "Possible Medical Emergency Detected. Do not wait for regular OPD. Please call 108 Emergency Ambulance immediately.",
      timestamp,
      role,
      language,
      widget: {
        type: "emergency",
        data: {
          alertTitle: "108 Emergency Ambulance Escalation",
          alertSubtitle: "Acute Emergency Symptoms Detected",
          recommendedFacility: "Nandurbar District Emergency Trauma Center",
          distance: "6.2 km (14 min via NH-753B)",
          emergencyNumber: "108",
        },
      },
      actionLink: {
        label: "Call 108 Now",
        href: "tel:108",
      },
    };
  }

  // 3. UNIVERSAL CONVERSATIONAL INTERACTIONS (Greetings, Identity, Thanks, Casual Chat)
  const conversational = handleConversational(q, role, language, timestamp, msgId);
  if (conversational) {
    return conversational;
  }

  // 4. ROLE-SPECIFIC NLP RESOLUTION
  switch (role) {
    case "doctor":
      return handleDoctorQuery(q, timestamp, msgId, language);

    case "provider":
      return handleProviderQuery(q, timestamp, msgId, language);

    case "government":
      return handleGovernmentQuery(q, timestamp, msgId, language);

    case "patient":
    default:
      return handlePatientQuery(q, timestamp, msgId, language);
  }
}

// ── CONVERSATIONAL / NORMAL CHAT HANDLER ──────────────────────────────────────
function handleConversational(
  q: string,
  role: UserRole,
  language: AssistantLanguage,
  timestamp: string,
  msgId: string
): ChatMessage | null {
  // Greetings: hi, hello, hey, good morning, namaste, vanakkam
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q === "namaste" ||
    q === "namaskar" ||
    q === "vanakkam" ||
    q === "hola" ||
    q.startsWith("hi ") ||
    q.startsWith("hello ") ||
    q.startsWith("hey ") ||
    q === "good morning" ||
    q === "good afternoon" ||
    q === "good evening"
  ) {
    let text = "";
    if (role === "doctor") {
      text =
        language === "mr"
          ? "नमस्कार डॉ. अनन्य राव! मी PRAGATI Clinical Assist आहे. आजच्या ओपीडी रांगेत २४ रुग्ण प्रतीक्षेत आहेत. मी तुम्हाला कशात मदत करू?"
          : language === "ta"
          ? "வணக்கம் டாக்டர் அனன்யா ராவ்! நான் PRAGATI Clinical Assist. இன்றைய OPD வரிசையில் 24 நோயாளிகள் காத்திருக்கின்றனர்."
          : language === "hi"
          ? "नमस्ते डॉ. अनन्या राव! मैं PRAGATI Clinical Assist हूँ। आज की ओपीडी कतार में 24 मरीज प्रतीक्षारत हैं।"
          : "Hello Dr. Ananya! I'm PRAGATI Clinical Assist. You have 24 patients waiting in today's OPD queue. How can I assist your consultation workflow?";
    } else if (role === "provider") {
      text =
        language === "mr"
          ? "नमस्कार राजेश कुलकर्णी! मी PRAGATI Operations Assist आहे. नंदुरबार मध्यवर्ती औषध भांडार आणि लॅब व्यवस्थापनात मदत करू शकतो."
          : language === "ta"
          ? "வணக்கம் ராஜேஷ் குல்கர்னி! நான் PRAGATI Operations Assist. மருந்தக இருப்பு மற்றும் பரிசோதனை நிலையை நிர்வகிக்க உதவுகிறேன்."
          : "Hello Rajesh! I'm PRAGATI Operations Assist for Nandurbar Central Pharmacy. 3 medicines are currently low in stock. How can I help you today?";
    } else if (role === "government") {
      text =
        language === "mr"
          ? "नमस्कार! महाराष्ट्र आरोग्य बुद्धिमत्ता प्रणालीमध्ये आपले स्वागत आहे. ३६ जिल्ह्यांमधील आरोग्य डेटा उपलब्ध आहे."
          : "Welcome! I'm PRAGATI Health Intelligence. Surveillance active across all 36 Maharashtra districts. What health insights would you like to explore?";
    } else {
      text =
        language === "mr"
          ? "नमस्कार अर्जुन! मी PRAGATI Care आहे. तुम्हाला आज कोणत्या आरोग्य सेवेची गरज आहे? तुम्ही लक्षणे सांगू शकता किंवा टोकन तपासू शकता."
          : language === "ta"
          ? "வணக்கம் அர்ஜுன்! நான் PRAGATI Care. உங்களுக்கு இன்று என்ன மருத்துவ உதவி தேவை? மருத்துவமனை கண்டறியலாம் அல்லது டோக்கன் பார்க்கலாம்."
          : language === "hi"
          ? "नमस्ते अर्जुन! मैं PRAGATI Care हूँ। आज आपको किस स्वास्थ्य सेवा की आवश्यकता है? आप अपनी परेशानी बता सकते हैं।"
          : "Hi Arjun! I'm PRAGATI Care, your public healthcare companion in Maharashtra. How are you feeling today? I can help you find care, check live tokens, or review your prescriptions.";
    }

    return {
      id: msgId,
      sender: "assistant",
      text,
      timestamp,
      role,
      language,
      suggestedPrompts:
        role === "doctor"
          ? ["Who is next in queue?", "Summarize patient #42", "Show pending referrals"]
          : role === "provider"
          ? ["Which medicines are low?", "Update ECG availability", "Request resupply"]
          : role === "government"
          ? ["Which districts have access gaps?", "Why is Nandurbar flagged?", "Show workload trends"]
          : ["Find a Cardiologist & ECG", "Check My Token (#47)", "Upcoming Appointments"],
    };
  }

  // "How are you?" / "how r u"
  if (q.includes("how are you") || q.includes("how r u") || q.includes("kasa ahes") || q.includes("epdi irukinga") || q.includes("kaise ho")) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        language === "mr"
          ? "मी उत्तम आहे, धन्यवाद! PRAGATI प्लॅटफॉर्मवर आपली मदत करण्यास सदैव तयार आहे. आज मी तुम्हाला कशी मदत करू?"
          : language === "ta"
          ? "நான் நன்றாக இருக்கிறேன், நன்றி! உங்களுக்கு தேவையான சுகாதார சேவைகளை ஒருங்கிணைக்க தயாராக உள்ளேன்."
          : language === "hi"
          ? "मैं ठीक हूँ, पूछने के लिए धन्यवाद! मैं आपकी स्वास्थ्य सेवा में सहायता के लिए पूरी तरह तैयार हूँ।"
          : "I'm doing great, thank you for asking! I'm fully connected to PRAGATI's Maharashtra public healthcare network. How can I help you today?",
      timestamp,
      role,
      language,
    };
  }

  // Identity / "Who are you?" / "What is your name?" / "What can you do?"
  if (
    q.includes("who are you") ||
    q.includes("what are you") ||
    q.includes("what is your name") ||
    q.includes("what can you do") ||
    q.includes("your purpose") ||
    q.includes("tu kon ahes") ||
    q.includes("yaar neenga")
  ) {
    const text =
      role === "doctor"
        ? "I am PRAGATI Clinical Assist — an AI clinical workflow copilot for Dr. Ananya Rao at Nandurbar District Civil Hospital. I help you track live OPD queues, summarize longitudinal patient health histories, draft e-prescriptions, and coordinate referrals."
        : role === "provider"
        ? "I am PRAGATI Operations Assist — an intelligent operational support system for Nandurbar Central Pharmacy & Diagnostic Labs. I monitor stockouts, manage machine availability, and prepare state resupply requisitions."
        : role === "government"
        ? "I am PRAGATI Health Intelligence — a public healthcare surveillance and decision-support assistant for Maharashtra state authorities, tracking accessibility, specialist shortages, and facility workloads across 36 districts."
        : "I am PRAGATI Care — your AI healthcare guide for public health services across Maharashtra. I help you find available care, check live OPD tokens, manage appointments, view ABHA-linked health records, and connect with doctors via PRAGATI teleconsultation.";

    return {
      id: msgId,
      sender: "assistant",
      text,
      timestamp,
      role,
      language,
      suggestedPrompts: ["How does PRAGATI work?", "Find available care", "Emergency Help (108)"],
    };
  }

  // "What is PRAGATI?" / "How does this work?" / "explain"
  if (
    q.includes("what is pragati") ||
    q.includes("how it works") ||
    q.includes("how does this work") ||
    q.includes("explain pragati") ||
    q.includes("tell me about pragati")
  ) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "PRAGATI (Platform for Rural Access, Guidance & Integrated Treatment) connects patients across Maharashtra with verified, accessible public healthcare.\n\n" +
        "Key Pillars:\n" +
        "1. Need-Based Triage: Matches clinical symptoms with verified doctor & bed availability before you travel.\n" +
        "2. Live OPD Token System: Eliminates crowded hospital queues with real-time queue tracking.\n" +
        "3. PRAGATI Hub-and-Spoke Telemedicine: Connects rural PHCs directly with tertiary specialists.\n" +
        "4. ABHA Longitudinal Records: Seamless digital health history shared across healthcare facilities.",
      timestamp,
      role,
      language,
      actionLink: {
        label: "Explore How It Works",
        href: "/#how-it-works",
      },
    };
  }

  // Thanks: thank you, thanks, tq, dhanyavad, nandri, shukriya
  if (
    q.includes("thank") ||
    q === "tq" ||
    q === "thanks" ||
    q.includes("nandri") ||
    q.includes("dhanyawad") ||
    q.includes("dhanyavad") ||
    q.includes("shukriya")
  ) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        language === "mr"
          ? "आपले मनापासून स्वागत आहे! आपल्याला आरोग्याबाबत आणखी काही मदत हवी असल्यास नक्की सांगा."
          : language === "ta"
          ? "மிக்க மகிழ்ச்சி! மேலும் ஏதேனும் உதவி தேவைப்பட்டால் தயங்காமல் கேளுங்கள்."
          : language === "hi"
          ? "आपका स्वागत है! यदि आपको किसी अन्य स्वास्थ्य सेवा या जानकारी की आवश्यकता हो, तो कृपया बताएं।"
          : "You're very welcome! If you need anything else regarding your health, appointments, or hospital care, feel free to ask anytime.",
      timestamp,
      role,
      language,
    };
  }

  // Acknowledgments: ok, okay, cool, got it, alright, bye, goodbye
  if (q === "ok" || q === "okay" || q === "got it" || q === "alright" || q === "cool" || q === "sure") {
    return {
      id: msgId,
      sender: "assistant",
      text: "Great! Let me know whenever you'd like to check tokens, find care, or view your medical records.",
      timestamp,
      role,
      language,
    };
  }

  if (q.includes("bye") || q.includes("goodbye") || q.includes("see you")) {
    return {
      id: msgId,
      sender: "assistant",
      text: "Take care of your health! Remember that PRAGATI and the 108 emergency service are always available if you need assistance.",
      timestamp,
      role,
      language,
    };
  }

  // General Mild Symptoms Conversation (Headache, Stomach pain, Cold, Fever, Cough, Body ache)
  if (
    q.includes("headache") ||
    q.includes("head ache") ||
    q.includes("stomach pain") ||
    q.includes("stomach ache") ||
    q.includes("cold") ||
    q.includes("cough") ||
    q.includes("body pain") ||
    q.includes("feeling tired") ||
    q.includes("dizziness")
  ) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "I understand you're experiencing discomfort. While I cannot provide a medical diagnosis, these symptoms are commonly evaluated at your nearest Primary Health Centre (PHC) or Sub-District Hospital.\n\n" +
        "Recommended Next Steps:\n" +
        "• If symptoms are mild: Rest, stay hydrated, and consult a doctor at your local PHC.\n" +
        "• If symptoms worsen or are accompanied by severe pain or high fever: Visit the nearest OPD or start a teleconsultation.",
      timestamp,
      role,
      language,
      actionLink: {
        label: "Find Nearest Primary Health Centre",
        href: "/patient/find-care?specialty=general",
      },
      suggestedPrompts: [
        "Find available primary care nearby",
        "Check my current token",
        "Start teleconsultation",
      ],
    };
  }

  // About Nandurbar hospital or Maharashtra healthcare
  if (q.includes("nandurbar") || q.includes("hospital info") || q.includes("civil hospital")) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "Nandurbar District Civil Hospital is a 300-bed secondary & tertiary healthcare facility equipped with 24/7 emergency trauma, active Cardiology OPD, 12-lead ECG, radiology, and an automated pharmacy counter. It connects with rural spoke PHCs like Dhadgaon and Akkalkuwa via PRAGATI teleconsultation.",
      timestamp,
      role,
      language,
      actionLink: {
        label: "View Nandurbar Hospital Details",
        href: "/patient/find-care",
      },
    };
  }

  return null; // Fall through to domain-specific queries
}

// ── PATIENT LOGIC ─────────────────────────────────────────────────────────────
function handlePatientQuery(
  q: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  // Token / Queue queries
  if (
    q.includes("token") ||
    q.includes("queue") ||
    q.includes("where am i") ||
    q.includes("my number") ||
    q.includes("टोकन") ||
    q.includes("டோக்கன்")
  ) {
    const token = DEMO_PATIENT.activeToken!;
    return {
      id: msgId,
      sender: "assistant",
      text: `Your active OPD token is #${token.tokenNumber}. Currently serving #${token.nowServing} (${token.tokenNumber - token.nowServing} patients ahead of you).`,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "token_status",
        data: {
          tokenNumber: token.tokenNumber,
          nowServing: token.nowServing,
          patientsAhead: token.tokenNumber - token.nowServing,
          estimatedWaitMinutes: token.estimatedWait,
          facilityName: "Nandurbar District Civil Hospital",
          specialty: "Cardiology",
          doctorName: "Dr. Ananya Rao",
        },
      },
      actionLink: {
        label: "Track Live Queue",
        href: "/patient/token",
      },
    };
  }

  // Cardiologist / ECG / Facilities / Find Healthcare
  if (
    q.includes("cardiology") ||
    q.includes("cardiologist") ||
    q.includes("ecg") ||
    q.includes("hospital") ||
    q.includes("find care") ||
    q.includes("find healthcare") ||
    q.includes("healthcare") ||
    q.includes("clinic") ||
    q.includes("phc") ||
    q.includes("doctor venum") ||
    q.includes("doctor pahije") ||
    q.includes("doctor chahiye") ||
    q.includes("fever") ||
    q.includes("where to go")
  ) {
    const facilities = DEMO_FACILITIES.slice(0, 2).map((f, idx) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      distanceKm: f.distanceKm,
      travelMinutes: f.travelMinutes,
      matchScore: f.matchScore,
      specialistAvailable: true,
      specialistName: "Dr. Ananya Rao",
      diagnosticAvailable: true,
      diagnosticWaitMinutes: 15,
      queueWaitMinutes: 18,
      isBestMatch: idx === 0,
    }));

    return {
      id: msgId,
      sender: "assistant",
      text:
        language === "mr"
          ? "तुमच्या गरजेनुसार नंदुरबारमधील उपलब्ध शासकीय आरोग्य सेवा सापडल्या आहेत."
          : language === "ta"
          ? "உங்கள் தேவைக்கேற்ப நந்தூர்பாரில் கிடைக்கும் பொது மருத்துவமனைகள் கண்டறியப்பட்டன."
          : "Based on your clinical need, PRAGATI matched these verified public healthcare facilities near Nandurbar:",
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "facility_list",
        data: facilities,
      },
      actionLink: {
        label: "Open Facility Triage",
        href: "/patient/find-care?specialty=cardiology",
      },
    };
  }

  // Appointments
  if (q.includes("appointment") || q.includes("visit") || q.includes("when is my follow up")) {
    const appt = DEMO_PATIENT.upcomingAppointments[0];
    return {
      id: msgId,
      sender: "assistant",
      text: `You have an upcoming appointment scheduled on ${appt.date} at ${appt.time} with ${appt.doctor} (${appt.specialty}) at ${appt.facility}.`,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "appointment_list",
        data: DEMO_PATIENT.upcomingAppointments,
      },
      actionLink: {
        label: "View Care Timeline",
        href: "/patient/appointments",
      },
    };
  }

  // Prescriptions / Meds
  if (q.includes("prescription") || q.includes("medicine") || q.includes("tablet") || q.includes("dose")) {
    return {
      id: msgId,
      sender: "assistant",
      text: "Here are your active digital prescriptions prescribed by Dr. Ananya Rao at Nandurbar District Civil Hospital:",
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "patient_summary",
        data: {
          name: DEMO_PATIENT.name,
          age: DEMO_PATIENT.age,
          gender: DEMO_PATIENT.gender,
          abhaId: DEMO_PATIENT.abhaId,
          location: DEMO_PATIENT.location,
          currentVisitReason: "Hypertension & Routine Follow-up",
          recentConsultation: "25 Aug 2026 · Dr. Ananya Rao",
          recentDiagnostic: "12-Lead ECG · Normal Sinus Rhythm",
          activeMedicationsCount: DEMO_PATIENT.currentMedications.length,
          nextFollowUp: "30 Aug 2026 · 10:30 AM",
          referralStatus: "Dhadgaon PHC ⟷ Nandurbar Civil (Accepted)",
        },
      },
      actionLink: {
        label: "View Digital Prescriptions",
        href: "/patient/prescriptions",
      },
    };
  }

  // Health Records
  if (q.includes("record") || q.includes("history") || q.includes("report") || q.includes("abha")) {
    return {
      id: msgId,
      sender: "assistant",
      text: "Your longitudinal health records are securely linked with ABHA ID (91-4829-1049-3821). All records are accessed with your consent.",
      timestamp,
      role: "patient",
      language,
      actionLink: {
        label: "Open Health Records",
        href: "/patient/records",
      },
    };
  }

  // General fallback for patient
  return {
    id: msgId,
    sender: "assistant",
    text: `I'm here to assist you with public healthcare in Maharashtra. You can ask me naturally about your symptoms, available doctors, queue wait times, or medicine refills. What can I do for you today?`,
    timestamp,
    role: "patient",
    language,
    suggestedPrompts: [
      "Find an ECG & Cardiologist near me",
      "Where am I in the queue?",
      "When is my next appointment?",
      "Show my active medications",
    ],
  };
}

// ── DOCTOR LOGIC ─────────────────────────────────────────────────────────────
function handleDoctorQuery(
  q: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  if (q.includes("who is next") || q.includes("next patient") || q.includes("token #42") || q.includes("queue")) {
    return {
      id: msgId,
      sender: "assistant",
      text: "Token #42 is next in line for Cardiology OPD.",
      timestamp,
      role: "doctor",
      language,
      widget: {
        type: "patient_summary",
        data: {
          name: "Arjun Deshmukh",
          age: 54,
          gender: "Male",
          abhaId: "91-4829-1049-3821",
          location: "Nandurbar",
          currentVisitReason: "Cardiology follow-up & mild exertion discomfort",
          recentConsultation: "23 Aug 2026 (Nandurbar OPD)",
          recentDiagnostic: "ECG (24 Aug) — Normal Sinus Rhythm, HR 74 bpm",
          activeMedicationsCount: 2,
          nextFollowUp: "30 Aug 2026",
          referralStatus: "Dhadgaon Rural PHC ⟷ District Civil Hospital (Accepted)",
        },
      },
      actionLink: {
        label: "Open Consultation Pad for #42",
        href: "/doctor/consultation?token=42",
      },
    };
  }

  if (q.includes("summarize") || q.includes("patient summary") || q.includes("arjun")) {
    return {
      id: msgId,
      sender: "assistant",
      text: "Clinical Summary for Arjun Deshmukh (54y/M, ABHA: 91-4829-1049-3821):",
      timestamp,
      role: "doctor",
      language,
      widget: {
        type: "patient_summary",
        data: {
          name: "Arjun Deshmukh",
          age: 54,
          gender: "Male",
          abhaId: "91-4829-1049-3821",
          location: "Nandurbar",
          currentVisitReason: "Hypertension follow-up & exertion tightness",
          recentConsultation: "23 Aug 2026 (Cardiology OPD)",
          recentDiagnostic: "12-Lead ECG (24 Aug) · Fasting Blood Sugar 112 mg/dL",
          activeMedicationsCount: 2,
          nextFollowUp: "30 Aug 2026",
          referralStatus: "Accepted at Nandurbar District Civil Hospital",
        },
      },
      actionLink: {
        label: "Start Consultation & MMC Rx",
        href: "/doctor/consultation",
      },
    };
  }

  if (q.includes("draft prescription") || q.includes("write rx") || q.includes("prepare prescription")) {
    return {
      id: msgId,
      sender: "assistant",
      text: "I have prepared a clinical prescription draft for your review. (AI drafts require explicit doctor review and digital signing).",
      timestamp,
      role: "doctor",
      language,
      widget: {
        type: "confirmation",
        data: {
          actionType: "DRAFT_PRESCRIPTION",
          title: "Review Draft Prescription for Arjun Deshmukh",
          description: "Metoprolol Succinate 50mg (1 tab OD) + Aspirin 75mg (1 tab OD) for 30 days.",
          payload: { patientId: "pat-001", doctorReg: "MMC-2014-08-3921" },
          confirmedText: "Prescription signed with MMC-2014-08-3921 and transmitted to Nandurbar Central Pharmacy.",
        },
      },
    };
  }

  return {
    id: msgId,
    sender: "assistant",
    text: "Clinical Assistant ready. You have 24 OPD patients waiting in Cardiology at Nandurbar District Civil Hospital. How can I assist your workflow?",
    timestamp,
    role: "doctor",
    language,
    suggestedPrompts: [
      "Who is next in queue?",
      "Summarize patient #42",
      "Show pending referrals from Dhadgaon PHC",
      "Check available diagnostic slots",
    ],
  };
}

// ── PROVIDER LOGIC ───────────────────────────────────────────────────────────
function handleProviderQuery(
  q: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  if (q.includes("low stock") || q.includes("running low") || q.includes("inventory") || q.includes("medicine")) {
    const meds = [
      { id: "m1", name: "Amoxicillin 250mg", stockUnits: 48, status: "limited" as const, category: "Antibiotic", unit: "capsules" },
      { id: "m2", name: "Metformin 500mg", stockUnits: 0, status: "unavailable" as const, category: "Antidiabetic", unit: "tablets" },
      { id: "m3", name: "Atorvastatin 20mg", stockUnits: 12, status: "limited" as const, category: "Cardiovascular", unit: "tablets" },
      { id: "m4", name: "Paracetamol 500mg", stockUnits: 240, status: "available" as const, category: "Analgesic", unit: "tablets" },
    ];

    return {
      id: msgId,
      sender: "assistant",
      text: "3 essential medicines are currently below the critical stock threshold at Nandurbar Central Pharmacy:",
      timestamp,
      role: "provider",
      language,
      widget: {
        type: "medicine_inventory",
        data: meds,
      },
      actionLink: {
        label: "Open Full Medicine Inventory",
        href: "/provider/medicines",
      },
    };
  }

  if (q.includes("resupply") || q.includes("request stock") || q.includes("order")) {
    return {
      id: msgId,
      sender: "assistant",
      text: "I can prepare a state supply chain resupply requisition for Metformin 500mg (500 units) and Amoxicillin 250mg (300 units).",
      timestamp,
      role: "provider",
      language,
      widget: {
        type: "confirmation",
        data: {
          actionType: "REQUEST_RESUPPLY",
          title: "Confirm State Pharmacy Resupply Request",
          description: "Dispatch requisition to Maharashtra State Medical Supplies Corp (MSMSCL) Nashik Regional Hub.",
          payload: { items: ["Metformin 500mg", "Amoxicillin 250mg"] },
          confirmedText: "Requisition #MSMSCL-NDB-8392 submitted. Expected dispatch: 24-48 hours.",
        },
      },
    };
  }

  return {
    id: msgId,
    sender: "assistant",
    text: "Operations Assist active for Nandurbar District Central Pharmacy. What operational task would you like to manage?",
    timestamp,
    role: "provider",
    language,
    suggestedPrompts: [
      "Which medicines are low in stock?",
      "Update ECG service availability",
      "Request resupply for Metformin",
      "Show incoming referral transfers",
    ],
  };
}

// ── GOVERNMENT LOGIC ─────────────────────────────────────────────────────────
function handleGovernmentQuery(
  q: string,
  timestamp: string,
  msgId: string,
  language: AssistantLanguage
): ChatMessage {
  if (
    q.includes("gap") ||
    q.includes("accessibility") ||
    q.includes("district") ||
    q.includes("shortage") ||
    q.includes("nandurbar")
  ) {
    const districts = [
      {
        rank: "01",
        district: "Nandurbar",
        primaryGap: "Specialist shortage in cardiology and pediatrics",
        gapSeverity: "HIGH" as const,
        specialistScore: "LOW (32%)",
        diagnosticsScore: "MODERATE (68%)",
        teleconsultStatus: "ACTIVE (Hub-and-Spoke)",
      },
      {
        rank: "02",
        district: "Gadchiroli",
        primaryGap: "Diagnostic lab machine turnaround delay",
        gapSeverity: "MODERATE" as const,
        specialistScore: "MODERATE (54%)",
        diagnosticsScore: "LOW (41%)",
        teleconsultStatus: "EXPANDING",
      },
      {
        rank: "03",
        district: "Palghar",
        primaryGap: "High OPD patient workload vs bed capacity",
        gapSeverity: "HIGH" as const,
        specialistScore: "MODERATE (62%)",
        diagnosticsScore: "HIGH (82%)",
        teleconsultStatus: "ACTIVE",
      },
    ];

    return {
      id: msgId,
      sender: "assistant",
      text: "DEMO DATA: Based on the current public healthcare surveillance dataset across Maharashtra, these districts show key accessibility indicators:",
      timestamp,
      role: "government",
      language,
      widget: {
        type: "district_analytics",
        data: districts,
      },
      actionLink: {
        label: "Open Maharashtra Analytics Map",
        href: "/government/dashboard",
      },
    };
  }

  return {
    id: msgId,
    sender: "assistant",
    text: "Maharashtra Health Intelligence System active. You have access to aggregated district surveillance across 36 districts.",
    timestamp,
    role: "government",
    language,
    suggestedPrompts: [
      "Which districts have the biggest access gaps?",
      "Why is Nandurbar flagged in surveillance?",
      "Summarize specialist shortages",
      "Show workload trends vs bed capacity",
    ],
  };
}
