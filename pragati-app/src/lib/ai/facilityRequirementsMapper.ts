// ─── PRAGATI FACILITY REQUIREMENTS MAPPER ─────────────────────────────────────
// Deterministic, pure mapping from AI intent analysis to Google Places API types,
// OSM Overpass tags, and PRAGATI hard exclusion rules.
// No AI inference. No name heuristics. Lookup only.

import type { IntentAnalysisResult } from './healthcareIntentRouter';

export type FacilityCategory =
  | 'HOSPITAL'
  | 'GOVERNMENT_HOSPITAL'
  | 'PRIMARY_HEALTH_CENTRE'
  | 'COMMUNITY_HEALTH_CENTRE'
  | 'CLINIC'
  | 'SPECIALTY_CLINIC'
  | 'DENTAL_CLINIC'
  | 'EYE_HOSPITAL'
  | 'OPTICAL_SHOP'
  | 'ENT_CLINIC'
  | 'ORTHOPAEDIC_CLINIC'
  | 'PAEDIATRIC_CLINIC'
  | 'CARDIOLOGY_CLINIC'
  | 'SKIN_CLINIC'
  | 'DIAGNOSTIC_CENTER'
  | 'LABORATORY'
  | 'PHARMACY'
  | 'VETERINARY'
  | 'OTHER';

export interface IntentContext {
  specialty: string;
  primaryGoogleTypes: string[];
  secondaryGoogleTypes: string[];
  excludedGoogleTypes: string[];
  osmHealthcareTags: string[];
  excludedCategories: FacilityCategory[];
  isPharmacyExplicit: boolean;
  isDiagnosticExplicit: boolean;
  isEmergency: boolean;
  isStrictSpecialty: boolean;
}

export function classifyGooglePlaceTypes(googleTypes: string[]): FacilityCategory {
  const types = googleTypes.map((t) => t.toLowerCase());
  if (types.includes('dermatologist') || types.includes('skin_care_clinic')) return 'SKIN_CLINIC';
  if (types.includes('dentist')) return 'DENTAL_CLINIC';
  if (types.includes('ophthalmologist')) return 'EYE_HOSPITAL';
  if (types.includes('optician')) return 'OPTICAL_SHOP';
  if (types.includes('otolaryngologist')) return 'ENT_CLINIC';
  if (types.includes('cardiologist')) return 'CARDIOLOGY_CLINIC';
  if (types.includes('orthopedic_surgeon')) return 'ORTHOPAEDIC_CLINIC';
  if (types.includes('pediatrician')) return 'PAEDIATRIC_CLINIC';
  if (types.includes('medical_lab') || types.includes('diagnostic_centre') || types.includes('laboratory')) return 'DIAGNOSTIC_CENTER';
  if (types.includes('pharmacy')) return 'PHARMACY';
  if (types.includes('veterinary_care')) return 'VETERINARY';
  if (types.includes('hospital') || types.includes('emergency_room')) return 'HOSPITAL';
  if (types.includes('doctor') || types.includes('clinic') || types.includes('primary_care_physician') || types.includes('health')) return 'CLINIC';
  return 'OTHER';
}

