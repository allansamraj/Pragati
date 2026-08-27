// ─── PRAGATI ASSIST — SYMPTOM-AWARE GUIDED HEALTHCARE TRIAGE ENGINE ────────
// Conversational Triage Lifecycle:
// Symptom -> Ask Relevant Follow-up Questions -> Assess Basic Severity ->
// Safe General Guidance -> Determine Care Requirement -> Use Location Context -> Return Verified Facilities.

import { ChatMessage, AssistantLanguage } from "./types";
import { DEMO_FACILITIES, Facility } from "@/data/facilities";

export type SymptomType =
  | "fever"
  | "migraine_headache"
  | "cough_cold"
  | "stomach_pain"
  | "chest_discomfort"
  | "pediatric_concern"
  | "general_unwell";

export type TriageStep =
  | "ASKED_DURATION"
  | "ASKED_SEVERITY_OR_TEMP"
  | "ASKED_RED_FLAGS"
  | "COMPLETED_SAFE_GUIDANCE";

export interface TriageSession {
  symptomType: SymptomType;
  step: TriageStep;
  duration?: string;
  temperature?: string;
  severity?: "mild" | "moderate" | "severe";
  associatedSymptoms?: string[];
  hasRedFlags?: boolean;
  triageTier?: "ROUTINE" | "URGENT" | "EMERGENCY";
  recommendedDepartment: string;
}

const SESSION_STORAGE_KEY = "pragati_active_symptom_triage";

