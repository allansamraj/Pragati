// ─── GOOGLE PLACES API (NEW) PROXY ROUTE ─────────────────────────────────────
// Server-side only. API key never exposed to client.
// Calls Google Places API (New) Nearby Search and returns normalized facilities.

import { NextRequest, NextResponse } from 'next/server';
import { FacilityType } from '@/data/facilities';
import { FacilityCategory, classifyGooglePlaceTypes } from '@/lib/ai/facilityRequirementsMapper';

const PLACES_API_BASE = 'https://places.googleapis.com/v1/places:searchNearby';
const PLACES_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.primaryType',
  'places.businessStatus',
  'places.regularOpeningHours',
  'places.googleMapsUri',
  'places.internationalPhoneNumber',
  'places.nationalPhoneNumber',
].join(',');

interface GooglePlace {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  businessStatus?: string;
  regularOpeningHours?: { openNow?: boolean };
  googleMapsUri?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
}

function extractLocality(address: string): string {
  const parts = address.split(',').map((p) => p.trim());
  return parts.length >= 3 ? parts[parts.length - 3] : parts[0] || '';
}

function extractCity(address: string): string {
  const parts = address.split(',').map((p) => p.trim());
  // City is usually second from end before country code
  if (parts.length >= 2) return parts[parts.length - 2].replace(/\s*\d{6}\s*/g, '').trim();
  return parts[0] || '';
}

function deriveSpecialties(types: string[]): string[] {
  const t = types.map((x) => x.toLowerCase());
  if (t.includes('dermatologist') || t.includes('skin_care_clinic')) return ['Dermatology', 'Skin & Allergy Care'];
  if (t.includes('dentist')) return ['Dentistry', 'Oral Healthcare'];
  if (t.includes('ophthalmologist')) return ['Ophthalmology', 'Eye Care'];
  if (t.includes('optician')) return ['Optometry', 'Vision Care'];
  if (t.includes('otolaryngologist')) return ['ENT (Otolaryngology)'];
  if (t.includes('cardiologist')) return ['Cardiology'];
  if (t.includes('orthopedic_surgeon')) return ['Orthopaedics', 'Bone & Joint Care'];
  if (t.includes('pediatrician')) return ['Paediatrics', 'Child Health'];
  if (t.includes('medical_lab') || t.includes('diagnostic_centre') || t.includes('laboratory')) return ['Diagnostics & Imaging'];
  if (t.includes('pharmacy')) return [];
  if (t.includes('hospital') || t.includes('emergency_room')) return ['General Medicine', 'Emergency Medicine'];
  if (t.includes('doctor') || t.includes('primary_care_physician')) return ['General Medicine'];
  return ['General Medicine'];
}

function deriveServices(types: string[]): string[] {
  const t = types.map((x) => x.toLowerCase());
  if (t.includes('dermatologist') || t.includes('skin_care_clinic')) return ['Dermatology Consultation', 'Skin Allergy Treatment', 'Skin Infection Care'];
  if (t.includes('dentist')) return ['Dental Examination', 'Tooth Extraction', 'Root Canal', 'Oral Surgery'];
  if (t.includes('ophthalmologist')) return ['Eye Examination', 'Ophthalmology Consultation', 'Vision Testing'];
  if (t.includes('optician')) return ['Optometry Examination', 'Spectacles', 'Contact Lens Fitting'];
  if (t.includes('otolaryngologist')) return ['ENT Consultation', 'Hearing Evaluation', 'Sinus Care'];
  if (t.includes('cardiologist')) return ['Cardiology Consultation', '12-Lead ECG', 'Cardiac Assessment'];
  if (t.includes('orthopedic_surgeon')) return ['Orthopaedic Consultation', 'Joint Care', 'Fracture Management'];
  if (t.includes('pediatrician')) return ['Paediatric Consultation', 'Child Care', 'Immunization'];
  if (t.includes('medical_lab') || t.includes('laboratory')) return ['Blood Tests', 'Diagnostics', 'Digital X-Ray', 'Ultrasound'];
  if (t.includes('pharmacy')) return ['Dispensing Prescription Medicines', 'Over-the-counter Healthcare'];
  if (t.includes('hospital')) return ['Outpatient Consultation', 'Inpatient Care', 'Emergency Care'];
  return ['Outpatient Consultation'];
}

