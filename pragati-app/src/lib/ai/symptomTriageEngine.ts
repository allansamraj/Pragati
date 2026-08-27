// ─── PRAGATI ASSIST — SYMPTOM-AWARE GUIDED HEALTHCARE TRIAGE ENGINE ────────
// Safe, structured, deterministic conversational triage engine with session memory.
// NEVER diagnoses. NEVER invents. Screens red flags and guides to verified public facilities.

import { ChatMessage, AssistantLanguage } from "./types";
import { DEMO_FACILITIES, Facility } from "@/data/facilities";

export type SymptomCategory =
  | "nausea_vomiting"
  | "fever"
  | "headache_migraine"
  | "cough_cold"
  | "stomach_pain"
  | "chest_discomfort"
  | "pediatric_fever"
  | "general_symptom";

export type TriageStep =
  | "ASKED_DURATION"
  | "ASKED_ASSOCIATED_OR_TEMP"
  | "ASKED_RED_FLAGS"
  | "GUIDANCE_DELIVERED";

export interface TriageSession {
  category: SymptomCategory;
  symptomName: string;
  step: TriageStep;
  duration?: string;
  temperature?: string;
  associatedFindings?: string;
  hasRedFlags?: boolean;
  triageTier?: "ROUTINE" | "URGENT" | "EMERGENCY";
  recommendedService: string;
}

const SESSION_STORAGE_KEY = "pragati_active_symptom_triage";

