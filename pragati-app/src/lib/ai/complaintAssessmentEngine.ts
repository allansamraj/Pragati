// ─── PRAGATI STRUCTURED CONVERSATIONAL HEALTHCARE NAVIGATION ENGINE ─────────
// Dynamic, complaint-aware conversational navigation assistant.
// Implements: Strict Primary Intent Lock, Category-Scoped Question Selection,
// Progressive Questioning, Multi-Entity Extraction, Independent Red-Flag Screening,
// Conversational Session Memory, and Grounded Facility Ranking.
//
// SAFETY PRINCIPLES:
// 1. Triage-support and navigation ONLY. Never claims definitive medical diagnosis.
// 2. Immediate red-flag escalation stops routine questioning instantly.
// 3. Progressive questioning: 2–3 targeted questions max per complaint; skips already answered items.
// 4. Primary Intent Lock: Question selection is strictly scoped to the primary complaint category.
// 5. Shared canonical facility engine with truthful scoring.

import { ChatMessage, AssistantLanguage, FacilityCardItem } from "./types";
import { findRelevantHealthcareFacilities, FacilityWithMeta } from "@/lib/services/facilityService";

export type ComplaintCategory =
  | "VOMITING"
  | "FEVER"
  | "EYE"
  | "CHEST_PAIN"
  | "SKIN"
  | "DENTAL"
  | "EAR"
  | "THROAT_RESPIRATORY"
  | "HEADACHE"
  | "ABDOMINAL_PAIN"
  | "INJURY_TRAUMA"
  | "GENERAL";

export interface QuestionDefinition {
  id: string;
  category: ComplaintCategory;
  priority: number;
  field: string;
  questionText: string;
  chips: string[];
  purpose: "duration" | "severity" | "associated" | "red_flag" | "exposure" | "location";
  isRedFlagCheck?: boolean;
}

export interface NavigationAssessmentSession {
  sessionId: string;
  primaryComplaint: string;
  category: ComplaintCategory;
  mappedSpecialty: string;
  clinicalCategoryLabel: string;
  
  // Extracted clinical entities
  duration?: string;
  temperature?: string;
  frequency?: string;
  hydrationStatus?: string;
  severity?: "MILD" | "MODERATE" | "SEVERE";
  locationDetail?: string;
  associatedSymptoms: string[];
  negatedSymptoms: string[];
  redFlagsDetected: string[];
  answers: Record<string, string>;

  // Flow State
  step: "ASSESSING" | "EMERGENCY_TRIGGERED" | "COMPLETE";
  askedQuestionIds: string[];
  currentQuestionId?: string;
  totalQuestionsTarget: number;
  
  // Facility Search Parameters
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY";
  requiredCareType: string;
  searchQuery: string;

  createdAt: number;
  lastUpdatedAt: number;
}

const SESSION_STORAGE_KEY = "pragati_active_assessment_v3";
const SESSION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// In-memory fallback for SSR and non-browser test scripts
let memorySession: NavigationAssessmentSession | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// 1. STRICT CATEGORY-SPECIFIC QUESTION BANKS WITH PRIORITIES
// ─────────────────────────────────────────────────────────────────────────────

