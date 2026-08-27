"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Pill, ShieldCheck, Download, Plus, CheckCircle2, QrCode, X, Printer, Stethoscope, Clock, Share2 } from "lucide-react";

interface DoctorRx {
  id: string;
  patient: string;
  age: number;
  gender: string;
  abha: string;
  date: string;
  diagnosis: string;
  meds: { name: string; dose: string; freq: string; duration: string; instructions: string }[];
  status: "Transmitted to Pharmacy" | "Dispensed" | "Pending Patient Confirmation";
  doctor: string;
  regNo: string;
  facility: string;
}

const INITIAL_PRESCRIPTIONS: DoctorRx[] = [
  {
    id: "RX-TN-2026-8812",
    patient: "Arun Sundaram",
    age: 54,
    gender: "Male",
    abha: "77-8923-4512-6734",
    date: "Today, 10:14 AM",
    diagnosis: "Class I Exertional Angina, Controlled Essential Hypertension",
    doctor: "Dr. Ananya Natarajan, MD, DM (Cardiology)",
    regNo: "TMC-2014-08-3921",
    facility: "Government General Hospital, Chennai",
    status: "Transmitted to Pharmacy",
    meds: [
      { name: "Tab. Metoprolol Succinate ER 50mg", dose: "50mg", freq: "1 - 0 - 0 (Morning)", duration: "30 Days", instructions: "Take after breakfast with water" },
      { name: "Tab. Ecosprin (Aspirin) 75mg", dose: "75mg", freq: "0 - 1 - 0 (Afternoon)", duration: "30 Days", instructions: "Take with food" },
      { name: "Tab. Atorvastatin 20mg", dose: "20mg", freq: "0 - 0 - 1 (Night)", duration: "30 Days", instructions: "Take at bedtime" },
      { name: "Tab. Sorbitrate 5mg (SOS)", dose: "5mg", freq: "SOS", duration: "15 Days", instructions: "Sublingually under tongue if chest pain occurs" },
    ],
  },
  {
    id: "RX-TN-2026-8809",
    patient: "Sundari Karthikeyan",
    age: 48,
    gender: "Female",
    abha: "82-1144-9021-3312",
    date: "12 Aug 2026",
    diagnosis: "Chronic Stable Angina & Sinus Tachycardia",
    doctor: "Dr. Ananya Natarajan, MD, DM (Cardiology)",
    regNo: "TMC-2014-08-3921",
    facility: "Government General Hospital, Chennai",
    status: "Dispensed",
    meds: [
      { name: "Tab. Ivabradine 5mg", dose: "5mg", freq: "1 - 0 - 1 (BD)", duration: "30 Days", instructions: "With meals" },
      { name: "Tab. Clopidogrel 75mg", dose: "75mg", freq: "0 - 1 - 0 (OD)", duration: "30 Days", instructions: "After lunch" },
    ],
  },
  {
    id: "RX-TN-2026-8794",
    patient: "Ganesan Palanisamy",
    age: 62,
    gender: "Male",
    abha: "45-7782-3901-8842",
    date: "28 Jul 2026",
    diagnosis: "Stage 2 Hypertension with Microalbuminuria",
    doctor: "Dr. Ananya Natarajan, MD, DM (Cardiology)",
    regNo: "TMC-2014-08-3921",
    facility: "Government General Hospital, Chennai",
    status: "Dispensed",
    meds: [
      { name: "Tab. Ramipril 5mg", dose: "5mg", freq: "1 - 0 - 0 (OD)", duration: "30 Days", instructions: "Morning" },
      { name: "Tab. Metformin 500mg", dose: "500mg", freq: "1 - 0 - 1 (BD)", duration: "60 Days", instructions: "With food" },
      { name: "Tab. Rosuvastatin 10mg", dose: "10mg", freq: "0 - 0 - 1 (HS)", duration: "30 Days", instructions: "Night" },
    ],
  },
  {
    id: "RX-TN-2026-8761",
    patient: "Anjalai Shanmugam",
    age: 39,
    gender: "Female",
    abha: "61-2291-5510-4491",
    date: "15 Jun 2026",
    diagnosis: "Mitral Valve Prolapse & Palpitations",
    doctor: "Dr. Ananya Natarajan, MD, DM (Cardiology)",
    regNo: "TMC-2014-08-3921",
    facility: "Government General Hospital, Chennai",
    status: "Dispensed",
    meds: [
      { name: "Tab. Propranolol 20mg", dose: "20mg", freq: "1 - 0 - 1 (BD)", duration: "30 Days", instructions: "Morning and evening" },
      { name: "Tab. Neurobion Forte", dose: "1 Tab", freq: "0 - 1 - 0 (OD)", duration: "30 Days", instructions: "After lunch" },
    ],
  },
];

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<DoctorRx[]>(INITIAL_PRESCRIPTIONS);
  const [search, setSearch] = useState("");
  const [selectedRx, setSelectedRx] = useState<DoctorRx | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRxSuccess, setNewRxSuccess] = useState(false);

  // New Rx form state
  const [patientName, setPatientName] = useState("");
  const [abhaId, setAbhaId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("");
  const [timing, setTiming] = useState("1 - 0 - 0");
  const [duration, setDuration] = useState("30 Days");

  const filtered = prescriptions.filter(
    (rx) =>
      rx.patient.toLowerCase().includes(search.toLowerCase()) ||
      rx.id.toLowerCase().includes(search.toLowerCase()) ||
      rx.abha.includes(search)
  );

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) return;

    const newEntry: DoctorRx = {
      id: `RX-MH-2026-${Math.floor(8820 + Math.random() * 100)}`,
      patient: patientName,
      age: 45,
      gender: "Male",
      abha: abhaId || "91-3829-4412-8801",
      date: "Just now",
      diagnosis: diagnosis || "Clinical Follow-up & Evaluation",
      doctor: "Dr. Ananya Rao, MD, DM (Cardiology)",
      regNo: "MMC-2014-08-3921",
      facility: "Nandurbar District Civil Hospital",
      status: "Transmitted to Pharmacy",
      meds: [
        {
          name: medName || "Tab. Metoprolol Succinate 50mg",
          dose: dose || "50mg",
          freq: timing,
          duration: duration,
          instructions: "Take as directed with water",
        },
      ],
    };

    setPrescriptions([newEntry, ...prescriptions]);
    setShowNewModal(false);
    setNewRxSuccess(true);
    setTimeout(() => setNewRxSuccess(false), 4000);
  };

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-burgundy-700">
            Digital Prescription Ledger
          </div>
          <h1 className="text-[24px] font-extrabold text-ink-primary mt-0.5 tracking-tight">
            Doctor E-Prescriptions Issued
          </h1>
          <p className="text-[13px] text-ink-secondary">
            Digitally signed electronic prescriptions synced directly with hospital pharmacy &amp; ABHA health locker.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[9px] text-[13px] font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Issue New Prescription
        </button>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {newRxSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[10px] text-emerald-900 text-[12.5px] font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Prescription digitally signed and transmitted to Hospital Central Pharmacy &amp; Patient ABHA account.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Search by Rx ID, patient name, or ABHA ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-[rgba(124,45,45,0.12)] rounded-[10px] text-[13.5px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 shadow-2xs"
        />
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] overflow-hidden shadow-2xs">
        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {filtered.map((rx) => (
            <div key={rx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg/50 transition-colors">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[13.5px] text-ink-primary">{rx.id}</span>
                  <span className="text-[12px] font-bold text-burgundy-800 bg-blush border border-[rgba(124,45,45,0.15)] px-2 py-0.5 rounded">
                    {rx.patient} ({rx.age}y, {rx.gender})
                  </span>
                  <span className="text-[11px] text-ink-tertiary">· {rx.date}</span>
                </div>

                <div className="text-[12px] text-ink-secondary">
                  <strong>Diagnosis:</strong> {rx.diagnosis}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {rx.meds.map((m) => (
                    <span key={m.name} className="text-[11px] font-medium bg-bg border border-[rgba(124,45,45,0.08)] px-2 py-0.5 rounded text-ink-secondary">
                      {m.name} ({m.freq})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[10.5px] font-bold px-2 py-1 rounded border ${
                  rx.status === "Dispensed" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
                }`}>
                  {rx.status}
                </span>

                <button
                  onClick={() => setSelectedRx(rx)}
                  className="px-3.5 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[12px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> View Rx
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VIEW DOCTOR RX MODAL ── */}
      <AnimatePresence>
        {selectedRx && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[18px] max-w-[660px] w-full shadow-2xl border border-[rgba(124,45,45,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Prescriber Signed Copy · {selectedRx.id}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary" title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedRx(null)} className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-ink-primary font-sans">
                {/* Hospital Header */}
                <div className="border-b-2 border-burgundy-800 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-burgundy-700 uppercase">
                      Government of Maharashtra · Health Department
                    </div>
                    <h2 className="text-[17px] font-black text-ink-primary">{selectedRx.facility.toUpperCase()}</h2>
                    <p className="text-[11px] text-ink-secondary">District Hospital Telemedicine Hub · OPD Counter No. 4</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="w-12 h-12 bg-bg border border-[rgba(124,45,45,0.15)] rounded flex items-center justify-center mx-auto text-ink-tertiary">
                      <QrCode className="w-9 h-9 text-ink-primary" />
                    </div>
                    <span className="text-[8px] font-mono text-ink-tertiary block mt-0.5">DISPENSE TOKEN</span>
                  </div>
                </div>

                {/* Patient Bar */}
                <div className="grid grid-cols-2 gap-4 text-[12px] bg-[#FAF8F6] p-3 rounded-[8px] border border-[rgba(124,45,45,0.08)]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Patient Name</span>
                    <strong>{selectedRx.patient} ({selectedRx.age}y / {selectedRx.gender})</strong>
                    <div className="text-[10.5px] text-ink-secondary font-mono">ABHA: {selectedRx.abha}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Prescribed By</span>
                    <strong>{selectedRx.doctor}</strong>
                    <div className="text-[10.5px] text-ink-secondary">Reg: {selectedRx.regNo}</div>
                  </div>
                </div>

                <div className="text-[12px]">
                  <strong>Diagnosis:</strong> {selectedRx.diagnosis}
                </div>

                {/* Rx Table */}
                <div className="space-y-2">
                  <div className="text-[18px] font-serif font-black text-burgundy-800">℞</div>
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead>
                      <tr className="border-b border-ink-primary/20 bg-bg text-[10px] uppercase font-bold text-ink-tertiary">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">Medicine</th>
                        <th className="py-2 px-2">Dosage &amp; Frequency</th>
                        <th className="py-2 px-2">Duration</th>
                        <th className="py-2 px-2">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(124,45,45,0.06)]">
                      {selectedRx.meds.map((m, idx) => (
                        <tr key={m.name}>
                          <td className="py-2 px-2 font-mono font-bold">{idx + 1}</td>
                          <td className="py-2 px-2 font-bold">{m.name}</td>
                          <td className="py-2 px-2">{m.freq}</td>
                          <td className="py-2 px-2 font-mono">{m.duration}</td>
                          <td className="py-2 px-2 text-ink-secondary">{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-[rgba(124,45,45,0.1)] flex items-end justify-between text-[11px]">
                  <div className="text-emerald-700 font-semibold">● Status: {selectedRx.status}</div>
                  <div className="text-right">
                    <div className="font-serif italic text-[14px] text-burgundy-800 font-bold">{selectedRx.doctor}</div>
                    <div className="text-[9.5px] font-mono text-emerald-700">ABDM Digital Signature Verified</div>
                    <div className="text-[9px] text-ink-tertiary">{selectedRx.date}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-bg border-t border-[rgba(124,45,45,0.08)] flex justify-end">
                <button
                  onClick={() => setSelectedRx(null)}
                  className="px-4 py-2 bg-burgundy-700 text-white font-bold text-[12px] rounded-[8px]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATE NEW PRESCRIPTION MODAL ── */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[18px] max-w-[580px] w-full shadow-2xl border border-[rgba(124,45,45,0.2)] overflow-hidden"
            >
              <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink-primary">Draft New E-Prescription</span>
                <button onClick={() => setShowNewModal(false)} className="p-1 rounded hover:bg-blush">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePrescription} className="p-6 space-y-4 text-[13px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-ink-secondary block mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh More"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-9 px-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[7px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-secondary block mb-1">ABHA ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 77-8923-4512-6734"
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      className="w-full h-9 px-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[7px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-secondary block mb-1">Clinical Diagnosis *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Essential Hypertension, Bronchitis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full h-9 px-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[7px]"
                  />
                </div>

                <div className="p-3 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.08)] space-y-3">
                  <span className="text-[11px] font-bold uppercase text-burgundy-700 block">Medication Item</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine name & strength"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="h-8 px-2.5 bg-white border border-[rgba(124,45,45,0.1)] rounded-[6px] text-[12px]"
                    />
                    <input
                      type="text"
                      placeholder="Dose (e.g. 50mg)"
                      value={dose}
                      onChange={(e) => setDose(e.target.value)}
                      className="h-8 px-2.5 bg-white border border-[rgba(124,45,45,0.1)] rounded-[6px] text-[12px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                      className="h-8 px-2 bg-white border border-[rgba(124,45,45,0.1)] rounded-[6px] text-[12px]"
                    >
                      <option value="1 - 0 - 0 (Morning)">1 - 0 - 0 (Morning)</option>
                      <option value="1 - 0 - 1 (Twice Daily)">1 - 0 - 1 (Twice Daily)</option>
                      <option value="0 - 0 - 1 (Night)">0 - 0 - 1 (Night)</option>
                      <option value="SOS (As Needed)">SOS (As Needed)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 30 Days)"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="h-8 px-2.5 bg-white border border-[rgba(124,45,45,0.1)] rounded-[6px] text-[12px]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-3.5 py-2 rounded-[8px] border text-[12px] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white font-bold text-[12px] rounded-[8px] shadow-2xs cursor-pointer"
                  >
                    Sign &amp; Transmit Prescription
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