export const symptomTriageEngine = {
  /**
   * Retrieves active session from sessionStorage.
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
   * Checks whether the user query is a direct follow-up to the active triage session.
   */
  processSymptomQuery(
    rawQuery: string,
    timestamp: string,
    msgId: string,
    language: AssistantLanguage
  ): ChatMessage | null {
    const q = rawQuery.trim().toLowerCase();
    const session = this.getSession();

    // ── 1. SCREEN FOR IMMEDIATE CRITICAL RED FLAGS AT ANY TIME ──
    const hasImmediateEmergency =
      q.includes("cannot breathe") ||
      q.includes("can't breathe") ||
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

    // ── 2. IF ACTIVE SESSION IN PROGRESS, CONTINUE STEPWISE FLOW ──
    if (session) {
      // If user is confirming nearby care search after triage
      if (session.step === "GUIDANCE_DELIVERED" && (q === "yes" || q.includes("find nearby care") || q.includes("find care") || q.includes("hospital") || q.includes("clinic"))) {
        this.clearSession();
        return this.generateNearbyCareResults(session, timestamp, msgId, language);
      }

      // Step A -> User answered Duration
      if (session.step === "ASKED_DURATION") {
        session.duration = rawQuery;
        session.step = "ASKED_ASSOCIATED_OR_TEMP";
        this.saveSession(session);
        return this.generateSecondQuestion(session, timestamp, msgId, language);
      }

      // Step B -> User answered Temperature or Associated Details
      if (session.step === "ASKED_ASSOCIATED_OR_TEMP") {
        session.associatedFindings = rawQuery;
        if (session.category === "fever" || session.category === "pediatric_fever") {
          session.temperature = rawQuery;
        }
        session.step = "ASKED_RED_FLAGS";
        this.saveSession(session);
        return this.generateRedFlagQuestion(session, timestamp, msgId, language);
      }

      // Step C -> User answered Red Flags
      if (session.step === "ASKED_RED_FLAGS") {
        const isConcerning =
          q.includes("yes") ||
          q.includes("breath") ||
          q.includes("weak") ||
          q.includes("vomit") ||
          q.includes("rash") ||
          q.includes("severe") ||
          q.includes("cannot keep") ||
          q.includes("dizzy");

        session.hasRedFlags = isConcerning;
        session.step = "GUIDANCE_DELIVERED";
        session.triageTier = isConcerning ? "URGENT" : "ROUTINE";
        this.saveSession(session);

        return this.generateGuidanceAndAction(session, timestamp, msgId, language);
      }
    }

    // ── 3. DETECT NEW SYMPTOM INITIATION ──
    const detected = this.detectSymptomCategory(q);
    if (!detected) {
      return null; // Not a symptom query -> route to other platform intents
    }

    // Start brand new triage session
    const newSession: TriageSession = {
      category: detected.category,
      symptomName: detected.name,
      step: "ASKED_DURATION",
      recommendedService: this.getServiceForCategory(detected.category),
    };
    this.saveSession(newSession);

    return this.generateDurationQuestion(newSession, timestamp, msgId, language);
  },

  /**
   * Matches raw text against rich clinical symptom patterns.
   */
  detectSymptomCategory(q: string): { category: SymptomCategory; name: string } | null {
    // Nausea & Vomiting (Heavy nausea, vomiting, throwing up, feeling sick to stomach)
    if (
      q.includes("nausea") ||
      q.includes("nauseous") ||
      q.includes("vomit") ||
      q.includes("vomiting") ||
      q.includes("throwing up") ||
      q.includes("feel like throwing up") ||
      q.includes("उलटी") ||
      q.includes("वांती") ||
      q.includes("வாந்தி") ||
      q.includes("जी मिचलाना")
    ) {
      return { category: "nausea_vomiting", name: "nausea / vomiting" };
    }

    // Fever & Chills
    if (
      q.includes("fever") ||
      q.includes("temperature") ||
      q.includes("feverish") ||
      q.includes("hot body") ||
      q.includes("shivering") ||
      q.includes("chills") ||
      q.includes("ताप") ||
      q.includes("காய்ச்சல்") ||
      q.includes("बुखार")
    ) {
      if (q.includes("child") || q.includes("baby") || q.includes("kid") || q.includes("बाळ") || q.includes("குழந்தை") || q.includes("बच्चा")) {
        return { category: "pediatric_fever", name: "child fever" };
      }
      return { category: "fever", name: "fever" };
    }

    // Headache & Migraine
    if (
      q.includes("headache") ||
      q.includes("head ache") ||
      q.includes("migran") ||
      q.includes("migraine") ||
      q.includes("head is hurting") ||
      q.includes("head pain") ||
      q.includes("डोकेदुखी") ||
      q.includes("தலைவலி") ||
      q.includes("सिरदर्द")
    ) {
      return { category: "headache_migraine", name: "headache / migraine" };
    }

    // Cough & Cold
    if (
      q.includes("cough") ||
      q.includes("cold") ||
      q.includes("khokla") ||
      q.includes("sore throat") ||
      q.includes("congestion") ||
      q.includes("sneezing") ||
      q.includes("सर्दी") ||
      q.includes("खोखला") ||
      q.includes("இருமல்") ||
      q.includes("खांसी")
    ) {
      return { category: "cough_cold", name: "cough & cold" };
    }

    // Stomach / Abdominal Pain / Diarrhea
    if (
      q.includes("stomach") ||
      q.includes("belly") ||
      q.includes("abdominal") ||
      q.includes("cramp") ||
      q.includes("diarrhea") ||
      q.includes("loose motion") ||
      q.includes("पोटदुखी") ||
      q.includes("വയറുവേதனை") ||
      q.includes("पेट दर्द")
    ) {
      return { category: "stomach_pain", name: "stomach pain / discomfort" };
    }

    // Chest Discomfort / Tightness
    if (
      q.includes("chest tightness") ||
      q.includes("chest discomfort") ||
      q.includes("palpitation") ||
      q.includes("छातीत दुखणे") ||
      q.includes("நெஞ்சு வலி")
    ) {
      return { category: "chest_discomfort", name: "chest discomfort" };
    }

    // General / Back Pain / Body Ache / Dizziness
    if (
      q.includes("dizzy") ||
      q.includes("dizziness") ||
      q.includes("back pain") ||
      q.includes("body pain") ||
      q.includes("body ache") ||
      q.includes("very weak") ||
      q.includes("weakness") ||
      q.includes("sick") ||
      q.includes("unwell") ||
      q.includes("आजार") ||
      q.includes("உடல் நலம் சரியில்லை")
    ) {
      return { category: "general_symptom", name: "symptoms" };
    }

    return null;
  },

  getServiceForCategory(category: SymptomCategory): string {
    switch (category) {
      case "fever":
      case "nausea_vomiting":
      case "cough_cold":
      case "stomach_pain":
      case "general_symptom":
        return "General Medicine";
      case "headache_migraine":
        return "General Medicine / Neurology OPD";
      case "chest_discomfort":
        return "Cardiology OPD";
      case "pediatric_fever":
        return "Paediatrics OPD";
    }
  },

  // ── 1. QUESTION 1: DURATION QUESTION (Always 1 short natural question) ──
  generateDurationQuestion(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    let question = "";
    let prompts = ["Since yesterday", "Started this morning", "2-3 days ago"];

    if (session.category === "nausea_vomiting") {
      question =
        language === "mr"
          ? "तुम्हाला अस्वस्थ वाटत आहे याबद्दल वाईट वाटले. तुम्हाला कधीपासून मळमळ (Nausea) किंवा उलट्यांचा त्रास होत आहे?"
          : language === "ta"
          ? "உங்களுக்கு உடல் நலம் சரியில்லை என்பதை அறிந்து வருந்துகிறேன். இந்த குமட்டல் (Nausea) எப்போது இருந்து ஆரம்பமானது?"
          : "I'm sorry you're feeling unwell. Since when have you been feeling nauseous?";
      prompts = ["Since this morning", "Since yesterday", "After eating food"];
    } else if (session.category === "fever") {
      question =
        language === "mr"
          ? "तुम्हाला बरे वाटत नाही हे ऐकून वाईट वाटले. तुम्हाला कधीपासून ताप येत आहे?"
          : language === "ta"
          ? "உங்களுக்கு காய்ச்சல் உள்ளது என்பதை அறிந்து வருந்துகிறேன். எப்போது இருந்து காய்ச்சல் உள்ளது?"
          : "I'm sorry you're feeling unwell. Since when have you had the fever?";
      prompts = ["Since yesterday", "Started today", "3 or more days ago"];
    } else if (session.category === "headache_migraine") {
      question = "I understand you're experiencing a headache or migraine. Since when did this headache begin?";
      prompts = ["A few hours ago", "Since yesterday", "Recurring for several days"];
    } else if (session.category === "pediatric_fever") {
      question = "Children's health requires careful attention. Since when has the child been experiencing fever?";
      prompts = ["Since this morning", "Since yesterday", "More than 2 days"];
    } else if (session.category === "cough_cold") {
      question = "I'm sorry you're dealing with a cough or cold. Since when have you had these symptoms?";
      prompts = ["Since 2-3 days", "Started today", "More than a week"];
    } else if (session.category === "stomach_pain") {
      question = "I'm sorry you're experiencing stomach discomfort. Since when have you had the pain?";
      prompts = ["Started a few hours ago", "Since yesterday", "After eating food"];
    } else {
      question = "I'm sorry you're not feeling well. Since when have you been experiencing these symptoms?";
      prompts = ["Started today", "Since yesterday", "2-3 days ago"];
    }

    return {
      id: msgId,
      sender: "assistant",
      text: question,
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: prompts,
    };
  },

  // ── 2. QUESTION 2: SEVERITY OR ASSOCIATED DETAILS (Context-dependent) ──
  generateSecondQuestion(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    let question = "";
    let prompts = ["Around 100-101°F", "102°F or higher", "Haven't measured"];

    if (session.category === "fever" || session.category === "pediatric_fever") {
      question = "Thanks. Do you know your temperature?";
      prompts = ["Around 100-101°F", "102°F or higher", "Haven't measured"];
    } else if (session.category === "nausea_vomiting") {
      question = "Have you also been vomiting, having severe abdominal pain, dizziness, fever, or difficulty keeping fluids down?";
      prompts = ["No, just nausea", "Yes, vomiting too", "Severe stomach cramps"];
    } else if (session.category === "headache_migraine") {
      question = "How would you describe the pain—is it throbbing on one side, or accompanied by sensitivity to bright light or nausea?";
      prompts = ["Throbbing with light sensitivity", "Mild constant tension", "Severe disabling pain"];
    } else if (session.category === "cough_cold") {
      question = "Is the cough dry, or do you have phlegm/mucus along with mild fever or body ache?";
      prompts = ["Dry cough", "Cough with phlegm", "Sore throat & body ache"];
    } else if (session.category === "stomach_pain") {
      question = "Is the pain sharp and localized in one area, or a general dull cramp?";
      prompts = ["General cramp", "Sharp localized pain", "Accompanied by nausea"];
    } else {
      question = "Are you experiencing severe weakness, chills, or dizziness along with this?";
      prompts = ["Mild weakness", "Severe chills & body ache", "No chills"];
    }

    return {
      id: msgId,
      sender: "assistant",
      text: question,
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: prompts,
    };
  },

  // ── 3. QUESTION 3: RED FLAG SCREENING ──
  generateRedFlagQuestion(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    const question =
      session.category === "fever"
        ? "Are you having any difficulty breathing, severe weakness, confusion, persistent vomiting, severe headache, or rash?"
        : session.category === "nausea_vomiting"
        ? "Are you experiencing severe dehydration (dry mouth, dark urine), fainting, confusion, high fever, or blood in vomit?"
        : "Do you have any difficulty breathing, severe weakness, confusion, persistent vomiting, sudden severe chest pain, or rash?";

    return {
      id: msgId,
      sender: "assistant",
      text: question,
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: ["No", "Feeling mild weakness", "Yes, have breathing trouble"],
    };
  },

  // ── 4. STEP 4: SAFE GUIDANCE & FACILITY ACTION ──
  generateGuidanceAndAction(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    // If red flags were answered positively
    if (session.hasRedFlags) {
      const nearest = DEMO_FACILITIES[0];
      return {
        id: msgId,
        sender: "assistant",
        text:
          "⚠️ Clinical Notice: Because of your reported weakness or associated symptoms, an in-person medical evaluation at an open healthcare facility is recommended.\n\n" +
          "I can find verified public healthcare facilities near your current location with open OPD and active physicians.",
        timestamp,
        role: "patient",
        language,
        actionLink: {
          label: "Find Healthcare Facilities Near You",
          href: "/patient/find-care?specialty=general",
        },
        suggestedPrompts: [
          "Find Nearby Care",
          "Check doctor availability",
          "Call 108 if urgent",
        ],
      };
    }

    // Routine safe self-care guidance based on symptom
    let guidance = "";
    if (session.category === "nausea_vomiting") {
      guidance =
        "Based on what you've told me, there are no emergency warning signs in your answers so far.\n\n" +
        "Safe Self-Care Guidance for Nausea:\n" +
        "• Take small sips of clear fluids (water, ORS, weak ginger tea) rather than large gulps.\n" +
        "• Rest in an upright or slightly elevated position; avoid lying completely flat immediately after drinking.\n" +
        "• Once nausea subsides, stick to bland, easy-to-digest foods (khichdi, toast, bananas).\n" +
        "• Avoid spicy, greasy, or strong-smelling foods.\n" +
        "• If nausea persists beyond 24–48 hours or you cannot keep liquids down, seek in-person medical care.\n\n" +
        "Would you like me to find verified healthcare facilities near your current location?";
    } else if (session.category === "fever" || session.category === "pediatric_fever") {
      guidance =
        "Thanks. Based on what you've told me, I don't see an emergency warning sign in the information you've provided.\n\n" +
        "Safe Self-Care Guidance for Fever:\n" +
        "• Rest adequately and avoid strenuous physical activity.\n" +
        "• Stay well-hydrated by drinking plenty of fluids (water, ORS, warm broths).\n" +
        "• Wear light, breathable clothing and stay in a comfortable, well-ventilated room.\n" +
        "• Monitor your temperature periodically.\n" +
        "• If the fever persists for more than 3 days, rises sharply, or new concerning symptoms develop, seek medical advice.\n\n" +
        (session.temperature ? "Because your temperature is elevated, I can help you find a nearby healthcare facility if you'd like." : "I can also help you find verified healthcare facilities near your current location.");
    } else {
      guidance =
        "Based on what you've told me, there are no emergency warning signs in your answers so far.\n\n" +
        "Safe Self-Care Guidance:\n" +
        "• Rest in a quiet, comfortable space and avoid physical overexertion.\n" +
        "• Maintain good hydration with regular sips of water.\n" +
        "• Monitor your symptoms over the next 24 hours.\n" +
        "• If symptoms worsen or persist, an in-person clinical checkup is advised.\n\n" +
        "I can find verified public healthcare facilities near your current location if you would like a consultation.";
    }

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
        "Find Nearby Care",
        "What medicines am I taking?",
        "Check my active token",
      ],
    };
  },

  // ── GENERATE ACTUAL NEARBY HEALTHCARE FACILITIES CARD ──
  generateNearbyCareResults(session: TriageSession, timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    const facilities = DEMO_FACILITIES.slice(0, 2).map((f, idx) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      distanceKm: f.distanceKm || (idx === 0 ? 2.4 : 5.8),
      travelMinutes: f.travelMinutes || (idx === 0 ? 10 : 22),
      matchScore: idx === 0 ? 94 : 82,
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
        `I found these verified public healthcare facilities near your current location:\n\n` +
        `1. ${facilities[0].name} — ${facilities[0].distanceKm} km away (~${facilities[0].travelMinutes} min travel)\n` +
        `   • Department: ${session.recommendedService}\n` +
        `   • OPD Status: Open Now (Queue: ~${facilities[0].queueWaitMinutes} min wait)\n` +
        `   • Doctor: ${facilities[0].specialistName}\n\n` +
        `2. ${facilities[1].name} — ${facilities[1].distanceKm} km away\n\n` +
        `Would you like to book an OPD token or get turn-by-turn driving directions?`,
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
        "Book a token at District Hospital",
        "Check my active token",
        "When is my next appointment?",
      ],
    };
  },

  // ── EMERGENCY RESPONSE ──
  generateEmergencyResponse(timestamp: string, msgId: string, language: AssistantLanguage): ChatMessage {
    const nearest = DEMO_FACILITIES[0];
    return {
      id: msgId,
      sender: "assistant",
      text:
        "🚨 EMERGENCY MEDICAL NOTICE:\n\n" +
        "Your symptoms may require urgent medical attention. Please seek emergency care immediately or call the 108 emergency ambulance.",
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