function deriveDisplayType(types: string[]): string {
  const t = types.map((x) => x.toLowerCase());
  if (t.includes('dermatologist') || t.includes('skin_care_clinic')) return 'Dermatology Clinic';
  if (t.includes('dentist')) return 'Dental Clinic';
  if (t.includes('ophthalmologist')) return 'Eye Hospital & Clinic';
  if (t.includes('optician')) return 'Optical & Vision Centre';
  if (t.includes('otolaryngologist')) return 'ENT Specialist Clinic';
  if (t.includes('cardiologist')) return 'Cardiology & Heart Clinic';
  if (t.includes('orthopedic_surgeon')) return 'Orthopaedic Hospital & Clinic';
  if (t.includes('pediatrician')) return 'Paediatric & Child Care Clinic';
  if (t.includes('medical_lab') || t.includes('laboratory')) return 'Diagnostic & Scan Centre';
  if (t.includes('pharmacy')) return 'Pharmacy & Medicals';
  if (t.includes('hospital')) return 'Hospital';
  return 'Healthcare Facility';
}

function deriveFacilityType(types: string[], isGov: boolean): FacilityType {
  const t = types.map((x) => x.toLowerCase());
  if (t.includes('medical_lab') || t.includes('laboratory') || t.includes('diagnostic_centre')) return 'DIAGNOSTIC_CENTER';
  if (t.includes('pharmacy')) return 'PHARMACY';
  if (t.includes('hospital') || t.includes('emergency_room')) return isGov ? 'GOVERNMENT_HOSPITAL' : 'PRIVATE_HOSPITAL';
  if (t.includes('dermatologist') || t.includes('skin_care_clinic') || t.includes('dentist') || t.includes('ophthalmologist') || t.includes('optician') || t.includes('otolaryngologist') || t.includes('cardiologist') || t.includes('orthopedic_surgeon') || t.includes('pediatrician')) return isGov ? 'GOVERNMENT_CLINIC' : 'PRIVATE_CLINIC';
  return isGov ? 'GOVERNMENT_CLINIC' : 'PRIVATE_CLINIC';
}

function isGovernment(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes('government') ||
    n.includes('govt') ||
    n.includes('corporation') ||
    n.includes('municipal') ||
    n.includes(' phc ') ||
    n.includes('uphc') ||
    n.includes(' chc ') ||
    n.includes('civil hospital') ||
    n.includes('district hospital') ||
    n.includes('primary health') ||
    n.includes('taluk hospital') ||
    n.includes('medical college hospital') ||
    n.startsWith('govt ') ||
    n.startsWith('government ')
  );
}

const PLACES_SEARCH_NEARBY = 'https://places.googleapis.com/v1/places:searchNearby';
const PLACES_SEARCH_TEXT = 'https://places.googleapis.com/v1/places:searchText';

const TABLE_A_SUPPORTED_TYPES = new Set([
  'hospital',
  'doctor',
  'dentist',
  'pharmacy',
  'medical_lab',
  'physiotherapist',
  'drugstore',
]);