export function mapIntentToFacilityRequirements(analysis: IntentAnalysisResult): IntentContext {
  const specialty = analysis.mappedSpecialty.toLowerCase();
  const intent = analysis.intent;

  if (analysis.isEmergencyRedFlag || intent === 'EMERGENCY') {
    return { specialty: 'Emergency Medicine', primaryGoogleTypes: ['hospital', 'emergency_room'], secondaryGoogleTypes: ['doctor'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['amenity=hospital', 'emergency=yes'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: true, isStrictSpecialty: false };
  }

  if (specialty.includes('pharmacy') || analysis.searchQueryForCare?.toLowerCase().includes('pharmacy')) {
    return { specialty: 'Pharmacy', primaryGoogleTypes: ['pharmacy'], secondaryGoogleTypes: [], excludedGoogleTypes: [], osmHealthcareTags: ['amenity=pharmacy', 'healthcare=pharmacy'], excludedCategories: [], isPharmacyExplicit: true, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: true };
  }

  if (specialty.includes('derma') || specialty.includes('skin')) {
    return { specialty: 'Dermatology', primaryGoogleTypes: ['dermatologist', 'skin_care_clinic'], secondaryGoogleTypes: ['hospital', 'doctor'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care', 'physiotherapist'], osmHealthcareTags: ['healthcare=dermatologist', 'healthcare:speciality=dermatology', 'amenity=clinic'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY', 'DIAGNOSTIC_CENTER'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: false };
  }

  if (specialty.includes('dent') || specialty.includes('oral')) {
    return { specialty: 'Dentistry', primaryGoogleTypes: ['dentist'], secondaryGoogleTypes: ['hospital'], excludedGoogleTypes: ['pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['healthcare=dentist', 'amenity=dentist'], excludedCategories: ['PHARMACY', 'OPTICAL_SHOP', 'VETERINARY', 'SKIN_CLINIC', 'ENT_CLINIC', 'ORTHOPAEDIC_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: true };
  }

  if (specialty.includes('optometr') || specialty.includes('optic') || specialty.includes('vision correction')) {
    return { specialty: 'Optometry', primaryGoogleTypes: ['optician', 'ophthalmologist'], secondaryGoogleTypes: ['hospital'], excludedGoogleTypes: ['dentist', 'pharmacy', 'veterinary_care'], osmHealthcareTags: ['healthcare=optometrist', 'shop=optician'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'VETERINARY', 'SKIN_CLINIC', 'ENT_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: true };
  }

  if (specialty.includes('ophthalm') || specialty.includes('eye')) {
    return { specialty: 'Ophthalmology', primaryGoogleTypes: ['ophthalmologist'], secondaryGoogleTypes: ['hospital', 'doctor'], excludedGoogleTypes: ['dentist', 'pharmacy', 'veterinary_care'], osmHealthcareTags: ['healthcare=ophthalmologist', 'healthcare:speciality=ophthalmology'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'VETERINARY', 'SKIN_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: false };
  }

  if (specialty.includes('ent') || specialty.includes('otolaryng') || specialty.includes('ear, nose')) {
    return { specialty: 'ENT (Otolaryngology)', primaryGoogleTypes: ['otolaryngologist'], secondaryGoogleTypes: ['hospital', 'doctor'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['healthcare=audiologist', 'healthcare:speciality=ent', 'amenity=clinic'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY', 'SKIN_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: false };
  }

  if (specialty.includes('cardio') || specialty.includes('heart') || specialty.includes('cardiac')) {
    return { specialty: 'Cardiology', primaryGoogleTypes: ['cardiologist'], secondaryGoogleTypes: ['hospital'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['healthcare=cardiologist', 'healthcare:speciality=cardiology'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY', 'SKIN_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: analysis.urgencyLevel === 'URGENT' || analysis.urgencyLevel === 'EMERGENCY', isStrictSpecialty: false };
  }

  if (specialty.includes('ortho') || specialty.includes('bone') || specialty.includes('joint')) {
    return { specialty: 'Orthopaedics', primaryGoogleTypes: ['orthopedic_surgeon'], secondaryGoogleTypes: ['hospital', 'doctor'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['healthcare:speciality=orthopaedics', 'amenity=clinic'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY', 'SKIN_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: false };
  }

  if (specialty.includes('paed') || specialty.includes('pediatr') || specialty.includes('child')) {
    return { specialty: 'Paediatrics', primaryGoogleTypes: ['pediatrician'], secondaryGoogleTypes: ['hospital', 'doctor'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['healthcare=paediatrician', 'healthcare:speciality=paediatrics'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY', 'SKIN_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: false };
  }

  if (intent === 'DIAGNOSTIC_TEST' || specialty.includes('diagnost') || specialty.includes('imaging') || specialty.includes('lab')) {
    return { specialty: 'Diagnostics & Imaging', primaryGoogleTypes: ['medical_lab'], secondaryGoogleTypes: ['hospital', 'doctor'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['healthcare=laboratory', 'amenity=clinic'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY', 'SKIN_CLINIC'], isPharmacyExplicit: false, isDiagnosticExplicit: true, isEmergency: false, isStrictSpecialty: false };
  }

  if (intent === 'FACILITY_SEARCH') {
    return { specialty: 'General Medicine', primaryGoogleTypes: ['hospital', 'doctor', 'clinic'], secondaryGoogleTypes: ['primary_care_physician'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['amenity=hospital', 'amenity=clinic', 'healthcare=centre'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: false };
  }

  return { specialty: 'General Medicine', primaryGoogleTypes: ['doctor', 'hospital', 'clinic'], secondaryGoogleTypes: ['primary_care_physician'], excludedGoogleTypes: ['dentist', 'pharmacy', 'optician', 'veterinary_care'], osmHealthcareTags: ['amenity=clinic', 'amenity=hospital', 'healthcare=doctor', 'healthcare=centre'], excludedCategories: ['DENTAL_CLINIC', 'PHARMACY', 'OPTICAL_SHOP', 'VETERINARY'], isPharmacyExplicit: false, isDiagnosticExplicit: false, isEmergency: false, isStrictSpecialty: false };
}
