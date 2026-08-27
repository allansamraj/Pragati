# PRAGATI — Platform for Rural Access, Guidance & Integrated Treatment

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **PRAGATI** is a unified, intelligent public healthcare platform designed to bridge the gap between primary rural/urban dispensaries and secondary/tertiary medical college hospitals through location-aware facility discovery, hub-and-spoke telemedicine, live OPD token queues, digital ABHA health records, and real-time public health surveillance.

---

## 🏛️ System Architecture & 4-Role Ecosystem

PRAGATI delivers purpose-built workflows tailored for all four key healthcare stakeholders:

```
                                    ┌───────────────────────────────────┐
                                    │    PRAGATI HEALTHCARE PLATFORM    │
                                    └─────────────────┬─────────────────┘
                                                      │
             ┌────────────────────────┬───────────────┴───────────────┬────────────────────────┐
             ▼                        ▼                               ▼                        ▼
     ┌───────────────┐        ┌───────────────┐               ┌───────────────┐        ┌───────────────┐
     │  1. PATIENT   │        │   2. DOCTOR   │               │ 3. PHARMACIST │        │ 4. GOVERNMENT │
     │    PORTAL     │        │    CONSOLE    │               │  & PROVIDER   │        │    COMMAND    │
     └───────────────┘        └───────────────┘               └───────────────┘        └───────────────┘
     • Facility Search        • OPD Consultation Pad          • Live OPD Queue         • Spatial Map
     • Live Token Queue       • Live Patient Queue            • Pharmacy Inventory     • Accessibility Indices
     • Teleconsultation       • Telemedicine Spoke            • Diagnostic Telemetry   • Shortage Alerts
     • ABHA Health Records    • E-Prescriptions (TMC)         • Inter-Facility Referrals• Resource Allocation
     • AI Consent Briefing    • Longitudinal EHR Chart        • Supply Requisitions    • Automated Reports
```

---

## ✨ Core Platform Capabilities

### 1. 🏥 Dynamic Healthcare Facility Discovery (Govt + Private)
- **Multi-Sector Transparency**: Displays both public health institutions (*UPHCs, CHCs, Government General Hospitals, Multi Super Speciality Hospitals*) and empanelled private healthcare partners (*Ayushman Bharat PM-JAY Cashless*).
- **Real-Time Operational Indicators**: Live OPD wait times, specialist roster on duty, diagnostic equipment availability (ECG, X-Ray, CT), and pharmacy stock status.
- **Geographic Proximity**: Computes accurate Haversine distances from patient coordinates with radius filters (5 km, 15 km, 25 km, 50 km).

### 2. 🗺️ Real-Time Spatial Health Intelligence (Government Command)
- **Live OpenStreetMap Engine**: Interactive spatial map with dynamic bounding box zooming for exact street, neighborhood, and hospital-campus resolution.
- **Multi-Scale Surveillance**:
  - 🎯 **Exact Local View**: Detailed municipal zone / primary health spoke grid.
  - 📍 **District View**: Comprehensive district catchment and taluka networks.
  - 🌐 **Statewide View**: Macro-level equity and accessibility indices.
- **GPS Telemetry & Actionable Priority Alerts**: Highlights regional specialist vacancies, diagnostic machine downtimes, and pharmacy buffer stockouts with 1-click dispatch recommendations.

### 3. 🩺 Hub-and-Spoke Telemedicine & E-Prescriptions
- **Rural/Urban Spoke Connection**: Seamless video and telemetry linking between primary health centers and senior specialists at tertiary hospital hubs.
- **Digital Health Worker Assistance**: Integrated workflows for Village Health Nurses (VHN) and Community Health Workers assisting remote patients.
- **Legally Compliant Digital Prescriptions**: QR-authenticated electronic prescriptions linked to State Medical Council registries (e.g. `TMC-2014-08-3921`).

### 4. 🤖 AI Clinical Assist & Video Consent Verification
- **Role-Aware AI Copilot**: Context-aware clinical assistant tailored to doctors, pharmacists, administrators, and patients.
- **Informed Video Consent Protocol**: Interactive AI-guided procedure explanations with comprehension questionnaires and supervisory clinician digital sign-off.

---

## 📍 Dynamic Multi-Region Location Architecture

PRAGATI separates physical patient GPS position, doctor registered institution, provider depot, and government administrative jurisdiction:

| Context Scope | Current Demo Environment | Deployment Architecture |
| :--- | :--- | :--- |
| **State** | **Tamil Nadu** | Fully configurable via `locationService.ts` (e.g., Maharashtra, Karnataka, etc.) |
| **Primary City / District** | **Chennai** (`13.0827° N, 80.2707° E`) | Dynamic geocoding & hierarchy resolution |
| **Tertiary Medical Hub** | **Government General Hospital, Chennai** | Registered institutional binding |
| **Primary Spoke** | **Government UPHC Triplicane** | Rural / Urban Health Clinic spoke |

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Type-Safety)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Mapping**: [OpenStreetMap](https://www.openstreetmap.org/) Embeds with Dynamic Geocoded Bounding Boxes

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or later
- npm, pnpm, or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/allansamraj/Pragati.git
cd Pragati/pragati-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch the application.

---

## 🔑 1-Click Demo Accounts

The prototype includes pre-configured 1-click accounts for rapid evaluation:

| Role | Demo Account Email | Name & Entity | Quick Route |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@pragati.demo` | Arun Sundaram (54y, Male) | `/patient/dashboard` |
| **Doctor** | `doctor@pragati.demo` | Dr. Ananya Natarajan, MD, DM | `/doctor/dashboard` |
| **Provider** | `provider@pragati.demo` | R. Karthikeyan (Chief Pharmacist) | `/provider/dashboard` |
| **Government** | `government@pragati.demo` | Dr. J. Radhakrishnan (IAS) | `/government/dashboard` |

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
