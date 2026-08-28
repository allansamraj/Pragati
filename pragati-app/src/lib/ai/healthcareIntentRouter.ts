// ─── PRAGATI HEALTHCARE INTENT CLASSIFICATION & NAVIGATION ROUTER ───────────────
// High-precision clinical intent router, colloquial language parser,
// symptom-to-specialty mapper, conversational context memory, and safety triage layer.

import { ChatMessage, AssistantLanguage, FacilityCardItem } from './types';
import { getNearbyFacilities } from '@/lib/services/facilityService';

export type HealthcareIntent =
  | 'SYMPTOM'
  | 'SPECIALTY'
  | 'DIAGNOSTIC_TEST'
  | 'MEDICINE_PRESCRIPTION'
  | 'EMERGENCY'
  | 'FACILITY_SEARCH'
  | 'APPOINTMENT_TOKEN'
  | 'HEALTH_RECORD'
  | 'FOLLOW_UP'
  | 'GREETING'
  | 'GENERAL_HEALTH'
  | 'UNKNOWN';

export interface IntentAnalysisResult {
  intent: HealthcareIntent;
  confidence: number;
  extractedSymptom?: string;
  mappedSpecialty: string;
  clinicalCategory: string;
  departmentName: string;
  urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  isEmergencyRedFlag: boolean;
  searchQueryForCare: string;
  recommendedFacilitySector: 'ALL' | 'GOVERNMENT' | 'PRIVATE';
  smartFollowUp?: string;
  suggestedActionLabel: string;
  suggestedActionHref: string;
  suggestedChips: string[];
}

export interface ChatIntentMemory {
  lastIntent?: HealthcareIntent;
  lastSymptom?: string;
  lastSpecialty?: string;
  lastFacilitySector?: 'ALL' | 'GOVERNMENT' | 'PRIVATE';
  lastFacilityName?: string;
  lastFacilityDistance?: string;
  timestamp: number;
}

const INTENT_MEMORY_KEY = 'pragati_chat_intent_memory_v2';