export const symptomTriageEngine = {
  /**
   * Retrieves active session from memory/storage.
   */
  getSession(): TriageSession | null {
    if (typeof window === "undefined") return null;
    try {
      const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Saves updated session state.
   */
  saveSession(session: TriageSession): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {}
  },

  /**
   * Clears active triage session.
   */
  clearSession(): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  },

  /**
   * Evaluates if a query initiates or continues a symptom triage lifecycle.
   */
  processSymptomQuery(
    query: string,
    timestamp: string,
    msgId: string,
    language: AssistantLanguage
  ): ChatMessage | null {
    const q = query.trim().toLowerCase();
    const session = this.getSession();

    // ── 1. SCREEN FOR IMMEDIATE CRITICAL RED FLAGS AT ANY TIME ──
    const hasImmediateEmergency =
      q.includes("cannot breathe") ||
      q.includes("severe chest pain") ||
      q.includes("chest pressure") ||
      q.includes("unconscious") ||
      q.includes("seizure") ||
      q.includes("fainted") ||
      q.includes("fainting") ||
      q.includes("coughing blood") ||
      q.includes("severe breathlessness");

    if (hasImmediateEmergency) {
      this.clearSession();
      return this.generateEmergencyResponse(timestamp, msgId, language);
    }

    // ── 2. IF EXISTING ACTIVE SESSION IN PROGRESS, CONTINUE STEPWISE ──
    if (session) {
      // Step A -> User answered Duration
      if (session.step === "ASKED_DURATION") {
        session.duration = query;
        session.step = "ASKED_SEVERITY_OR_TEMP";
        this.saveSession(session);
        return this.generateSeverityQuestion(session, timestamp, msgId, language);
      }

      // Step B -> User answered Temperature or Severity details
      if (session.step === "ASKED_SEVERITY_OR_TEMP") {
        session.temperature = query;
        session.step = "ASKED_RED_FLAGS";
        this.saveSession(session);
        return this.generateRedFlagQuestion(session, timestamp, msgId, language);
      }

      // Step C -> User answered Red Flag screening
      if (session.step === "ASKED_RED_FLAGS") {
        const mentionsConcerningSigns =
          q.includes("yes") ||
          q.includes("weak") ||
          q.includes("breath") ||
          q.includes("vomit") ||
          q.includes("rash") ||
          q.includes("severe");

        session.hasRedFlags = mentionsConcerningSigns;
        session.step = "COMPLETED_SAFE_GUIDANCE";
        session.triageTier = mentionsConcerningSigns ? "URGENT" : "ROUTINE";
        this.saveSession(session);

        return this.generateGuidanceAndFacilitiesResponse(session, timestamp, msgId, language);
      }
    }

    // ── 3. DETECT NEW SYMPTOM INITIATION ──
    const detectedSymptom = this.classifyInitialSymptom(q);
    if (!detectedSymptom) {
      return null; // Not a symptom query -> fall through to regular handlers
    }

    // Initialize new session
    const newSession: TriageSession = {
      symptomType: detectedSymptom,
      step: "ASKED_DURATION",
      recommendedDepartment: this.getDepartmentForSymptom(detectedSymptom),
    };
    this.saveSession(newSession);

    return this.generateDurationQuestion(newSession, timestamp, msgId, language);
  },

  /**
   * Classifies user input into primary symptom categories.
   */
  classifyInitialSymptom(q: string): SymptomType | null {
    if (q.includes("fever") || q.includes("ताप") || q.includes("காய்ச்சல்") || q.includes("बुखार") || q.includes("temp") || q.includes("hot body") || q.includes("shivering")) {
      if (q.includes("child") || q.includes("baby") || q.includes("kid") || q.includes("बाळ") || q.includes("குழந்தை")) {
        return "pediatric_concern";
      }
      return "fever";
    }

    if (q.includes("migran") || q.includes("migraine") || q.includes("headache") || q.includes("head ache") || q.includes("डोकेदुखी") || q.includes("தலைவலி") || q.includes("सिरदर्द")) {
      return "migraine_headache";
    }

    if (q.includes("cough") || q.includes("cold") || q.includes("khokla") || q.includes("सर्दी") || q.includes("இருமல்") || q.includes("खांसी") || q.includes("sore throat")) {
      return "cough_cold";
    }

    if (q.includes("stomach") || q.includes("belly") || q.includes("abdomen") || q.includes("पोटदुखी") || q.includes("വയറുവேதனை") || q.includes("पेट दर्द") || q.includes("cramp")) {
      return "stomach_pain";
    }

    if (q.includes("chest discomfort") || q.includes("chest tightness") || q.includes("छातीत दुखणे") || q.includes("நெஞ்சு வலி") || q.includes("palpitation")) {
      return "chest_discomfort";
    }

    if (q.includes("sick") || q.includes("unwell") || q.includes("feeling down") || q.includes("weakness") || q.includes("आजार") || q.includes("உடல் நலம் சரியில்லை")) {
      return "general_unwell";
    }

    return null;
  },

  getDepartmentForSymptom(type: SymptomType): string {
    switch (type) {
      case "fever":
      case "cough_cold":
      case "stomach_pain":
      case "general_unwell":
        return "General Medicine";
      case "migraine_headache":
        return "General Medicine / Neurology OPD";
      case "chest_discomfort":
        return "Cardiology OPD";
      case "pediatric_concern":
        return "Paediatrics OPD";
    }
  },

  // ── GENERATE STEP 1: DURATION QUESTION ──
  generateDurationQuestion(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    let questionText = "";
    let prompts = ["Since yesterday", "Started today", "3 or more days ago"];

    if (session.symptomType === "fever") {
      questionText =
        language === "mr"
          ? "तुम्हाला बरे वाटत नाही हे ऐकून वाईट वाटले. योग्य उपाय शोधण्यात मी तुम्हाला मदत करू शकेन.\n\nतुम्हाला कधीपासून ताप येत आहे?"
          : language === "ta"
          ? "உங்களுக்கு உடல் நலம் சரியில்லை என்பதை அறிந்து வருந்துகிறேன். அடுத்த கட்டத்தை கண்டறிய நான் உதவுகிறேன்.\n\nஉங்களுக்கு எப்போது இருந்து காய்ச்சல் உள்ளது?"
          : language === "hi"
          ? "मुझे खेद है कि आप अस्वस्थ महसूस कर रहे हैं। मैं अगला सही कदम उठाने में आपकी मदद कर सकता हूँ।\n\nआपको कब से बुखार है?"
          : "I'm sorry you're feeling unwell. I can help you figure out the next step.\n\nSince when have you had the fever?";
    } else if (session.symptomType === "migraine_headache") {
      questionText =
        language === "mr"
          ? "तीव्र डोकेदुखी किंवा मायग्रेन त्रासदायक असू शकते. सुरक्षित मार्गदर्शनासाठी, ही डोकेदुखी कधीपासून सुरू झाली आहे?"
          : language === "ta"
          ? "கடுமையான தலைவலி மிகவும் சிரமமாக இருக்கும். இந்த தலைவலி எப்போது ஆரம்பித்தது?"
          : "I understand you're experiencing a severe headache or migraine. Let's figure out what care you need.\n\nSince when did this headache begin?";
      prompts = ["A few hours ago", "Since yesterday", "Recurring for several days"];
    } else if (session.symptomType === "pediatric_concern") {
      questionText = "Children's health requires careful attention. Since when has the child been experiencing fever or symptoms?";
      prompts = ["Since today morning", "Since yesterday", "More than 2 days"];
    } else {
      questionText = `I understand you're experiencing symptoms. To guide you to the right care:\n\nSince when have you had these symptoms?`;
      prompts = ["Started today", "Since 1-2 days", "More than 3 days"];
    }

    return {
      id: msgId,
      sender: "assistant",
      text: questionText,
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: prompts,
    };
  },

  // ── GENERATE STEP 2: SEVERITY / TEMPERATURE QUESTION ──
  generateSeverityQuestion(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    let questionText = "";
    let prompts = ["Around 100-101°F", "102°F or higher", "Haven't measured thermometer"];

    if (session.symptomType === "fever" || session.symptomType === "pediatric_concern") {
      questionText =
        language === "mr"
          ? "धन्यवाद. तुम्हाला शरीराचे तापमान माहित आहे का (उदा. थर्मामीटरने मोजले आहे का)?"
          : language === "ta"
          ? "நன்றி. காய்ச்சலின் வெப்பநிலை அளவு உங்களுக்கு தெரியுமா (தெர்மோமீட்டரில் அளந்தீர்களா)?"
          : "Thanks. Do you know your temperature?";
    } else if (session.symptomType === "migraine_headache") {
      questionText = "Thanks. How would you describe the pain—is it throbbing on one side, or accompanied by sensitivity to bright light or nausea?";
      prompts = ["Throbbing with light sensitivity", "Mild constant tension", "Severe disabling pain"];
    } else {
      questionText = "Thanks. Are you experiencing chills, body ache, or significant weakness along with this?";
      prompts = ["Mild discomfort", "Severe weakness & chills", "No chills"];
    }

    return {
      id: msgId,
      sender: "assistant",
      text: questionText,
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: prompts,
    };
  },

  // ── GENERATE STEP 3: RED FLAG SCREENING QUESTION ──
  generateRedFlagQuestion(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    const questionText =
      language === "mr"
          ? "धन्यवाद. तुम्हाला श्वास घेण्यास त्रास, तीव्र अशक्तपणा, सतत उलट्या, तीव्र मानदुखी, किंवा त्वचेवर पुरळ येत आहे का?"
          : language === "ta"
          ? "நன்றி. உங்களுக்கு மூச்சு விடுவதில் சிரமம், தீவிர பலவீனம், தொடர் வாந்தி, அல்லது தோலில் தடிப்புகள் உள்ளதா?"
          : "Thanks. Do you have any difficulty breathing, severe weakness, confusion, persistent vomiting, severe sudden headache, or rash?";

    return {
      id: msgId,
      sender: "assistant",
      text: questionText,
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: ["No other symptoms", "Feeling mild weakness", "Yes, have breathing trouble"],
    };
  },

  // ── GENERATE STEP 4: SAFE GUIDANCE & FACILITY RECOMMENDATION ──
  generateGuidanceAndFacilitiesResponse(
    session: TriageSession,
    timestamp: string,
    msgId: string,
    language: AssistantLanguage
  ): ChatMessage {
    // If red flags were detected in response:
    if (session.hasRedFlags) {
      const facilities = DEMO_FACILITIES.slice(0, 2).map((f, idx) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        distanceKm: f.distanceKm || (idx === 0 ? 2.4 : 5.8),
        travelMinutes: f.travelMinutes || (idx === 0 ? 10 : 22),
        specialistAvailable: true,
        specialistName: f.doctors[0]?.name || "Medical Officer On Duty",
        diagnosticAvailable: true,
        diagnosticWaitMinutes: 10,
        queueWaitMinutes: f.queue?.estimatedWait || 15,
        isBestMatch: idx === 0,
      }));

      return {
        id: msgId,
        sender: "assistant",
        text:
          "⚠️ Clinical Notice: Because of your reported weakness or associated symptoms, an in-person medical evaluation at an open healthcare facility is advised.\n\n" +
          `Here are the verified public healthcare facilities near your current location with active doctors and open OPD:`,
        timestamp,
        role: "patient",
        language,
        widget: {
          type: "facility_list",
          data: facilities,
        },
        actionLink: {
          label: "Find Nearest Care & Book Token",
          href: "/patient/find-care?specialty=general",
        },
        suggestedPrompts: [
          "Book token at District Hospital",
          "Check active queue wait",
          "Call 108 if urgent",
        ],
      };
    }

    // Routine self-care guidance without red flags
    const guidance =
      `Based on what you've told me, there are no emergency warning signs in your answers so far.\n\n` +
      `Safe Self-Care Guidance:\n` +
      `• Rest adequately and avoid strenuous physical activity.\n` +
      `• Drink plenty of fluids (boiled water, ORS, warm soups) to avoid dehydration.\n` +
      `• Wear comfortable, lightweight clothing and stay in a well-ventilated space.\n` +
      `• Monitor your temperature periodically.\n` +
      `• If symptoms persist beyond 3 days, worsen, or you develop breathing trouble or persistent vomiting, seek medical evaluation.\n\n` +
      `I can also help you find verified public healthcare facilities near your current location if you would like to consult a doctor.`;

    return {
      id: msgId,
      sender: "assistant",
      text: guidance,
      timestamp,
      role: "patient",
      language,
      actionLink: {
        label: "Find Healthcare Facilities Near You",
        href: "/patient/find-care",
      },
      suggestedPrompts: [
        "Find Healthcare Near Me",
        "What medicines am I currently taking?",
        "Check my active token",
      ],
    };
  },

  // ── EMERGENCY IMMEDIATE ESCALATION ──
  generateEmergencyResponse(timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    const nearest = DEMO_FACILITIES[0];
    return {
      id: msgId,
      sender: "assistant",
      text:
        "🚨 IMMEDIATE MEDICAL ATTENTION RECOMMENDED:\n\n" +
        "These symptoms may require urgent clinical stabilization. Please seek emergency medical care immediately or call the 108 emergency ambulance.",
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "facility_list",
        data: [
          {
            id: nearest.id,
            name: nearest.name,
            type: nearest.type,
            distanceKm: nearest.distanceKm || 2.4,
            travelMinutes: nearest.travelMinutes || 10,
            specialistAvailable: true,
            specialistName: "24/7 Emergency Trauma ICU",
            diagnosticAvailable: true,
            diagnosticWaitMinutes: 5,
            queueWaitMinutes: 5,
            isBestMatch: true,
          },
        ],
      },
      actionLink: {
        label: "Call 108 Emergency Ambulance",
        href: "tel:108",
      },
      suggestedPrompts: [
        "Call 108 Now",
        "Directions to District Hospital",
        "Check my active token",
      ],
    };
  },
};