async function queryGooglePlaces(
  lat: number,
  lng: number,
  radiusM: number,
  includedTypes: string[],
  textQuery: string | undefined,
  maxResults: number,
  apiKey: string
): Promise<GooglePlace[]> {
  // If a textQuery is provided, use the robust searchText endpoint
  if (textQuery && textQuery.trim().length > 0) {
    const body: Record<string, unknown> = {
      textQuery: textQuery.trim(),
      maxResultCount: Math.min(maxResults, 20),
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusM,
        },
      },
    };

    const res = await fetch(PLACES_SEARCH_TEXT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': PLACES_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = await res.json();
      return (json.places as GooglePlace[]) || [];
    }
  }

  // Filter types to only Table A supported types
  const validTypes = includedTypes.filter((t) => TABLE_A_SUPPORTED_TYPES.has(t.toLowerCase()));
  const effectiveTypes = validTypes.length > 0 ? validTypes : ['hospital', 'doctor'];

  const body: Record<string, unknown> = {
    includedTypes: effectiveTypes.slice(0, 50),
    maxResultCount: Math.min(maxResults, 20),
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusM,
      },
    },
  };

  const res = await fetch(PLACES_SEARCH_NEARBY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': PLACES_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn(`[places-search] Google Nearby API error ${res.status}: ${errText}`);
    return [];
  }

  const json = await res.json();
  return (json.places as GooglePlace[]) || [];
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API key not configured on server.' }, { status: 503 });
  }

  const sp = request.nextUrl.searchParams;
  const lat = parseFloat(sp.get('lat') || sp.get('latitude') || '0');
  const lng = parseFloat(sp.get('lng') || sp.get('longitude') || '0');
  const radiusM = parseInt(sp.get('radius') || '5000', 10);
  const maxResults = parseInt(sp.get('maxResults') || '20', 10);
  const query = sp.get('query') || sp.get('q') || undefined;

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required parameters.' }, { status: 400 });
  }

  const typesParam = sp.get('types') || '';
  const secondaryTypesParam = sp.get('secondaryTypes') || '';

  const primaryTypes = typesParam ? typesParam.split(',').map((t) => t.trim()).filter(Boolean) : ['hospital', 'doctor'];
  const secondaryTypes = secondaryTypesParam ? secondaryTypesParam.split(',').map((t) => t.trim()).filter(Boolean) : [];

  try {
    let places: GooglePlace[] = [];

    // Primary query
    places = await queryGooglePlaces(lat, lng, radiusM, primaryTypes, query, maxResults, apiKey);

    // If primary returned < 2 results and secondary types exist, run secondary query
    if (places.length < 2 && secondaryTypes.length > 0) {
      const secondaryPlaces = await queryGooglePlaces(lat, lng, radiusM, secondaryTypes, undefined, maxResults, apiKey);
      // Deduplicate by ID
      const existingIds = new Set(places.map((p) => p.id));
      for (const p of secondaryPlaces) {
        if (!existingIds.has(p.id)) {
          places.push(p);
          existingIds.add(p.id);
        }
      }
    }


    // Normalize to PRAGATI Facility shape
    const facilities = places
      .filter((p) => p.businessStatus !== 'CLOSED_PERMANENTLY' && p.location)
      .map((place) => {
        const name = place.displayName?.text || 'Healthcare Facility';
        const types = place.types || [];
        const govt = isGovernment(name);
        const ownership = govt ? 'GOVERNMENT' : 'PRIVATE';
        const category: FacilityCategory = classifyGooglePlaceTypes(types);
        const displayType = deriveDisplayType(types);
        const facilityType = deriveFacilityType(types, govt);
        const specialties = deriveSpecialties(types);
        const services = deriveServices(types);
        const address = place.formattedAddress || '';
        const city = extractCity(address);
        const locality = extractLocality(address);
        const isEmergencyCap = types.includes('hospital') || types.includes('emergency_room') || govt;
        const isOpenNow = place.regularOpeningHours?.openNow;

        return {
          id: `gpl-${place.id}`,
          googlePlaceId: place.id,
          name,
          type: displayType,
          facilityType,
          category,
          ownership,
          ownershipSector: ownership,
          lat: place.location!.latitude,
          lng: place.location!.longitude,
          latitude: place.location!.latitude,
          longitude: place.location!.longitude,
          address,
          city,
          state: 'Tamil Nadu',
          district: city,
          locality,
          postalCode: '',
          pincode: '',
          phone: place.internationalPhoneNumber || place.nationalPhoneNumber || undefined,
          googleMapsUri: place.googleMapsUri,
          isOpen: isOpenNow ?? null,
          openingHours: isOpenNow === true ? 'Open Now' : isOpenNow === false ? 'Currently Closed' : 'Hours not available',
          hours: '',
          specialties,
          services,
          emergencyAvailable: isEmergencyCap,
          emergencyCapability: isEmergencyCap,
          verified: true,
          source: 'google_places',
          isPmJayEmpaneled: false,
          hasTelemedicine: false,
          distanceKm: undefined,
          travelMinutes: undefined,
          matchScore: undefined,
        };
      });

    return NextResponse.json(
      { facilities, total: facilities.length, source: 'google_places', searchRadiusM: radiusM },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[places-search] Google Places API error:', message);
    return NextResponse.json({ error: message, facilities: [], total: 0, source: 'google_places_error' }, { status: 502 });
  }
}