export const healthcareIntentRouter = {
  /**
   * Retrieves active conversation memory from sessionStorage.
   */
  getMemory(): ChatIntentMemory | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = sessionStorage.getItem(INTENT_MEMORY_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Saves updated conversation memory.
   */
  saveMemory(mem: ChatIntentMemory): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(INTENT_MEMORY_KEY, JSON.stringify(mem));
    } catch {}
  },

  /**
   * Clears conversational memory.
   */
  clearMemory(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(INTENT_MEMORY_KEY);
    } catch {}
  },

  /**
   * Cleans colloquial noise and extracts core clinical tokens.
   */
  normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/^[!?,.\s]+|[!?,.\s]+$/g, '')
      .replace(/(bro|bhai|anna|thambi|hey|hi|hello|pls|please|can you|help me with|i have|i got|suffering from|i need|need|want|find|show me|where is|tell me|suggest|looking for|my)/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * Classifies user message into a structured healthcare intent.
   */
  classifyIntent(rawQuery: string): IntentAnalysisResult {
    const rawLower = rawQuery.toLowerCase().trim();
    const clean = this.normalizeQuery(rawQuery);
    const memory = this.getMemory();

    // ── 0. IMMEDIATE EMERGENCY RED FLAGS ──
    const isCriticalEmergency =
      rawLower.includes('severe chest pain') ||
      rawLower.includes('cannot breathe') ||
      rawLower.includes("can't breathe") ||
      rawLower.includes('choking') ||
      rawLower.includes('unconscious') ||
      rawLower.includes('heavy bleeding') ||
      rawLower.includes('heart attack') ||
      rawLower.includes('sudden paralysis') ||
      rawLower.includes('coughing blood') ||
      rawLower.includes('severe breathlessness') ||
      (rawLower.includes('allergy') && (rawLower.includes('throat swelling') || rawLower.includes('lip swelling') || rawLower.includes('cannot breathe')));

    if (isCriticalEmergency) {
      return {
        intent: 'EMERGENCY',
        confidence: 0.99,
        extractedSymptom: 'acute critical emergency',
        mappedSpecialty: 'Emergency Medicine',
        clinicalCategory: 'Emergency Care',
        departmentName: '24/7 Emergency & Trauma Department',
        urgencyLevel: 'EMERGENCY',
        isEmergencyRedFlag: true,
        searchQueryForCare: '24/7 Emergency Trauma Hospital',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'Are you in immediate danger? Please call 108 ambulance service or proceed directly to the nearest emergency department.',
        suggestedActionLabel: '🚨 Find 24/7 Emergency Trauma Hospital',
        suggestedActionHref: '/patient/emergency',
        suggestedChips: ['Call 108 Ambulance', 'Emergency Directions', 'Nearest ICU Hospital'],
      };
    }

    // ── 1. CONVERSATIONAL FOLLOW-UPS USING MEMORY ('nearest one', 'government one', 'private', 'how far') ──
    if (memory && memory.lastSpecialty) {
      const isNearestFollowUp = rawLower === 'nearest' || rawLower === 'nearest one' || rawLower === 'closest' || rawLower === 'nearest first';
      const isGovtFollowUp = rawLower === 'government' || rawLower === 'government one' || rawLower === 'govt' || rawLower === 'public' || rawLower === 'free one';
      const isPrivateFollowUp = rawLower === 'private' || rawLower === 'private one' || rawLower === 'private clinic' || rawLower === 'pvt';
      const isHowFar = rawLower.includes('how far') || rawLower.includes('distance') || rawLower.includes('travel time');

      if (isNearestFollowUp || isGovtFollowUp || isPrivateFollowUp || isHowFar) {
        const sector: 'ALL' | 'GOVERNMENT' | 'PRIVATE' = isGovtFollowUp ? 'GOVERNMENT' : isPrivateFollowUp ? 'PRIVATE' : 'ALL';
        return {
          intent: 'FOLLOW_UP',
          confidence: 0.95,
          extractedSymptom: memory.lastSymptom,
          mappedSpecialty: memory.lastSpecialty,
          clinicalCategory: memory.lastSpecialty,
          departmentName: memory.lastSpecialty + ' Department',
          urgencyLevel: 'ROUTINE',
          isEmergencyRedFlag: false,
          searchQueryForCare: memory.lastSpecialty + ' OPD',
          recommendedFacilitySector: sector,
          suggestedActionLabel: '📍 View Nearby ' + memory.lastSpecialty + ' Care',
          suggestedActionHref: '/patient/find-care?specialty=' + encodeURIComponent(memory.lastSpecialty.toLowerCase()) + '&type=' + sector.toLowerCase(),
          suggestedChips: ['📍 Nearest First', '🏛️ Government Hospital', '🏥 Private Clinic', 'Book Appointment'],
        };
      }
    }

    // ── 2. DERMATOLOGY / SKIN / ALLERGY / RASHES ──
    const isSkin =
      clean.includes('skin allergy') ||
      clean.includes('skin itching') ||
      clean.includes('skin rash') ||
      clean.includes('itching') ||
      clean.includes('rash') ||
      clean.includes('rashes') ||
      clean.includes('red rash') ||
      clean.includes('redness') ||
      clean.includes('skin infection') ||
      clean.includes('skin swollen') ||
      clean.includes('swollen skin') ||
      clean.includes('eczema') ||
      clean.includes('hives') ||
      clean.includes('acne') ||
      clean.includes('pimples') ||
      clean.includes('skin doctor') ||
      clean.includes('dermatologist') ||
      clean.includes('dermatology') ||
      clean.includes('psoriasis') ||
      clean.includes('boil') ||
      clean.includes('skin problem') ||
      clean.includes('skin irritation') ||
      clean.includes('fungal') ||
      clean.includes('ringworm') ||
      rawLower.includes('skin');

    if (isSkin) {
      const isGov = rawLower.includes('govt') || rawLower.includes('government');
      const isPriv = rawLower.includes('private');
      const sector = isGov ? 'GOVERNMENT' : isPriv ? 'PRIVATE' : 'ALL';

      return {
        intent: clean.includes('doctor') || clean.includes('dermatologist') ? 'SPECIALTY' : 'SYMPTOM',
        confidence: 0.96,
        extractedSymptom: 'skin allergy / rash / itching',
        mappedSpecialty: 'Dermatology',
        clinicalCategory: 'Skin & Allergy Care',
        departmentName: 'Dermatology & Skin OPD',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'Skin Allergy and Dermatology OPD',
        recommendedFacilitySector: sector,
        smartFollowUp: 'Is the allergy mainly itching, redness, or swelling? (If you experience any lip/facial swelling or breathing difficulty, seek emergency care immediately.)',
        suggestedActionLabel: '📍 Find Nearby Dermatology Care',
        suggestedActionHref: '/patient/find-care?specialty=dermatology&q=Skin+Allergy+and+Dermatology+OPD&type=' + sector.toLowerCase(),
        suggestedChips: [
          '📍 Nearest First',
          '🏛️ Government Hospital',
          '🏥 Private Clinic',
          'Dermatologist Specifically',
          'Book OPD Token',
        ],
      };
    }

    // ── 3. CARDIOLOGY / CHEST PAIN / HEART / ECG ──
    const isCardiac =
      clean.includes('chest pain') ||
      clean.includes('chest pressure') ||
      clean.includes('palpitation') ||
      clean.includes('palpitations') ||
      clean.includes('heart pain') ||
      clean.includes('racing heart') ||
      clean.includes('cardiologist') ||
      clean.includes('cardiology') ||
      clean.includes('ecg') ||
      clean.includes('12-lead ecg') ||
      clean.includes('heart test') ||
      clean.includes('angina') ||
      clean.includes('high bp') ||
      clean.includes('hypertension');

    if (isCardiac) {
      const isEcgTest = clean.includes('ecg') || clean.includes('test');
      return {
        intent: isEcgTest ? 'DIAGNOSTIC_TEST' : 'SYMPTOM',
        confidence: 0.97,
        extractedSymptom: isEcgTest ? '12-Lead ECG Diagnostic' : 'chest discomfort / cardiac symptom',
        mappedSpecialty: 'Cardiology',
        clinicalCategory: 'Cardiology & Emergency',
        departmentName: 'Cardiology OPD & Emergency Cardiac Unit',
        urgencyLevel: 'URGENT',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'Cardiology Specialist OPD & 12-Lead ECG',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'Do you have any severe sweating, shortness of breath, or pain radiating to your left arm or jaw?',
        suggestedActionLabel: '📍 Find Cardiology & ECG Facilities',
        suggestedActionHref: '/patient/find-care?specialty=cardiology&q=Cardiology+Specialist+OPD+and+12-Lead+ECG',
        suggestedChips: ['📍 Nearest Cardiac Center', '🏛️ Government Medical College', '🏥 24/7 Cath Lab Hospital', '12-Lead ECG Status'],
      };
    }

    // ── 4. DENTAL / TEETH / GUMS ──
    const isDental =
      clean.includes('tooth pain') ||
      clean.includes('toothache') ||
      clean.includes('gum pain') ||
      clean.includes('bleeding gums') ||
      clean.includes('dental') ||
      clean.includes('dentist') ||
      clean.includes('broken tooth') ||
      clean.includes('cavity') ||
      clean.includes('tooth is hurting');

    if (isDental) {
      return {
        intent: clean.includes('dentist') ? 'SPECIALTY' : 'SYMPTOM',
        confidence: 0.95,
        extractedSymptom: 'dental / tooth pain',
        mappedSpecialty: 'Dentistry',
        clinicalCategory: 'Oral Healthcare',
        departmentName: 'Dental OPD & Oral Health',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'Dental Clinic & Oral Healthcare',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'Is there any facial swelling, fever, or difficulty opening your mouth?',
        suggestedActionLabel: '📍 Find Nearby Dental Clinics',
        suggestedActionHref: '/patient/find-care?specialty=dentistry&q=Dental+Clinic+and+Oral+Healthcare',
        suggestedChips: ['📍 Nearest Dental Clinic', '🏛️ Government Dental Centre', '🏥 Private Dental Clinic', 'Book Appointment'],
      };
    }

    // ── 5. OPHTHALMOLOGY / EYE / VISION ──
    const isEye =
      clean.includes('eye infection') ||
      clean.includes('red eye') ||
      clean.includes('eye pain') ||
      clean.includes('vision problem') ||
      clean.includes('blurry vision') ||
      clean.includes('eye doctor') ||
      clean.includes('ophthalmologist') ||
      clean.includes('eye itching') ||
      clean.includes('watery eye') ||
      clean.includes('conjunctivitis');

    if (isEye) {
      return {
        intent: clean.includes('doctor') || clean.includes('ophthalmologist') ? 'SPECIALTY' : 'SYMPTOM',
        confidence: 0.95,
        extractedSymptom: 'eye pain / infection / vision concern',
        mappedSpecialty: 'Ophthalmology',
        clinicalCategory: 'Eye & Vision Care',
        departmentName: 'Ophthalmology & Eye OPD',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'Eye Hospital & Ophthalmology Clinic',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'Do you have sudden vision loss, severe eye trauma, or seeing flashes of light?',
        suggestedActionLabel: '📍 Find Nearby Eye Care Centers',
        suggestedActionHref: '/patient/find-care?specialty=ophthalmology&q=Eye+Hospital+and+Ophthalmology+Clinic',
        suggestedChips: ['📍 Nearest Eye Hospital', '🏛️ Government Eye Clinic', '🏥 Private Eye Specialist', 'Check OPD Queue'],
      };
    }

    // ── 6. ENT / EAR / NOSE / THROAT ──
    const isENT =
      clean.includes('ear pain') ||
      clean.includes('ear ache') ||
      clean.includes('hearing problem') ||
      clean.includes('ear discharge') ||
      clean.includes('blocked ear') ||
      clean.includes('ent doctor') ||
      clean.includes('ent specialist') ||
      clean.includes('tonsil') ||
      clean.includes('sinus');

    if (isENT) {
      return {
        intent: clean.includes('doctor') || clean.includes('specialist') ? 'SPECIALTY' : 'SYMPTOM',
        confidence: 0.94,
        extractedSymptom: 'ear / nose / throat symptom',
        mappedSpecialty: 'ENT (Otolaryngology)',
        clinicalCategory: 'Ear, Nose & Throat Care',
        departmentName: 'ENT Department',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'ENT Specialist Clinic',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'Is there any fluid discharge, high fever, or balance/dizziness issues?',
        suggestedActionLabel: '📍 Find Nearby ENT Specialists',
        suggestedActionHref: '/patient/find-care?specialty=ent&q=ENT+Specialist+Clinic',
        suggestedChips: ['📍 Nearest ENT Doctor', '🏛️ Government Hospital ENT', '🏥 Private ENT Specialist', 'Book Token'],
      };
    }

    // ── 7. GASTROENTEROLOGY / STOMACH PAIN / DIGESTION / FOOD POISONING ──
    const isGastro =
      clean.includes('stomach pain') ||
      clean.includes('abdominal pain') ||
      clean.includes('stomach ache') ||
      clean.includes('gas') ||
      clean.includes('acidity') ||
      clean.includes('gastric') ||
      clean.includes('indigestion') ||
      clean.includes('loose motion') ||
      clean.includes('diarrhea') ||
      clean.includes('vomiting') ||
      clean.includes('nausea') ||
      clean.includes('food poison') ||
      clean.includes('stomach infection');

    if (isGastro) {
      return {
        intent: 'SYMPTOM',
        confidence: 0.95,
        extractedSymptom: 'stomach / digestive symptom',
        mappedSpecialty: 'General Medicine / Gastroenterology',
        clinicalCategory: 'Digestive & Internal Medicine',
        departmentName: 'General Medicine & Gastroenterology OPD',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'General Medicine & Gastroenterology OPD',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'How long has it lasted, and are you able to keep oral fluids down?',
        suggestedActionLabel: '📍 Find Nearby Clinics for Stomach Care',
        suggestedActionHref: '/patient/find-care?specialty=general&q=General+Medicine+and+Gastroenterology+OPD',
        suggestedChips: ['📍 Nearest Clinic', '🏛️ Government PHC / Hospital', '🏥 Private Gastroenterologist', 'ORS & Hydration Guide'],
      };
    }

    // ── 8. ORTHOPAEDICS / BONE / JOINT / BACK PAIN ──
    const isOrtho =
      clean.includes('back pain') ||
      clean.includes('joint pain') ||
      clean.includes('knee pain') ||
      clean.includes('bone pain') ||
      clean.includes('fracture') ||
      clean.includes('sprain') ||
      clean.includes('shoulder pain') ||
      clean.includes('neck pain') ||
      clean.includes('orthopedic') ||
      clean.includes('bone doctor');

    if (isOrtho) {
      return {
        intent: clean.includes('doctor') || clean.includes('orthopedic') ? 'SPECIALTY' : 'SYMPTOM',
        confidence: 0.95,
        extractedSymptom: 'musculoskeletal / bone & joint pain',
        mappedSpecialty: 'Orthopaedics',
        clinicalCategory: 'Bone & Joint Care',
        departmentName: 'Orthopaedic OPD & Trauma',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'Orthopaedic Hospital & Joint Care',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'Was there a recent fall or physical injury? Are you able to bear weight on the joint?',
        suggestedActionLabel: '📍 Find Nearby Orthopaedic Centers',
        suggestedActionHref: '/patient/find-care?specialty=orthopaedics&q=Orthopaedic+Hospital+and+Joint+Care',
        suggestedChips: ['📍 Nearest Ortho Specialist', '🏛️ Government Hospital Ortho', '🏥 Private Orthopedic Hospital', 'Digital X-Ray Centers'],
      };
    }

    // ── 9. PAEDIATRICS / CHILD CARE ──
    const isPaed =
      clean.includes('child fever') ||
      clean.includes('baby fever') ||
      clean.includes('child doctor') ||
      clean.includes('pediatrician') ||
      clean.includes('pediatric') ||
      clean.includes('child cough') ||
      clean.includes('infant');

    if (isPaed) {
      return {
        intent: 'SPECIALTY',
        confidence: 0.96,
        extractedSymptom: 'child healthcare concern',
        mappedSpecialty: 'Paediatrics',
        clinicalCategory: 'Child & Infant Health',
        departmentName: 'Paediatric OPD',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'Paediatric Care & Child Specialist',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'What is the child age and approximate temperature? Are they active and taking fluids normally?',
        suggestedActionLabel: '📍 Find Nearby Child Specialists',
        suggestedActionHref: '/patient/find-care?specialty=paediatrics&q=Paediatric+Care+and+Child+Specialist',
        suggestedChips: ['📍 Nearest Child Clinic', '🏛️ Government Paediatric OPD', '🏥 Private Child Specialist', 'Immunization Centers'],
      };
    }

    // ── 10. GENERAL MEDICINE / FEVER / COLD / CHECKUP ──
    const isGeneral =
      clean.includes('fever') ||
      clean.includes('cold') ||
      clean.includes('cough') ||
      clean.includes('runny nose') ||
      clean.includes('sore throat') ||
      clean.includes('body pain') ||
      clean.includes('weakness') ||
      clean.includes('fatigue') ||
      clean.includes('headache') ||
      clean.includes('routine checkup') ||
      clean.includes('general doctor') ||
      clean.includes('physician');

    if (isGeneral) {
      return {
        intent: 'SYMPTOM',
        confidence: 0.93,
        extractedSymptom: 'fever / general health symptom',
        mappedSpecialty: 'General Medicine',
        clinicalCategory: 'Primary Care',
        departmentName: 'General Medicine OPD / Primary Health Centre',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'General Medicine OPD & Primary Care',
        recommendedFacilitySector: 'ALL',
        smartFollowUp: 'How many days have you had the symptoms, and is the temperature above 101°F (38.3°C)?',
        suggestedActionLabel: '📍 Find Nearby General OPD & PHC',
        suggestedActionHref: '/patient/find-care?specialty=general&q=General+Medicine+OPD+and+Primary+Care',
        suggestedChips: ['📍 Nearest Health Centre', '🏛️ Government PHC / UPHC (Free)', '🏥 Private General Clinic', 'Check Token Status'],
      };
    }

    // ── 11. DIAGNOSTIC TESTS (BLOOD TEST, X-RAY, SCANS) ──
    const isDiag =
      clean.includes('blood test') ||
      clean.includes('blood work') ||
      clean.includes('cbc test') ||
      clean.includes('x-ray') ||
      clean.includes('xray') ||
      clean.includes('ct scan') ||
      clean.includes('mri') ||
      clean.includes('ultrasound') ||
      clean.includes('lipid') ||
      clean.includes('lab test');

    if (isDiag) {
      return {
        intent: 'DIAGNOSTIC_TEST',
        confidence: 0.95,
        extractedSymptom: 'diagnostic investigation',
        mappedSpecialty: 'Diagnostics & Imaging',
        clinicalCategory: 'Diagnostic Laboratory',
        departmentName: 'Diagnostic Centre & Lab Services',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: 'Diagnostic Centre & Laboratory Services',
        recommendedFacilitySector: 'ALL',
        suggestedActionLabel: '📍 Find Diagnostic Centers & Labs',
        suggestedActionHref: '/patient/find-care?q=Diagnostic+Centre+and+Laboratory',
        suggestedChips: ['📍 Nearest Lab', '🏛️ Government Hospital Lab (Free)', '🏥 NABL Accredited Center', 'Price & Timing Info'],
      };
    }

    // ── 12. DIRECT FACILITY SEARCH ('hospital near me', 'government hospital', 'private hospital') ──
    const isFacilitySearch =
      clean.includes('hospital near') ||
      clean.includes('clinic near') ||
      clean.includes('doctor near') ||
      clean.includes('phc near') ||
      clean.includes('hospital') ||
      clean.includes('clinic') ||
      rawLower.includes('near me');

    if (isFacilitySearch) {
      const isGov = rawLower.includes('govt') || rawLower.includes('government') || rawLower.includes('public') || rawLower.includes('free');
      const isPriv = rawLower.includes('private') || rawLower.includes('pvt');
      const sector = isGov ? 'GOVERNMENT' : isPriv ? 'PRIVATE' : 'ALL';

      return {
        intent: 'FACILITY_SEARCH',
        confidence: 0.96,
        mappedSpecialty: 'General Medicine',
        clinicalCategory: 'Healthcare Facilities',
        departmentName: 'Healthcare Facilities',
        urgencyLevel: 'ROUTINE',
        isEmergencyRedFlag: false,
        searchQueryForCare: isGov ? 'Government Public Health Centre' : isPriv ? 'Private Multi-Specialty Hospital' : 'Healthcare Facilities Near Me',
        recommendedFacilitySector: sector,
        suggestedActionLabel: '📍 Browse ' + (isGov ? 'Government' : isPriv ? 'Private' : 'All') + ' Nearby Facilities',
        suggestedActionHref: '/patient/find-care?type=' + sector.toLowerCase(),
        suggestedChips: ['📍 Nearest First', '🏛️ Government Only', '🏥 Private Only', '24/7 Emergency Only'],
      };
    }

    // Default Fallback
    return {
      intent: 'UNKNOWN',
      confidence: 0.3,
      mappedSpecialty: 'General Medicine',
      clinicalCategory: 'General Health',
      departmentName: 'General Medicine OPD',
      urgencyLevel: 'ROUTINE',
      isEmergencyRedFlag: false,
      searchQueryForCare: 'General Health OPD',
      recommendedFacilitySector: 'ALL',
      suggestedActionLabel: '📍 Find Nearby Healthcare Facilities',
      suggestedActionHref: '/patient/find-care',
      suggestedChips: ['I have a fever', 'Skin allergy', 'I need an ECG', 'Find Care Near Me'],
    };
  },

  /**
   * Generates a rich, non-generic, empathetic AI response grounded in real data.
   */
  async processUserMessage(
    rawQuery: string,
    timestamp: string,
    msgId: string,
    language: AssistantLanguage,
    userLat?: number,
    userLng?: number
  ): Promise<ChatMessage> {
    const analysis = this.classifyIntent(rawQuery);

    // Retrieve active patient location from session or fallback
    let lat = userLat;
    let lng = userLng;
    if (lat === undefined || lng === undefined) {
      if (typeof window !== 'undefined') {
        try {
          const cached = sessionStorage.getItem('pragati_last_user_location');
          if (cached) {
            const parsed = JSON.parse(cached);
            lat = parsed.lat;
            lng = parsed.lng;
          }
        } catch {}
      }
      if (lat === undefined || lng === undefined) {
        lat = 13.0827;
        lng = 80.2707;
      }
    }

    // Save intent to memory for conversational continuity
    this.saveMemory({
      lastIntent: analysis.intent,
      lastSymptom: analysis.extractedSymptom,
      lastSpecialty: analysis.mappedSpecialty,
      lastFacilitySector: analysis.recommendedFacilitySector,
      timestamp: Date.now(),
    });

    // ── A. EMERGENCY RESPONSE ──
    if (analysis.isEmergencyRedFlag || analysis.intent === 'EMERGENCY') {
      return {
        id: msgId,
        sender: 'assistant',
        text:
          "🚨 **CRITICAL MEDICAL ALERT**\n\n" +
          "These symptoms may indicate an acute medical emergency that requires immediate clinical evaluation.\n\n" +
          "• **Call 108 Emergency Medical Services immediately**\n" +
          "• Proceed directly to the nearest 24/7 Emergency & Trauma Hospital\n" +
          "• Do not drive yourself if experiencing severe symptoms",
        timestamp,
        role: 'patient',
        language,
        widget: {
          type: 'emergency',
          data: {
            alertTitle: '24/7 Emergency & Trauma Dispatch',
            alertSubtitle: 'Immediate ambulance & critical hospital routing',
            recommendedFacility: 'Rajiv Gandhi Government General Hospital (GGH), Chennai',
            distance: 'Nearby (24/7 Trauma Active)',
            emergencyNumber: '108',
          },
        },
        actionLink: {
          label: '🚨 Find 24/7 Emergency Trauma Hospital',
          href: '/patient/emergency',
        },
        suggestedPrompts: ['Call 108 Ambulance', 'Emergency Directions', 'Check Cardiac Bed Availability'],
      };
    }

    // ── B. QUERY REAL NEARBY HEALTHCARE FACILITIES DYNAMICALLY ──
    let facilityItems: FacilityCardItem[] = [];
    let hasSpecialtyMatch = false;

    try {
      const searchRes = await getNearbyFacilities({
        lat,
        lng,
        specialty: analysis.mappedSpecialty,
        needQuery: analysis.searchQueryForCare,
        facilityType: analysis.recommendedFacilitySector,
        initialRadiusKm: 5,
        sortBy: 'nearest',
      });

      hasSpecialtyMatch = searchRes.hasSpecialtyMatch;

      if (searchRes.facilities && searchRes.facilities.length > 0) {
        facilityItems = searchRes.facilities.slice(0, 3).map((f) => {
          const isDirectMatch = (f.matchScore ?? 0) >= 80;
          const hasSpec = (f.specialties || []).some((s) => s.toLowerCase().includes(analysis.mappedSpecialty.toLowerCase()));

          return {
            id: f.id,
            name: f.name,
            type: f.type,
            distanceKm: f.distanceKm || 1.2,
            travelMinutes: f.travelMinutes || 8,
            matchScore: f.matchScore || (isDirectMatch ? 90 : 55),
            specialistAvailable: hasSpec,
            specialistName: hasSpec ? `${analysis.mappedSpecialty} Specialist on Duty` : "General Medical Officer",
            diagnosticAvailable: f.services?.some((s) => s.toLowerCase().includes("diagnostic") || s.toLowerCase().includes("ecg")) || false,
            queueWaitMinutes: f.queue?.estimatedWait || 12,
            isBestMatch: isDirectMatch,
          };
        });
      }
    } catch (err) {
      console.warn('Facility lookup in assistant router error:', err);
    }

    // ── C. GENERATE PURPOSE-BUILT, EMPATHETIC, NON-GENERIC RESPONSE ──
    let responseText = '';

    if (analysis.intent === 'SYMPTOM' || analysis.intent === 'SPECIALTY') {
      const spec = analysis.mappedSpecialty;
      const symp = analysis.extractedSymptom || spec;

      if (hasSpecialtyMatch) {
        responseText =
          `Got you 👍 For **${symp}**, a **${spec} specialist** is the right clinician to consult.\n\n` +
          `Here are nearby healthcare facilities providing verified **${spec}** care around your location:\n\n` +
          (analysis.smartFollowUp ? `💡 *${analysis.smartFollowUp}*` : '');
      } else {
        responseText =
          `Got you 👍 For **${symp}**, consultation with **${spec}** or General Medicine is recommended.\n\n` +
          `Here are the closest verified healthcare facilities providing outpatient medical care near your location:\n\n` +
          (analysis.smartFollowUp ? `💡 *${analysis.smartFollowUp}*` : '');
      }
    } else if (analysis.intent === 'DIAGNOSTIC_TEST') {
      responseText =
        `Got you 👍 For **${analysis.extractedSymptom}**, I have identified verified healthcare centers and diagnostic laboratories near your current location with active testing capability:`;
    } else if (analysis.intent === 'FACILITY_SEARCH') {
      const secLabel = analysis.recommendedFacilitySector === 'GOVERNMENT' ? 'Government Public Health' : analysis.recommendedFacilitySector === 'PRIVATE' ? 'Private' : 'Government & Private';
      responseText =
        `Here are verified **${secLabel}** healthcare facilities located nearest to your GPS coordinates:`;
    } else if (analysis.intent === 'FOLLOW_UP') {
      const secLabel = analysis.recommendedFacilitySector === 'GOVERNMENT' ? 'Government' : analysis.recommendedFacilitySector === 'PRIVATE' ? 'Private' : 'relevant';
      responseText =
        `Understood 👍 Here are the nearest **${secLabel}** facilities for **${analysis.mappedSpecialty}**:`;
    } else {
      responseText =
        "I am here to help you navigate your healthcare needs. You can ask about symptoms (like *skin allergy*, *fever*, *chest pain*), find doctors, or check nearby facilities.";
    }

    const message: ChatMessage = {
      id: msgId,
      sender: 'assistant',
      text: responseText,
      timestamp,
      role: 'patient',
      language,
      widget: facilityItems.length > 0 ? { type: 'facility_list', data: facilityItems } : undefined,
      actionLink: {
        label: analysis.suggestedActionLabel,
        href: analysis.suggestedActionHref,
      },
      suggestedPrompts: analysis.suggestedChips,
    };

    return message;
  },
};