export const COMPLAINT_QUESTION_BANKS: Record<ComplaintCategory, QuestionDefinition[]> = {
  VOMITING: [
    {
      id: "vomit_onset_frequency",
      category: "VOMITING",
      priority: 1,
      field: "duration_frequency",
      purpose: "duration",
      questionText: "When did the vomiting start, and approximately how many times have you vomited?",
      chips: ["Started today (1-2 times)", "Since yesterday (multiple times)", "Continuous / frequent", "Feeling nauseous, haven't thrown up"],
    },
    {
      id: "vomit_fluids_hydration",
      category: "VOMITING",
      priority: 2,
      field: "hydration",
      purpose: "severity",
      questionText: "Are you able to keep water, ORS, or other fluids down without immediately throwing up?",
      chips: ["Able to drink water/fluids", "Cannot keep any water down (Dehydrated)", "Drinking small sips slowly"],
    },
    {
      id: "vomit_associated_red_flags",
      category: "VOMITING",
      priority: 3,
      field: "associated_red_flags",
      purpose: "red_flag",
      questionText: "Do you have severe stomach pain, high fever, blood in the vomit, severe dizziness/fainting, or loose stools?",
      chips: ["Mild nausea / loose stools", "No severe pain or fever", "Severe stomach pain & fever", "Blood in vomit / feeling faint (URGENT)"],
      isRedFlagCheck: true,
    },
  ],

  FEVER: [
    {
      id: "fever_duration",
      category: "FEVER",
      priority: 1,
      field: "duration",
      purpose: "duration",
      questionText: "Since when have you had the fever?",
      chips: ["Since today", "2 days", "3-4 days", "More than a week"],
    },
    {
      id: "fever_temperature",
      category: "FEVER",
      priority: 2,
      field: "temperature",
      purpose: "severity",
      questionText: "Do you know your temperature? If yes, what is it?",
      chips: ["Around 100°F", "101°F - 102°F", "Above 103°F", "Don't know exact temp"],
    },
    {
      id: "fever_associated_red_flags",
      category: "FEVER",
      priority: 3,
      field: "associated_red_flags",
      purpose: "red_flag",
      questionText: "Are you having chills, severe weakness, vomiting, severe headache, body pain, cough, sore throat, or breathing difficulty?",
      chips: ["Body pain & chills", "Mild weakness / headache", "No severe symptoms", "Breathing difficulty / chest pain"],
      isRedFlagCheck: true,
    },
  ],

  EYE: [
    {
      id: "eye_duration",
      category: "EYE",
      priority: 1,
      field: "duration",
      purpose: "duration",
      questionText: "When did the eye redness or discharge start?",
      chips: ["Since yesterday", "2-3 days", "Started today", "Few hours ago"],
    },
    {
      id: "eye_affected",
      category: "EYE",
      priority: 2,
      field: "locationDetail",
      purpose: "location",
      questionText: "Is it affecting one eye or both eyes?",
      chips: ["One eye", "Both eyes", "Started in one, now both"],
    },
    {
      id: "eye_pain_vision",
      category: "EYE",
      priority: 3,
      field: "pain_vision",
      purpose: "red_flag",
      questionText: "Are you having sharp eye pain or blurred / reduced vision?",
      chips: ["No vision changes, mild grittiness", "Yes, blurred vision", "Sharp deep eye pain", "No pain"],
      isRedFlagCheck: true,
    },
    {
      id: "eye_discharge_photophobia",
      category: "EYE",
      priority: 4,
      field: "discharge_photophobia",
      purpose: "associated",
      questionText: "Is there thick sticky discharge, sensitivity to bright light, or mainly watering?",
      chips: ["Sticky yellowish discharge", "Mainly watery / itching", "Sensitivity to bright light", "Crusting in morning"],
    },
  ],

  CHEST_PAIN: [
    {
      id: "chest_onset_radiation",
      category: "CHEST_PAIN",
      priority: 1,
      field: "onset_radiation",
      purpose: "red_flag",
      questionText: "When did the chest pain start, and does it spread to your left arm, shoulder, back, neck, or jaw?",
      chips: ["Started recently, spreads to arm/jaw", "Localized sharp pain", "Tightness for > 15 mins", "Pain with deep breath"],
      isRedFlagCheck: true,
    },
    {
      id: "chest_breathing_emergency",
      category: "CHEST_PAIN",
      priority: 2,
      field: "breathing_emergency",
      purpose: "red_flag",
      questionText: "Are you experiencing shortness of breath, heavy sweating, feeling faint, severe weakness, or nausea?",
      chips: ["Yes, breathing difficulty / sweating", "Feeling dizzy / nauseous", "No breathlessness or sweating"],
      isRedFlagCheck: true,
    },
  ],

  SKIN: [
    {
      id: "skin_duration_location",
      category: "SKIN",
      priority: 1,
      field: "duration_location",
      purpose: "location",
      questionText: "When did the itching start, and where on your body is it happening?",
      chips: ["Since 2-3 days on arms/legs", "Started today all over", "Localized on face/neck", "Since a week"],
    },
    {
      id: "skin_rash_appearance",
      category: "SKIN",
      priority: 2,
      field: "rash_appearance",
      purpose: "associated",
      questionText: "Do you have a visible rash, red bumps/hives, swelling, or blisters?",
      chips: ["Red raised bumps / hives", "Dry itchy redness", "Blisters / peeling", "No rash, just itching"],
    },
    {
      id: "skin_exposure_airway",
      category: "SKIN",
      priority: 3,
      field: "exposure_airway",
      purpose: "red_flag",
      questionText: "Did you recently start using a new medicine, food, soap, or cosmetic? (And are you having any swelling of the lips/face or difficulty breathing?)",
      chips: ["No facial swelling or breathlessness", "Used a new soap / cosmetic", "New food / medicine exposure", "Lips / face are swelling (URGENT)"],
      isRedFlagCheck: true,
    },
  ],

  DENTAL: [
    {
      id: "dental_duration_character",
      category: "DENTAL",
      priority: 1,
      field: "duration_character",
      purpose: "duration",
      questionText: "How long have you had the tooth pain, and is it constant or triggered by eating/drinking hot or cold items?",
      chips: ["Since 2 days, triggered by food", "Continuous throbbing pain", "Started today", "Pain on chewing"],
    },
    {
      id: "dental_swelling_fever",
      category: "DENTAL",
      priority: 2,
      field: "swelling_fever",
      purpose: "red_flag",
      questionText: "Is there visible swelling around your gums or face, fever, pus discharge, or a broken tooth?",
      chips: ["Mild gum swelling", "Visible cavity / broken tooth", "Facial swelling & fever", "No swelling or fever"],
      isRedFlagCheck: true,
    },
  ],

  EAR: [
    {
      id: "ear_duration_side",
      category: "EAR",
      priority: 1,
      field: "duration_side",
      purpose: "duration",
      questionText: "When did the ear pain or blockage start, and is it in one ear or both?",
      chips: ["Left ear since yesterday", "Right ear since 2-3 days", "Both ears blocked", "Started today"],
    },
    {
      id: "ear_discharge_hearing",
      category: "EAR",
      priority: 2,
      field: "discharge_hearing",
      purpose: "associated",
      questionText: "Do you have any fluid discharge from the ear, reduced hearing, fever, or dizziness?",
      chips: ["Fluid / pus discharge", "Reduced hearing / blocked", "Mild pain only, no fever", "Severe dizziness / vertigo"],
      isRedFlagCheck: true,
    },
  ],

  THROAT_RESPIRATORY: [
    {
      id: "throat_duration",
      category: "THROAT_RESPIRATORY",
      priority: 1,
      field: "duration",
      purpose: "duration",
      questionText: "How long have you had the cough, cold, or sore throat?",
      chips: ["2-3 days", "Since yesterday", "More than a week", "2+ weeks"],
    },
    {
      id: "throat_fever_swallowing",
      category: "THROAT_RESPIRATORY",
      priority: 2,
      field: "fever_swallowing",
      purpose: "associated",
      questionText: "Do you have a fever, or severe pain while swallowing food and liquids?",
      chips: ["Mild sore throat, low fever", "Severe pain swallowing", "No fever", "Persistent dry cough"],
    },
    {
      id: "throat_breathing_sputum",
      category: "THROAT_RESPIRATORY",
      priority: 3,
      field: "breathing_sputum",
      purpose: "red_flag",
      questionText: "Are you experiencing difficulty breathing, chest tightness, or coughing up blood?",
      chips: ["No breathing trouble or blood", "Shortness of breath / wheezing", "Yellow/green phlegm", "Blood in cough (URGENT)"],
      isRedFlagCheck: true,
    },
  ],

  HEADACHE: [
    {
      id: "headache_duration_onset",
      category: "HEADACHE",
      priority: 1,
      field: "duration_onset",
      purpose: "duration",
      questionText: "When did the headache start, and did it develop gradually or suddenly like a severe thunderclap?",
      chips: ["Gradual over 1-2 days", "Sudden severe onset", "Worse in morning", "Throbbing on one side"],
      isRedFlagCheck: true,
    },
    {
      id: "headache_severity_associated",
      category: "HEADACHE",
      priority: 2,
      field: "severity_associated",
      purpose: "severity",
      questionText: "How severe is the pain (mild, moderate, or severe), and do you have nausea, light sensitivity, or fever?",
      chips: ["Moderate, sensitivity to light/noise", "Mild tension headache", "Severe with vomiting & fever", "No other symptoms"],
    },
    {
      id: "headache_neurological_red_flags",
      category: "HEADACHE",
      priority: 3,
      field: "neurological_red_flags",
      purpose: "red_flag",
      questionText: "Are you having any vision loss/double vision, weakness in arms/legs, numbness, confusion, or difficulty speaking?",
      chips: ["No neurological symptoms", "Blurry vision / aura", "Weakness / speech difficulty (EMERGENCY)"],
      isRedFlagCheck: true,
    },
  ],

  ABDOMINAL_PAIN: [
    {
      id: "abdo_location_character",
      category: "ABDOMINAL_PAIN",
      priority: 1,
      field: "location_character",
      purpose: "location",
      questionText: "Where exactly is the pain (upper stomach, lower right side, lower abdomen, or all over), and is it constant or cramping?",
      chips: ["Upper stomach (burning/acidic)", "Lower right side (sharp)", "Lower abdomen / cramps", "All over stomach"],
    },
    {
      id: "abdo_duration",
      category: "ABDOMINAL_PAIN",
      priority: 2,
      field: "duration",
      purpose: "duration",
      questionText: "When did the stomach pain start?",
      chips: ["Since today / few hours", "Since yesterday", "2-3 days", "Comes and goes for weeks"],
    },
    {
      id: "abdo_associated_red_flags",
      category: "ABDOMINAL_PAIN",
      priority: 3,
      field: "associated_red_flags",
      purpose: "red_flag",
      questionText: "Are you having severe vomiting, high fever, inability to keep water down, or blood in vomit/stool?",
      chips: ["Mild nausea / cramps", "No vomiting or fever", "Severe vomiting & fever", "Blood in stool / vomit (URGENT)"],
      isRedFlagCheck: true,
    },
  ],

  INJURY_TRAUMA: [
    {
      id: "injury_mechanism_location",
      category: "INJURY_TRAUMA",
      priority: 1,
      field: "mechanism_location",
      purpose: "location",
      questionText: "What happened, and where is the injury located?",
      chips: ["Twisted ankle / knee", "Fell on arm / wrist", "Cut / laceration", "Direct blunt hit"],
    },
    {
      id: "injury_movement_weight",
      category: "INJURY_TRAUMA",
      priority: 2,
      field: "movement_weight",
      purpose: "severity",
      questionText: "Can you move the affected area or bear weight on it, and is there visible swelling or deformity?",
      chips: ["Cannot bear weight / walk", "Mild swelling, can move", "Severe swelling / deformity", "Normal movement"],
      isRedFlagCheck: true,
    },
    {
      id: "injury_bleeding_head_trauma",
      category: "INJURY_TRAUMA",
      priority: 3,
      field: "bleeding_head_trauma",
      purpose: "red_flag",
      questionText: "Is there active bleeding, numbness/tingling, or did you hit your head or lose consciousness?",
      chips: ["No bleeding or head hit", "Active bleeding (needs dressing/stitches)", "Hit head / felt dizzy", "Numbness in fingers/toes"],
      isRedFlagCheck: true,
    },
  ],

  GENERAL: [
    {
      id: "general_duration",
      category: "GENERAL",
      priority: 1,
      field: "duration",
      purpose: "duration",
      questionText: "How long have you been experiencing this symptom?",
      chips: ["Since today", "2-3 days", "About a week", "More than a week"],
    },
    {
      id: "general_severity",
      category: "GENERAL",
      priority: 2,
      field: "severity",
      purpose: "severity",
      questionText: "How severe would you describe your discomfort (mild, moderate, or severe)?",
      chips: ["Mild discomfort", "Moderate pain/discomfort", "Severe discomfort"],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CRITICAL EMERGENCY RED-FLAG DETECTOR (Evaluated on every turn)
// ─────────────────────────────────────────────────────────────────────────────

export function detectCriticalRedFlags(text: string): { hasRedFlag: boolean; redFlags: string[] } {
  const t = text.toLowerCase();
  const flags: string[] = [];

  // Cardiac / Severe respiratory
  if (
    (t.includes("chest") && (t.includes("spread") || t.includes("radiat") || t.includes("left arm") || t.includes("jaw") || t.includes("shoulder") || t.includes("back"))) ||
    (t.includes("chest") && (t.includes("sweat") || t.includes("faint") || t.includes("crushing") || t.includes("pressure"))) ||
    (t.includes("pain") && (t.includes("left arm") || t.includes("jaw")) && (t.includes("sweat") || t.includes("chest"))) ||
    t.includes("heart attack") ||
    t.includes("cannot breathe") ||
    t.includes("can't breathe") ||
    t.includes("severe shortness of breath") ||
    t.includes("struggling to breathe") ||
    t.includes("gasping for air")
  ) {
    flags.push("Potential acute cardiac or severe respiratory emergency");
  }

  // Anaphylaxis / Airway swelling
  if (
    (t.includes("lip") || t.includes("tongue") || t.includes("throat") || t.includes("face")) &&
    (t.includes("swell") || t.includes("swollen") || t.includes("swelling")) &&
    (t.includes("breathe") || t.includes("swallow") || t.includes("chok"))
  ) {
    flags.push("Airway or severe allergic reaction with facial/throat swelling");
  }

  // Gastrointestinal red flags
  if (
    (t.includes("vomit") || t.includes("vomiting") || t.includes("threw up")) &&
    (t.includes("blood") || t.includes("dark coffee") || t.includes("black"))
  ) {
    flags.push("Hematemesis (blood in vomit / gastrointestinal bleeding)");
  }

  if (
    (t.includes("vomit") || t.includes("vomiting")) &&
    (t.includes("cannot keep water") || t.includes("can't drink water") || t.includes("fainted") || t.includes("severe dehydration"))
  ) {
    flags.push("Severe dehydration / inability to retain oral hydration");
  }

  // Neurological / Stroke / Thunderclap
  if (
    t.includes("thunderclap") ||
    t.includes("worst headache of my life") ||
    (t.includes("headache") && (t.includes("stiff neck") || t.includes("confusion") || t.includes("slurred speech"))) ||
    t.includes("sudden weakness on one side") ||
    t.includes("face drooping") ||
    t.includes("cannot speak") ||
    t.includes("seizure") ||
    t.includes("unconscious") ||
    t.includes("fainted") ||
    t.includes("passed out")
  ) {
    flags.push("Acute neurological emergency (suspected stroke / intracranial pathology)");
  }

  // Severe Eye emergencies
  if (
    (t.includes("eye") && (t.includes("chemical") || t.includes("acid") || t.includes("alkali") || t.includes("burn"))) ||
    (t.includes("eye") && (t.includes("penetrat") || t.includes("puncture") || t.includes("stab") || t.includes("glass"))) ||
    (t.includes("sudden") && (t.includes("vision loss") || t.includes("blind") || t.includes("cannot see")))
  ) {
    flags.push("Acute ophthalmic trauma or sudden vision loss");
  }

  // Severe bleeding / trauma
  if (
    t.includes("severe bleeding") ||
    t.includes("heavy bleeding") ||
    t.includes("uncontrolled bleeding") ||
    t.includes("blood spurting") ||
    t.includes("bone sticking out") ||
    t.includes("open fracture") ||
    t.includes("coughing blood") ||
    t.includes("vomiting blood") ||
    t.includes("black stool")
  ) {
    flags.push("Severe hemorrhage or open traumatic deformity");
  }

  return {
    hasRedFlag: flags.length > 0,
    redFlags: flags,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MULTI-ENTITY CONTEXT EXTRACTOR
// ─────────────────────────────────────────────────────────────────────────────

export function extractEntitiesFromText(text: string): {
  duration?: string;
  temperature?: string;
  frequency?: string;
  hydrationStatus?: string;
  severity?: "MILD" | "MODERATE" | "SEVERE";
  locationDetail?: string;
  associatedSymptoms: string[];
  negatedSymptoms: string[];
  redFlags: string[];
} {
  const t = text.toLowerCase();
  let duration: string | undefined = undefined;
  let temperature: string | undefined = undefined;
  let frequency: string | undefined = undefined;
  let hydrationStatus: string | undefined = undefined;
  let severity: "MILD" | "MODERATE" | "SEVERE" | undefined = undefined;
  let locationDetail: string | undefined = undefined;
  const associatedSymptoms: string[] = [];
  const negatedSymptoms: string[] = [];

  // Duration extraction
  const durMatch = t.match(/(\d+)\s*(days?|hours?|weeks?|months?|day|hr|wk)/);
  if (durMatch) {
    duration = `${durMatch[1]} ${durMatch[2]}`;
  } else if (t.includes("since yesterday") || t.includes("from yesterday")) {
    duration = "Since yesterday";
  } else if (t.includes("since today") || t.includes("started today") || t.includes("from morning") || t.includes("since morning") || t.includes("this morning")) {
    duration = "Started today";
  } else if (t.includes("few hours") || t.includes("couple of hours")) {
    duration = "Few hours";
  } else if (t.includes("a week") || t.includes("one week")) {
    duration = "1 week";
  }

  // Frequency / Vomiting count
  const freqMatch = t.match(/(\d+)\s*(?:times|episodes|x)/);
  if (freqMatch) {
    frequency = `${freqMatch[1]} times`;
  } else if (t.includes("once") || t.includes("one time")) {
    frequency = "1 time";
  } else if (t.includes("twice") || t.includes("two times") || t.includes("2 times")) {
    frequency = "2 times";
  } else if (t.includes("multiple times") || t.includes("many times") || t.includes("frequently") || t.includes("continuous")) {
    frequency = "Multiple times";
  }

  // Hydration status
  if (t.includes("cannot drink") || t.includes("can't drink") || t.includes("cannot keep water") || t.includes("can't keep water down") || t.includes("throwing up water")) {
    hydrationStatus = "Unable to retain fluids (Dehydration risk)";
  } else if (t.includes("able to drink") || t.includes("can drink water") || t.includes("drinking water") || t.includes("sipping water") || t.includes("taking ors")) {
    hydrationStatus = "Able to retain oral fluids";
  }

  // Temperature extraction
  const tempMatch = t.match(/(\d{2,3}(?:\.\d)?)\s*(?:°?f|deg|degrees|f\b)/);
  if (tempMatch) {
    temperature = `${tempMatch[1]}°F`;
  } else if (t.includes("101") || t.includes("102") || t.includes("103") || t.includes("104") || t.includes("100") || t.includes("99")) {
    const rawMatch = t.match(/\b(99|100|101|102|103|104)(?:\.\d)?\b/);
    if (rawMatch) temperature = `${rawMatch[0]}°F`;
  } else if (t.includes("high fever") || t.includes("very high")) {
    temperature = "High fever (> 102°F)";
  } else if (t.includes("mild fever") || t.includes("low fever")) {
    temperature = "Mild fever (< 100°F)";
  }

  // Severity extraction
  if (t.includes("severe") || t.includes("unbearable") || t.includes("extremely") || t.includes("killing me") || t.includes("intense")) {
    severity = "SEVERE";
  } else if (t.includes("moderate") || t.includes("medium")) {
    severity = "MODERATE";
  } else if (t.includes("mild") || t.includes("slight") || t.includes("little bit")) {
    severity = "MILD";
  }

  // Location details
  if (t.includes("both eyes") || t.includes("in both eyes")) {
    locationDetail = "Both eyes";
  } else if (t.includes("left eye") || t.includes("in left eye") || t.includes("one eye") || t.includes("right eye")) {
    locationDetail = "One eye";
  } else if (t.includes("arms") || t.includes("legs") || t.includes("hands") || t.includes("face") || t.includes("all over")) {
    if (t.includes("all over")) locationDetail = "All over body";
    else if (t.includes("arms")) locationDetail = "Arms";
    else if (t.includes("legs")) locationDetail = "Legs";
    else if (t.includes("face")) locationDetail = "Face / neck";
  }

  // Symptoms & Negations
  const candidateSymptoms = [
    { key: "breathing difficulty", patterns: ["breathing difficulty", "breathless", "shortness of breath", "trouble breathing", "can't breathe"] },
    { key: "chest pain", patterns: ["chest pain", "chest tightness", "chest pressure"] },
    { key: "headache", patterns: ["headache", "head pain", "head hurts"] },
    { key: "chills", patterns: ["chills", "shivering", "feeling cold"] },
    { key: "body pain", patterns: ["body pain", "body ache", "muscle ache", "body pain and chills"] },
    { key: "vomiting", patterns: ["vomiting", "throwing up", "vomit", "threw up"] },
    { key: "nausea", patterns: ["nausea", "nauseous", "feeling sick"] },
    { key: "stomach pain", patterns: ["stomach pain", "abdominal pain", "cramps", "belly pain"] },
    { key: "diarrhea", patterns: ["diarrhea", "loose motion", "loose stools"] },
    { key: "fever", patterns: ["fever", "temperature", "high temp", "feverish"] },
    { key: "cough", patterns: ["cough", "coughing"] },
    { key: "sore throat", patterns: ["sore throat", "throat pain", "pain swallowing"] },
    { key: "rash", patterns: ["rash", "red spots", "hives", "bumps", "blisters"] },
    { key: "itching", patterns: ["itching", "itchy", "scratching"] },
    { key: "eye discharge", patterns: ["discharge", "sticky discharge", "yellow discharge", "crust"] },
    { key: "eye redness", patterns: ["red eye", "redness in eye", "bloodshot", "pink eye"] },
    { key: "photophobia", patterns: ["light sensitivity", "sensitive to light", "photophobia"] },
    { key: "vision loss", patterns: ["blurred vision", "blurry vision", "vision loss", "reduced vision"] },
    { key: "tooth pain", patterns: ["tooth pain", "toothache", "teeth pain"] },
    { key: "gum swelling", patterns: ["gum swelling", "swollen gums", "facial swelling"] },
    { key: "ear pain", patterns: ["ear pain", "earache", "ear hurts"] },
    { key: "ear discharge", patterns: ["ear discharge", "fluid from ear", "pus in ear"] },
    { key: "dizziness", patterns: ["dizzy", "dizziness", "vertigo", "giddy"] },
    { key: "bleeding", patterns: ["bleeding", "blood"] },
  ];

  for (const item of candidateSymptoms) {
    for (const p of item.patterns) {
      if (t.includes(p)) {
        // Check for negation (e.g. "no breathing difficulty", "not having fever", "without chest pain", "no fever")
        const negPrefixes = [`no ${p}`, `not ${p}`, `no ${item.key}`, `without ${p}`, `without ${item.key}`, `nil ${p}`, `no severe ${p}`, `no mild ${p}`, `neither ${p}`];
        const isNegated = negPrefixes.some((np) => t.includes(np)) || t.includes(`no ${p.split(" ")[0]}`) || t.includes(`not having ${p}`);

        if (isNegated) {
          if (!negatedSymptoms.includes(item.key)) negatedSymptoms.push(item.key);
        } else {
          if (!associatedSymptoms.includes(item.key)) associatedSymptoms.push(item.key);
        }
        break;
      }
    }
  }

  const redFlagRes = detectCriticalRedFlags(text);

  return {
    duration,
    temperature,
    frequency,
    hydrationStatus,
    severity,
    locationDetail,
    associatedSymptoms,
    negatedSymptoms,
    redFlags: redFlagRes.redFlags,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CLASSIFY PRIMARY COMPLAINT INTENT (Guards against negated symptoms)
// ─────────────────────────────────────────────────────────────────────────────

function hasPositiveSymptom(text: string, keywords: string[]): boolean {
  const t = text.toLowerCase();
  for (const kw of keywords) {
    if (t.includes(kw)) {
      const negatedPrefixes = [
        `no ${kw}`,
        `not ${kw}`,
        `without ${kw}`,
        `nil ${kw}`,
        `never ${kw}`,
        `no high ${kw}`,
        `no severe ${kw}`,
        `no mild ${kw}`,
        `not having ${kw}`,
        `neither ${kw}`,
      ];
      const isNegated = negatedPrefixes.some((p) => t.includes(p)) || t.includes(`no ${kw.split(" ")[0]}`);
      if (!isNegated) {
        return true;
      }
    }
  }
  return false;
}

export function classifyComplaintCategory(rawQuery: string): {
  category: ComplaintCategory;
  complaintName: string;
  mappedSpecialty: string;
  clinicalCategoryLabel: string;
  isExplicitSpecialtyOrFacility: boolean;
  isDistinctSymptomDeclaration: boolean;
} {
  const q = rawQuery.toLowerCase();

  // 1. Explicit Service / Doctor requests (NO question flow needed)
  if (
    q.includes("optometrist") ||
    q.includes("spectacle") ||
    q.includes("eye power") ||
    q.includes("vision test") ||
    q.includes("glasses")
  ) {
    return {
      category: "EYE",
      complaintName: "Optometry & Vision Care",
      mappedSpecialty: "Optometry",
      clinicalCategoryLabel: "Optometry & Optical Care",
      isExplicitSpecialtyOrFacility: true,
      isDistinctSymptomDeclaration: true,
    };
  }

  if (
    q.includes("pharmacy") ||
    q.includes("chemist") ||
    q.includes("medical shop") ||
    q.includes("buy medicine") ||
    q.includes("ecg") ||
    q.includes("blood test") ||
    q.includes("x-ray") ||
    q.includes("scan centre") ||
    q === "hospital near me" ||
    q === "nearest hospital" ||
    q === "clinics near me" ||
    q === "find care near me" ||
    q === "find doctor"
  ) {
    return {
      category: "GENERAL",
      complaintName: "Healthcare Diagnostic / Facility Search",
      mappedSpecialty: q.includes("pharmacy") ? "Pharmacy" : "General Medicine",
      clinicalCategoryLabel: "Healthcare Services",
      isExplicitSpecialtyOrFacility: true,
      isDistinctSymptomDeclaration: true,
    };
  }

  // 2. Primary Symptom Declarations (Guards against negations)

  // VOMITING / NAUSEA / GASTROINTESTINAL
  if (hasPositiveSymptom(q, ["vomit", "vomiting", "threw up", "throw up", "nausea", "nauseous", "feeling like vomiting", "puke"])) {
    return {
      category: "VOMITING",
      complaintName: "Vomiting / Nausea",
      mappedSpecialty: "General Medicine",
      clinicalCategoryLabel: "General Medicine / Gastroenterology",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // FEVER / TEMPERATURE
  if (hasPositiveSymptom(q, ["fever", "temperature", "high temp", "running a temperature", "feel feverish", "feverish", "pyrexia", "body is hot"])) {
    return {
      category: "FEVER",
      complaintName: "Fever / General malaise",
      mappedSpecialty: "General Medicine",
      clinicalCategoryLabel: "General Medicine",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // EYE
  if (hasPositiveSymptom(q, ["madras eye", "conjunctivitis", "pink eye", "eye is red", "red eye", "eye redness", "eye infection", "watery eye", "eyes are watering", "eye watering", "eye discharge", "eye pain", "stye", "eye irritation", "itchy eye"])) {
    return {
      category: "EYE",
      complaintName: q.includes("madras eye") ? "Madras eye / Conjunctivitis" : "Eye discomfort / infection",
      mappedSpecialty: "Ophthalmology",
      clinicalCategoryLabel: "Ophthalmology / Eye Care",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // CHEST PAIN
  if (hasPositiveSymptom(q, ["chest pain", "chest tightness", "chest pressure", "pain in chest", "heart pain", "heart palpitation"])) {
    return {
      category: "CHEST_PAIN",
      complaintName: "Chest discomfort / pain",
      mappedSpecialty: "Cardiology",
      clinicalCategoryLabel: "Cardiology / Emergency Care",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // SKIN
  if (hasPositiveSymptom(q, ["skin", "itching", "itchy", "rash", "allergy", "hives", "pimples", "acne", "eczema", "scratching", "red spots"])) {
    return {
      category: "SKIN",
      complaintName: "Skin itching / allergy / rash",
      mappedSpecialty: "Dermatology",
      clinicalCategoryLabel: "Dermatology / Skin Care",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // DENTAL
  if (hasPositiveSymptom(q, ["tooth", "teeth", "dental", "dentist", "gum", "wisdom tooth", "cavity"])) {
    return {
      category: "DENTAL",
      complaintName: "Tooth / Dental complaint",
      mappedSpecialty: "Dentistry",
      clinicalCategoryLabel: "Dentistry / Dental Care",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // EAR
  if (hasPositiveSymptom(q, ["ear", "earache", "ear pain", "ear hurts", "ear blocked", "hearing"])) {
    return {
      category: "EAR",
      complaintName: "Ear pain / infection / blockage",
      mappedSpecialty: "ENT (Otolaryngology)",
      clinicalCategoryLabel: "ENT (Otolaryngology)",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // THROAT / RESPIRATORY
  if (hasPositiveSymptom(q, ["sore throat", "cough", "cold", "throat", "phlegm", "tonsil"])) {
    return {
      category: "THROAT_RESPIRATORY",
      complaintName: "Cough / cold / sore throat",
      mappedSpecialty: "General Medicine",
      clinicalCategoryLabel: "General Medicine / ENT",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // HEADACHE
  if (hasPositiveSymptom(q, ["headache", "head pain", "head hurts", "migraine"])) {
    return {
      category: "HEADACHE",
      complaintName: "Headache / Head pain",
      mappedSpecialty: "General Medicine",
      clinicalCategoryLabel: "General Medicine",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // ABDOMINAL
  if (hasPositiveSymptom(q, ["stomach", "abdominal", "belly", "tummy", "gastric", "diarrhea", "loose motion"])) {
    return {
      category: "ABDOMINAL_PAIN",
      complaintName: "Stomach / Abdominal discomfort",
      mappedSpecialty: "General Medicine",
      clinicalCategoryLabel: "General Medicine / Gastroenterology",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // INJURY / TRAUMA
  if (hasPositiveSymptom(q, ["injury", "hurt my", "fell", "sprain", "fracture", "cut", "bleeding", "accident", "twisted"])) {
    return {
      category: "INJURY_TRAUMA",
      complaintName: "Physical Injury / Sprain / Trauma",
      mappedSpecialty: "Orthopaedics",
      clinicalCategoryLabel: "Orthopaedics / Urgent Care",
      isExplicitSpecialtyOrFacility: false,
      isDistinctSymptomDeclaration: true,
    };
  }

  // Default GENERAL
  return {
    category: "GENERAL",
    complaintName: "General health concern",
    mappedSpecialty: "General Medicine",
    clinicalCategoryLabel: "General Medicine",
    isExplicitSpecialtyOrFacility: false,
    isDistinctSymptomDeclaration: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SESSION MANAGEMENT & STRICT CATEGORY-LOCKED QUESTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export const complaintAssessmentEngine = {
  getSession(): NavigationAssessmentSession | null {
    if (typeof window !== "undefined") {
      try {
        const d = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (d) {
          const parsed: NavigationAssessmentSession = JSON.parse(d);
          if (Date.now() - parsed.lastUpdatedAt < SESSION_EXPIRY_MS) {
            return parsed;
          }
          this.clearSession();
        }
      } catch {}
    }
    if (memorySession && Date.now() - memorySession.lastUpdatedAt < SESSION_EXPIRY_MS) {
      return memorySession;
    }
    return null;
  },

  saveSession(session: NavigationAssessmentSession): void {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {}
    }
    memorySession = session;
  },

  clearSession(): void {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
    }
    memorySession = null;
  },

  /**
   * Initializes a new session locked to a primary complaint category.
   */
  startNewSession(
    category: ComplaintCategory,
    complaintName: string,
    mappedSpecialty: string,
    clinicalCategoryLabel: string,
    initialText: string
  ): NavigationAssessmentSession {
    const extracted = extractEntitiesFromText(initialText);
    const questions = COMPLAINT_QUESTION_BANKS[category] || COMPLAINT_QUESTION_BANKS.GENERAL;

    const session: NavigationAssessmentSession = {
      sessionId: `sess-${Date.now()}`,
      primaryComplaint: complaintName,
      category,
      mappedSpecialty,
      clinicalCategoryLabel,
      duration: extracted.duration,
      temperature: extracted.temperature,
      frequency: extracted.frequency,
      hydrationStatus: extracted.hydrationStatus,
      severity: extracted.severity,
      locationDetail: extracted.locationDetail,
      associatedSymptoms: extracted.associatedSymptoms,
      negatedSymptoms: extracted.negatedSymptoms,
      redFlagsDetected: extracted.redFlags,
      answers: {},
      step: extracted.redFlags.length > 0 ? "EMERGENCY_TRIGGERED" : "ASSESSING",
      askedQuestionIds: [],
      totalQuestionsTarget: Math.min(questions.length, 3),
      urgency: extracted.redFlags.length > 0 ? "EMERGENCY" : "ROUTINE",
      requiredCareType: mappedSpecialty,
      searchQuery: `${mappedSpecialty} clinic hospital`,
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
    };

    if (process.env.NODE_ENV !== "production") {
      console.log(`[PRAGATI ASSESSMENT ENGINE] PRIMARY INTENT LOCK: [${category}] - ${complaintName}`);
    }

    return session;
  },

  /**
   * Evaluates if enough information has been collected to conclude the assessment.
   */
  isAssessmentSufficient(session: NavigationAssessmentSession): boolean {
    if (session.step === "EMERGENCY_TRIGGERED" || session.step === "COMPLETE") return true;

    // Check by category what key entities are required
    switch (session.category) {
      case "VOMITING":
        return !!(
          ((session.duration || session.frequency) && session.hydrationStatus && (session.askedQuestionIds.includes("vomit_associated_red_flags") || session.associatedSymptoms.length > 0 || session.negatedSymptoms.length > 0)) ||
          session.askedQuestionIds.length >= 3 ||
          Object.keys(session.answers).length >= 2
        );

      case "FEVER":
        return !!(
          (session.duration && session.temperature && (session.associatedSymptoms.length > 0 || session.negatedSymptoms.length > 0 || session.askedQuestionIds.includes("fever_associated_red_flags"))) ||
          session.askedQuestionIds.length >= 3 ||
          Object.keys(session.answers).length >= 3
        );

      case "EYE":
        return !!(
          (session.duration && session.locationDetail && (session.askedQuestionIds.includes("eye_pain_vision") || session.askedQuestionIds.includes("eye_discharge_photophobia") || session.negatedSymptoms.includes("vision loss") || session.associatedSymptoms.includes("eye discharge"))) ||
          session.askedQuestionIds.length >= 3 ||
          Object.keys(session.answers).length >= 3
        );

      case "CHEST_PAIN":
        return session.askedQuestionIds.length >= 1 || session.redFlagsDetected.length > 0;

      case "SKIN":
        return !!(
          (session.duration && session.locationDetail && (session.askedQuestionIds.includes("skin_exposure_airway") || session.negatedSymptoms.includes("breathing difficulty") || session.answers["skin_exposure_airway"])) ||
          session.askedQuestionIds.length >= 3 ||
          Object.keys(session.answers).length >= 3
        );

      case "DENTAL":
        return !!(
          (session.duration && (session.askedQuestionIds.includes("dental_swelling_fever") || session.answers["dental_swelling_fever"] || session.associatedSymptoms.includes("gum swelling") || session.negatedSymptoms.length > 0)) ||
          session.askedQuestionIds.length >= 2 ||
          Object.keys(session.answers).length >= 2
        );

      case "EAR":
      case "THROAT_RESPIRATORY":
      case "HEADACHE":
      case "ABDOMINAL_PAIN":
      case "INJURY_TRAUMA":
      case "GENERAL":
      default:
        return session.askedQuestionIds.length >= session.totalQuestionsTarget || Object.keys(session.answers).length >= 2;
    }
  },

  /**
   * STRICT CATEGORY QUESTION SELECTION:
   * Selects the next highest-priority question ONLY from the locked category question bank.
   */
  selectNextQuestion(session: NavigationAssessmentSession): QuestionDefinition | null {
    const bank = COMPLAINT_QUESTION_BANKS[session.category] || COMPLAINT_QUESTION_BANKS.GENERAL;
    const sortedBank = [...bank].sort((a, b) => a.priority - b.priority);

    const candidates = sortedBank.filter((q) => !session.askedQuestionIds.includes(q.id));

    if (process.env.NODE_ENV !== "production") {
      console.log(`[PRAGATI ASSESSMENT ENGINE] PRIMARY INTENT: ${session.category}`);
      console.log(`[PRAGATI ASSESSMENT ENGINE] CURRENT STATE: duration=${session.duration || "missing"}, freq=${session.frequency || "missing"}, hydration=${session.hydrationStatus || "missing"}`);
      console.log(`[PRAGATI ASSESSMENT ENGINE] QUESTION CANDIDATES: ${candidates.map((c) => `${c.id} (p:${c.priority})`).join(", ")}`);
    }

    for (const q of sortedBank) {
      if (session.askedQuestionIds.includes(q.id)) continue;

      // Skip if entity was already extracted in user message
      if (q.field === "duration" && session.duration) continue;
      if (q.field === "temperature" && session.temperature) continue;
      if (q.field === "locationDetail" && session.locationDetail) continue;
      if (q.field === "duration_location" && (session.duration || session.locationDetail)) continue;
      if (q.field === "duration_frequency" && (session.duration || session.frequency)) continue;
      if (q.field === "duration_onset" && session.duration) continue;
      if (q.field === "duration_character" && session.duration) continue;
      if (q.field === "duration_side" && (session.duration || session.locationDetail)) continue;
      if (q.field === "hydration" && session.hydrationStatus) continue;

      if (process.env.NODE_ENV !== "production") {
        console.log(`[PRAGATI ASSESSMENT ENGINE] SELECTED QUESTION: ${q.id}`);
      }
      return q;
    }

    return null;
  },

  /**
   * Incorporates an incoming user answer into the active session.
   * NOTE: The assistant's question NEVER alters the user's primary category.
   */
  updateSessionWithAnswer(session: NavigationAssessmentSession, answerText: string): NavigationAssessmentSession {
    const extracted = extractEntitiesFromText(answerText);
    const updated = { ...session };

    if (extracted.duration && !updated.duration) updated.duration = extracted.duration;
    if (extracted.temperature && !updated.temperature) updated.temperature = extracted.temperature;
    if (extracted.frequency && !updated.frequency) updated.frequency = extracted.frequency;
    if (extracted.hydrationStatus && !updated.hydrationStatus) updated.hydrationStatus = extracted.hydrationStatus;
    if (extracted.severity && !updated.severity) updated.severity = extracted.severity;
    if (extracted.locationDetail && !updated.locationDetail) updated.locationDetail = extracted.locationDetail;

    for (const s of extracted.associatedSymptoms) {
      if (!updated.associatedSymptoms.includes(s)) updated.associatedSymptoms.push(s);
    }
    for (const n of extracted.negatedSymptoms) {
      if (!updated.negatedSymptoms.includes(n)) updated.negatedSymptoms.push(n);
    }
    for (const r of extracted.redFlags) {
      if (!updated.redFlagsDetected.includes(r)) updated.redFlagsDetected.push(r);
    }

    if (updated.currentQuestionId) {
      updated.answers[updated.currentQuestionId] = answerText.trim();
    }

    if (updated.redFlagsDetected.length > 0) {
      updated.step = "EMERGENCY_TRIGGERED";
      updated.urgency = "EMERGENCY";
    }

    updated.lastUpdatedAt = Date.now();
    return updated;
  },

  /**
   * Generates empathetic clinical summary text upon completing the assessment.
   */
  generateAssessmentSummary(session: NavigationAssessmentSession): string {
    const spec = session.mappedSpecialty;

    let text = `Got you 👍 Based on what you've shared:\n\n`;

    if (session.duration) text += `• **Duration:** ${session.duration}\n`;
    if (session.frequency) text += `• **Frequency:** ${session.frequency}\n`;
    if (session.hydrationStatus) text += `• **Hydration Status:** ${session.hydrationStatus}\n`;
    if (session.temperature) text += `• **Temperature:** ${session.temperature}\n`;
    if (session.locationDetail) text += `• **Location:** ${session.locationDetail}\n`;
    if (session.associatedSymptoms.length > 0) {
      text += `• **Associated:** ${session.associatedSymptoms.join(", ")}\n`;
    }
    if (session.negatedSymptoms.length > 0) {
      text += `• **No immediate red flags:** ${session.negatedSymptoms.join(", ")}\n`;
    }

    text += `\nThis symptom profile is appropriate for evaluation by **${spec}**.\n\n`;
    text += `Here are verified **${spec}** healthcare facilities near your location:`;

    return text;
  },

  /**
   * Main conversational router handling each turn.
   */
  async processUserMessage(
    rawQuery: string,
    timestamp: string,
    msgId: string,
    language: AssistantLanguage = "en",
    userLat?: number,
    userLng?: number
  ): Promise<ChatMessage> {
    const queryTrimmed = rawQuery.trim();
    const activeSession = this.getSession();

    // Default coordinates (Zone 15 Sholinganallur, Chennai)
    let lat = userLat;
    let lng = userLng;
    if (lat === undefined || lng === undefined) {
      if (typeof window !== "undefined") {
        try {
          const cached = sessionStorage.getItem("pragati_last_user_location");
          if (cached) {
            const p = JSON.parse(cached);
            lat = p.lat;
            lng = p.lng;
          }
        } catch {}
      }
      if (lat === undefined || lng === undefined) {
        lat = 12.8696;
        lng = 80.2200;
      }
    }

    // ── STEP 1: SCREEN FOR IMMEDIATE CRITICAL RED FLAGS AT ANY TIME ──
    const immediateRedFlags = detectCriticalRedFlags(queryTrimmed);
    if (immediateRedFlags.hasRedFlag) {
      this.clearSession();
      return this.renderEmergencyAlertMessage(msgId, timestamp, language, immediateRedFlags.redFlags, lat, lng);
    }

    // ── STEP 2: PRIMARY INTENT CLASSIFICATION & LOCK ──
    const classification = classifyComplaintCategory(queryTrimmed);

    const isCategoryChange = activeSession && activeSession.step !== "ASSESSING" && classification.category !== "GENERAL" && classification.category !== activeSession.category;
    const shouldStartNewSession = !activeSession || activeSession.step === "COMPLETE" || isCategoryChange;

    let session: NavigationAssessmentSession;

    if (shouldStartNewSession || classification.isExplicitSpecialtyOrFacility) {
      // If explicit intent (e.g. "I need an optometrist", "find pharmacy", "hospital near me"), skip questioning
      if (classification.isExplicitSpecialtyOrFacility) {
        this.clearSession();
        return await this.renderFacilityResultsDirectly(
          msgId,
          timestamp,
          language,
          classification.mappedSpecialty,
          classification.complaintName,
          queryTrimmed,
          lat,
          lng
        );
      }

      // Start fresh session locked to this primary complaint
      session = this.startNewSession(
        classification.category,
        classification.complaintName,
        classification.mappedSpecialty,
        classification.clinicalCategoryLabel,
        queryTrimmed
      );
    } else {
      // Continue existing active session locked to session.category
      session = this.updateSessionWithAnswer(activeSession, queryTrimmed);
    }

    // If red flag triggered during update
    if (session.step === "EMERGENCY_TRIGGERED") {
      this.clearSession();
      return this.renderEmergencyAlertMessage(msgId, timestamp, language, session.redFlagsDetected, lat, lng);
    }

    // ── STEP 3: CHECK IF ASSESSMENT IS COMPLETE ──
    if (this.isAssessmentSufficient(session)) {
      session.step = "COMPLETE";
      this.saveSession(session);

      return await this.renderAssessmentCompleteWithFacilities(
        msgId,
        timestamp,
        language,
        session,
        lat,
        lng
      );
    }

    // ── STEP 4: ASK NEXT CATEGORY-LOCKED HIGH-VALUE QUESTION ──
    const nextQ = this.selectNextQuestion(session);
    if (!nextQ) {
      // No further questions in category bank -> complete assessment
      session.step = "COMPLETE";
      this.saveSession(session);

      return await this.renderAssessmentCompleteWithFacilities(
        msgId,
        timestamp,
        language,
        session,
        lat,
        lng
      );
    }

    // Record question in session state
    session.askedQuestionIds.push(nextQ.id);
    session.currentQuestionId = nextQ.id;
    this.saveSession(session);

    // Build conversational response
    const introPrefix =
      session.askedQuestionIds.length === 1
        ? `Got you. `
        : session.duration || session.temperature || session.frequency
        ? `Thanks. `
        : `Okay. `;

    const responseText = `${introPrefix}${nextQ.questionText}`;

    return {
      id: msgId,
      sender: "assistant",
      text: responseText,
      timestamp,
      role: "patient",
      language,
      suggestedPrompts: nextQ.chips,
    };
  },

  /**
   * Helper: Renders the Emergency Alert Card and 24/7 hospital routing.
   */
  async renderEmergencyAlertMessage(
    msgId: string,
    timestamp: string,
    language: AssistantLanguage,
    redFlags: string[],
    lat: number,
    lng: number
  ): Promise<ChatMessage> {
    const facilitiesRes = await findRelevantHealthcareFacilities({
      query: "emergency hospital trauma",
      latitude: lat,
      longitude: lng,
      facilityType: "ALL",
      sortBy: "nearest",
    });

    const topFac = facilitiesRes.facilities[0] || {
      name: "Government Multi Super Speciality Hospital / 24/7 Trauma Care",
      distanceKm: 0.9,
    };

    return {
      id: msgId,
      sender: "assistant",
      text:
        `🚨 **CRITICAL MEDICAL ALERT**\n\n` +
        `Your symptoms may require urgent medical evaluation:\n` +
        `• ${redFlags.join("\n• ")}\n\n` +
        `Please seek emergency care immediately or call local emergency medical services (**108**).`,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "emergency",
        data: {
          alertTitle: "24/7 Emergency & Trauma Dispatch",
          alertSubtitle: "Immediate ambulance & critical hospital routing",
          recommendedFacility: topFac.name,
          distance: `${topFac.distanceKm || 0.9} km away`,
          emergencyNumber: "108",
        },
      },
      actionLink: {
        label: "🚨 Find 24/7 Emergency Trauma Hospital",
        href: "/patient/emergency",
      },
      suggestedPrompts: ["Call 108 Ambulance", "Emergency Directions", "Check Cardiac Bed Availability"],
    };
  },

  /**
   * Helper: Renders completed assessment summary + ranked facility cards.
   */
  async renderAssessmentCompleteWithFacilities(
    msgId: string,
    timestamp: string,
    language: AssistantLanguage,
    session: NavigationAssessmentSession,
    lat: number,
    lng: number
  ): Promise<ChatMessage> {
    const searchRes = await findRelevantHealthcareFacilities({
      query: session.mappedSpecialty,
      latitude: lat,
      longitude: lng,
      facilityType: "ALL",
      customRadiusKm: 5,
      sortBy: "best_match",
    });

    const facilityItems: FacilityCardItem[] = (searchRes.facilities || []).slice(0, 3).map((f) => {
      const isDirectMatch = !!f.isDirectSpecialtyMatch;
      const hasSpec = isDirectMatch || (f.specialties || []).some((s) =>
        s.toLowerCase().includes(session.mappedSpecialty.toLowerCase().split(" ")[0])
      );

      return {
        id: f.id,
        name: f.name,
        type: f.type,
        distanceKm: f.distanceKm || 1.2,
        travelMinutes: f.travelMinutes || 8,
        matchScore: f.matchScore ?? 75,
        specialistAvailable: hasSpec,
        specialistName: hasSpec && f.doctors && f.doctors.length > 0 ? f.doctors[0].name.split(",")[0] : hasSpec ? `${session.mappedSpecialty} Care Available` : undefined,
        diagnosticAvailable: (f.services || []).some((s) =>
          s.toLowerCase().includes("diagnostic") || s.toLowerCase().includes("ecg") || s.toLowerCase().includes("lab")
        ),
        queueWaitMinutes: f.queue?.estimatedWait,
        isBestMatch: isDirectMatch && (f.matchScore ?? 0) >= 80,
        recommendationLabel: f.recommendationLabel,
        matchTier: f.matchTier,
      };
    });

    const summaryText = this.generateAssessmentSummary(session);

    return {
      id: msgId,
      sender: "assistant",
      text: summaryText,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "facility_list",
        data: facilityItems,
      },
      actionLink: {
        label: `📍 View All ${session.mappedSpecialty} Facilities on Map`,
        href: `/patient/find-care?query=${encodeURIComponent(session.mappedSpecialty)}`,
      },
      suggestedPrompts: [
        "How do I reach the nearest hospital?",
        "Check OPD queue status",
        "Book an appointment",
        "I have another symptom",
      ],
    };
  },

  /**
   * Helper: Directly renders facilities for explicit service requests (e.g. "I need an optometrist", "hospital near me").
   */
  async renderFacilityResultsDirectly(
    msgId: string,
    timestamp: string,
    language: AssistantLanguage,
    specialty: string,
    title: string,
    rawQuery: string,
    lat: number,
    lng: number
  ): Promise<ChatMessage> {
    const searchRes = await findRelevantHealthcareFacilities({
      query: rawQuery,
      latitude: lat,
      longitude: lng,
      facilityType: "ALL",
      customRadiusKm: 5,
      sortBy: "best_match",
    });

    const facilityItems: FacilityCardItem[] = (searchRes.facilities || []).slice(0, 3).map((f) => {
      const isDirectMatch = !!f.isDirectSpecialtyMatch;
      const hasSpec = isDirectMatch || (f.specialties || []).some((s) =>
        s.toLowerCase().includes(specialty.toLowerCase().split(" ")[0])
      );

      return {
        id: f.id,
        name: f.name,
        type: f.type,
        distanceKm: f.distanceKm || 1.2,
        travelMinutes: f.travelMinutes || 8,
        matchScore: f.matchScore ?? 75,
        specialistAvailable: hasSpec,
        specialistName: hasSpec && f.doctors && f.doctors.length > 0 ? f.doctors[0].name.split(",")[0] : hasSpec ? `${specialty} Available` : undefined,
        diagnosticAvailable: (f.services || []).some((s) =>
          s.toLowerCase().includes("diagnostic") || s.toLowerCase().includes("ecg") || s.toLowerCase().includes("lab")
        ),
        queueWaitMinutes: f.queue?.estimatedWait,
        isBestMatch: isDirectMatch && (f.matchScore ?? 0) >= 80,
        recommendationLabel: f.recommendationLabel,
        matchTier: f.matchTier,
      };
    });

    return {
      id: msgId,
      sender: "assistant",
      text:
        `Got you 👍 Here are verified healthcare facilities near your location:\n\n` +
        `You can view directions, timings, and OPD consultation details below:`,
      timestamp,
      role: "patient",
      language,
      widget: {
        type: "facility_list",
        data: facilityItems,
      },
      actionLink: {
        label: `📍 View Facilities on Map`,
        href: `/patient/find-care?query=${encodeURIComponent(rawQuery)}`,
      },
      suggestedPrompts: [
        "How do I reach the nearest hospital?",
        "Check OPD queue status",
        "Book an appointment",
      ],
    };
  },
};
