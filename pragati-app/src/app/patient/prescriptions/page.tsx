"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Clock, Calendar, CheckCircle2, AlertCircle, Pill, ShieldCheck, QrCode, X, Printer, Building2, Stethoscope, Share2 } from "lucide-react";
import { DEMO_PATIENT, Medication } from "@/data/patient";
import { useLanguage } from "@/lib/i18n";

export default function PrescriptionsPage() {
  const { t } = useLanguage();
  const [selectedRxDoc, setSelectedRxDoc] = useState<string | null>(null);
  const [refillSuccess, setRefillSuccess] = useState<string | null>(null);

  const medications = DEMO_PATIENT.currentMedications;

  const handleRequestRefill = (medName: string) => {
    setRefillSuccess(medName);
    setTimeout(() => setRefillSuccess(null), 4000);
  };

  return (
    <div className="max-w-[920px] mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-burgundy-700 mb-1">
          {t("patient.nav.prescriptions")}
        </div>
        <h1 className="text-[26px] font-extrabold text-ink-primary tracking-tight">
          Active E-Prescriptions &amp; Medications
        </h1>
        <p className="text-[13px] text-ink-secondary mt-0.5">
          ABHA-linked digital prescriptions with dosage schedules, pharmacy dispense status, and refill requests
        </p>
      </div>

      {/* Refill Success Alert */}
      <AnimatePresence>
        {refillSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[12px] flex items-center justify-between text-emerald-900 text-[12.5px] shadow-xs"
          >
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Refill requested for <strong>{refillSuccess}</strong>. Sent to Nandurbar Central Pharmacy counter.</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
              Reserved in Queue
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN ACTIVE PRESCRIPTION CARD 1: CARDIOLOGY ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[rgba(124,45,45,0.12)] rounded-[18px] shadow-2xs overflow-hidden"
      >
        {/* Prescription Header */}
        <div className="bg-blush/30 border-b border-[rgba(124,45,45,0.08)] px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-2 py-0.5">
                  Official Digital Rx · RX-MH-2026-8812
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active (18 Days Left)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-burgundy-700 text-white flex items-center justify-center font-bold text-[13px] shadow-xs">
                  AR
                </div>
                <div>
                  <div className="text-[15.5px] font-bold text-ink-primary flex items-center gap-1.5">
                    <span>Dr. Ananya Rao</span>
                    <span className="text-[11px] font-mono font-medium text-ink-tertiary">(MMC-2014-08-3921)</span>
                  </div>
                  <div className="text-[12px] text-ink-secondary">
                    Cardiology OPD · Nandurbar District Civil Hospital
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11.5px] text-ink-tertiary mt-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-burgundy-700" /> Prescribed: <strong>12 Aug 2026</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" /> Valid Until: <strong>12 Sep 2026</strong>
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedRxDoc("RX-MH-2026-8812")}
                className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-white bg-burgundy-700 hover:bg-burgundy-800 rounded-[8px] px-3.5 py-2 transition-colors shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> View Official Rx Document
              </button>
              <button
                onClick={() => setSelectedRxDoc("RX-MH-2026-8812")}
                className="flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-ink-secondary bg-white border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-1.5 hover:bg-blush transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Medications List */}
        <div className="p-6 space-y-3.5">
          <div className="text-[11px] uppercase tracking-widest font-extrabold text-ink-tertiary">
            Prescribed Medications (4 Items)
          </div>

          <div className="space-y-3">
            {medications.slice(0, 3).map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-[12px] border transition-all ${
                  med.refillNeeded ? "border-amber-300 bg-amber-50/50" : "border-[rgba(124,45,45,0.08)] bg-bg"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[14.5px] font-bold text-ink-primary">{med.name}</h3>
                      <span className="text-[11px] text-ink-tertiary">({med.genericName})</span>
                      {med.refillNeeded && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-2 py-0.5">
                          ● Refill Due (4 Days Remaining)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12px] my-2">
                      <div className="p-2 bg-white rounded-[6px] border border-[rgba(124,45,45,0.06)]">
                        <span className="text-ink-tertiary text-[10.5px] block">Dosage</span>
                        <strong className="text-ink-primary">{med.dose}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-[6px] border border-[rgba(124,45,45,0.06)]">
                        <span className="text-ink-tertiary text-[10.5px] block">Frequency &amp; Timing</span>
                        <strong className="text-ink-primary">{med.timing || med.frequency}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-[6px] border border-[rgba(124,45,45,0.06)]">
                        <span className="text-ink-tertiary text-[10.5px] block">Course Duration</span>
                        <strong className="text-ink-primary">{med.duration}</strong>
                      </div>
                    </div>

                    {med.instructions && (
                      <p className="text-[11.5px] text-ink-secondary mt-1">
                        <strong>Instructions:</strong> {med.instructions}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[22px] font-extrabold font-mono text-ink-primary leading-none">
                      {med.daysRemaining}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-tertiary mt-0.5">Days Left</div>

                    {med.refillNeeded && (
                      <button
                        onClick={() => handleRequestRefill(med.name)}
                        className="mt-3 px-3 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[6px] text-[11px] font-bold shadow-2xs cursor-pointer transition-colors"
                      >
                        Request Refill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── SECONDARY PRESCRIPTION CARD 2: DIABETES CHRONIC CARE ── */}
      <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[16px] p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                Diabetes Chronic Care · RX-MH-2026-7640
              </span>
              <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                Refill Required
              </span>
            </div>
            <h2 className="text-[16px] font-bold text-ink-primary">
              Dr. Prakash More, MD (General Medicine)
            </h2>
            <div className="text-[12px] text-ink-secondary">
              Shahada Community Health Centre · Prescribed: 01 Jul 2026
            </div>
          </div>

          <button
            onClick={() => setSelectedRxDoc("RX-MH-2026-7640")}
            className="text-[11.5px] font-bold text-burgundy-700 bg-blush hover:bg-rose border border-[rgba(124,45,45,0.12)] rounded-[8px] px-3 py-1.5 flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> View Prescription
          </button>
        </div>

        <div className="p-3.5 bg-bg rounded-[10px] border border-[rgba(124,45,45,0.06)] flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-[13.5px] text-ink-primary block">Metformin Hydrochloride 500mg (SR)</span>
            <span className="text-[11.5px] text-ink-secondary">Twice daily with meals (Morning &amp; Night) · 60 Days course</span>
          </div>
          <button
            onClick={() => handleRequestRefill("Metformin 500mg")}
            className="px-3.5 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[6px] text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
          >
            Reserve Refill
          </button>
        </div>
      </div>

      {/* ── INTERACTIVE OFFICIAL DIGITAL PRESCRIPTION DOCUMENT MODAL ── */}
      <AnimatePresence>
        {selectedRxDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[18px] max-w-[660px] w-full shadow-2xl border border-[rgba(124,45,45,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Document Modal Header */}
              <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-burgundy-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> ABDM Digitally Verified E-Prescription
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary"
                    title="Print Prescription"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedRxDoc(null)}
                    className="p-1.5 rounded-[6px] hover:bg-blush text-ink-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Medical Letterhead Paper */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-ink-primary font-sans">
                {/* Hospital Letterhead */}
                <div className="border-b-2 border-burgundy-800 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-burgundy-700 uppercase">
                      Government of Maharashtra · Public Health Department
                    </div>
                    <h2 className="text-[18px] font-black text-ink-primary tracking-tight">
                      NANDURBAR DISTRICT CIVIL HOSPITAL
                    </h2>
                    <p className="text-[11px] text-ink-secondary">
                      Civil Hospital Road, Collector Office Area, Nandurbar - 425412 · Ph: 02564-222100
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="w-12 h-12 bg-bg border border-[rgba(124,45,45,0.15)] rounded flex items-center justify-center mx-auto text-ink-tertiary">
                      <QrCode className="w-9 h-9 text-ink-primary" />
                    </div>
                    <span className="text-[8.5px] font-mono text-ink-tertiary block mt-0.5">ABHA SCAN &amp; DISPENSE</span>
                  </div>
                </div>

                {/* Doctor & Patient Metadata Row */}
                <div className="grid grid-cols-2 gap-4 text-[12px] bg-[#FAF8F6] p-3 rounded-[8px] border border-[rgba(124,45,45,0.08)]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Prescribing Clinician</span>
                    <strong>Dr. Ananya Rao, MD, DM (Cardiology)</strong>
                    <div className="text-[10.5px] text-ink-secondary">Reg No: MMC-2014-08-3921 · Dept: Cardiology OPD</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Patient Information</span>
                    <strong>Arjun Deshmukh (54y, Male)</strong>
                    <div className="text-[10.5px] text-ink-secondary font-mono">ABHA ID: 77-8923-4512-6734</div>
                  </div>
                </div>

                {/* Clinical Diagnosis */}
                <div className="text-[12px]">
                  <strong>Clinical Diagnosis:</strong> Class I Exertional Angina, Controlled Hypertension, Mild Dyslipidemia.
                </div>

                {/* Rx Symbol and Medications Table */}
                <div className="space-y-2">
                  <div className="text-[18px] font-serif font-black text-burgundy-800">
                    ℞ <span className="text-[12px] font-sans font-bold text-ink-secondary tracking-normal">Medication Schedule:</span>
                  </div>

                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead>
                      <tr className="border-b border-ink-primary/20 bg-bg text-[10px] uppercase font-bold text-ink-tertiary">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">Medicine &amp; Strength</th>
                        <th className="py-2 px-2">Dosage &amp; Timing</th>
                        <th className="py-2 px-2">Duration</th>
                        <th className="py-2 px-2">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(124,45,45,0.06)]">
                      <tr>
                        <td className="py-2 px-2 font-mono font-bold">1</td>
                        <td className="py-2 px-2">
                          <strong>Tab. Metoprolol Succinate ER 50mg</strong>
                          <div className="text-[10px] text-ink-tertiary">Take in morning after breakfast</div>
                        </td>
                        <td className="py-2 px-2 font-semibold">1 - 0 - 0 (Morning)</td>
                        <td className="py-2 px-2">30 Days</td>
                        <td className="py-2 px-2 font-mono">30 Tabs</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-mono font-bold">2</td>
                        <td className="py-2 px-2">
                          <strong>Tab. Ecosprin (Aspirin) 75mg</strong>
                          <div className="text-[10px] text-ink-tertiary">Take after lunch with water</div>
                        </td>
                        <td className="py-2 px-2 font-semibold">0 - 1 - 0 (Afternoon)</td>
                        <td className="py-2 px-2">30 Days</td>
                        <td className="py-2 px-2 font-mono">30 Tabs</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-mono font-bold">3</td>
                        <td className="py-2 px-2">
                          <strong>Tab. Atorvastatin 20mg</strong>
                          <div className="text-[10px] text-ink-tertiary">Take at bedtime</div>
                        </td>
                        <td className="py-2 px-2 font-semibold">0 - 0 - 1 (Night)</td>
                        <td className="py-2 px-2">30 Days</td>
                        <td className="py-2 px-2 font-mono">30 Tabs</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-mono font-bold">4</td>
                        <td className="py-2 px-2">
                          <strong>Tab. Sorbitrate 5mg (SOS)</strong>
                          <div className="text-[10px] text-ink-tertiary">Place under tongue if chest tightness occurs</div>
                        </td>
                        <td className="py-2 px-2 font-semibold">SOS as needed</td>
                        <td className="py-2 px-2">15 Days</td>
                        <td className="py-2 px-2 font-mono">15 Tabs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Doctor's Signature Block */}
                <div className="pt-4 border-t border-[rgba(124,45,45,0.1)] flex items-end justify-between text-[11px]">
                  <div>
                    <div className="text-[10px] text-ink-tertiary">Emergency Note:</div>
                    <div className="text-ink-secondary">If chest pain lasts &gt; 10 minutes, dial 108 immediately.</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic text-[14px] text-burgundy-800 font-bold">Dr. Ananya Rao</div>
                    <div className="text-[9.5px] font-mono text-emerald-700">Digitally Signed · MMC-2014-08-3921</div>
                    <div className="text-[9px] text-ink-tertiary">12 Aug 2026, 10:14 AM IST</div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-bg border-t border-[rgba(124,45,45,0.08)] flex justify-end gap-2">
                <button
                  onClick={() => setSelectedRxDoc(null)}
                  className="px-4 py-2 bg-burgundy-700 text-white font-bold text-[12px] rounded-[8px] shadow-2xs"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
