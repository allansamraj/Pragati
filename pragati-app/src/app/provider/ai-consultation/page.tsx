"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, CheckCircle2, AlertTriangle, ShieldCheck, Stethoscope,
  Clock, ArrowRight, User, Video, RefreshCw, XCircle, Search,
  Calendar, Check, AlertCircle, Bot
} from "lucide-react";
import { consentService, ConsentSessionData } from "@/lib/ai/consentService";

export default function ProviderAIConsultationReviewPage() {
  const [session, setSession] = useState<ConsentSessionData>(consentService.getSession());
  const [selectedSession, setSelectedSession] = useState<ConsentSessionData | null>(null);
  const [clinicianNotes, setClinicianNotes] = useState("Patient demonstrates clear comprehension of coronary angiogram indication, procedure duration, and risk profile. Affirmative consent verified.");
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  useEffect(() => {
    setSession(consentService.getSession());
  }, []);

  const handleApprove = () => {
    const updated = consentService.approveByClinician(clinicianNotes);
    setSession(updated);
    setSelectedSession(updated);
    setApprovedSuccess(true);
    setTimeout(() => setApprovedSuccess(false), 3500);
  };

  const handleRequestReconsent = () => {
    consentService.addAuditEntry("Clinician Requested Re-Consent", "Dr. Ananya Rao flagged session for updated procedural briefing.", "CLINICIAN");
    const updated = consentService.getSession();
    setSession(updated);
    setSelectedSession(updated);
  };

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Clinician Oversight &amp; Audit Review
            </span>
            <span className="text-[11px] font-bold text-ink-secondary bg-bg border border-[rgba(124,45,45,0.1)] rounded px-2 py-0.5">
              Government General Hospital, Chennai
            </span>
          </div>
          <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">
            AI-Assisted Consent Review Portal
          </h1>
          <p className="text-[13px] text-ink-secondary mt-0.5">
            Supervising Clinician: <strong className="text-ink-primary">Dr. Ananya Natarajan, MD, DM (Cardiology)</strong> · TMC-2014-08-3921
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/patient/ai-consultation"
            className="text-[12px] font-bold text-burgundy-700 hover:text-burgundy-900 bg-blush border border-[rgba(124,45,45,0.15)] rounded-[8px] px-3.5 py-2 transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" /> View Patient AI Video Session →
          </Link>
        </div>
      </div>

      {approvedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-[12px] text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-[13px]">Consent Record Approved &amp; Digitally Signed!</div>
              <div className="text-[11.5px] text-emerald-800">
                Record validated with TMC-2014-08-3921 credentials and synchronized with Arun Sundaram&apos;s ABHA record.
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-emerald-100 px-2 py-1 rounded">AUDIT LOGGED</span>
        </div>
      )}

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Left: Table of Active Consent Sessions */}
        <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-ink-primary">Today&apos;s AI Consent Sessions (1)</h2>
              <p className="text-[11.5px] text-ink-tertiary">Review video transcripts, comprehension quizzes, and sign consent documents.</p>
            </div>
            <span className="text-[11px] font-semibold text-ink-tertiary">Live System Sync</span>
          </div>

          <div
            onClick={() => setSelectedSession(session)}
            className={`p-4 rounded-[12px] border transition-all cursor-pointer ${
              selectedSession?.sessionId === session.sessionId
                ? "bg-blush/40 border-burgundy-600/50 ring-1 ring-burgundy-600/20"
                : "bg-bg border-[rgba(124,45,45,0.09)] hover:border-burgundy-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-burgundy-700 bg-surface border border-[rgba(124,45,45,0.12)] rounded px-1.5 py-0.5 mb-1 inline-block">
                  Session #{session.sessionId}
                </span>
                <h3 className="text-[15px] font-bold text-ink-primary">
                  {session.patientName} ({session.patientAge}y/{session.patientGender})
                </h3>
                <div className="text-[11px] text-ink-tertiary font-mono">
                  ABHA: {session.abhaId} · {session.location}
                </div>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded border uppercase tracking-wider ${
                  session.status === "APPROVED"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : session.status === "CONSENTED"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                {session.status === "APPROVED"
                  ? "✓ Clinician Approved"
                  : session.status === "CONSENTED"
                  ? "Pending Review"
                  : session.status}
              </span>
            </div>

            <div className="my-2.5 p-2.5 bg-surface rounded-[8px] border border-[rgba(124,45,45,0.06)] text-[12px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary block">Procedure</span>
              <span className="font-semibold text-ink-primary">{session.procedureName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-ink-tertiary block">Comprehension</span>
                <span className="font-bold text-emerald-600">100% (Passed)</span>
              </div>
              <div>
                <span className="text-ink-tertiary block">Method</span>
                <span className="font-bold text-ink-primary">AI Video Session</span>
              </div>
              <div>
                <span className="text-ink-tertiary block">Consent Time</span>
                <span className="font-bold text-ink-primary">{session.consentDecisionTimestamp || "10:34 AM"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Review & Signing Pad */}
        <div className="bg-surface border border-[rgba(124,45,45,0.12)] rounded-[16px] p-5 shadow-sm space-y-4">
          <div className="border-b border-[rgba(124,45,45,0.08)] pb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-burgundy-700 block mb-0.5">
              Clinician Validation Drawer
            </span>
            <h3 className="text-[16px] font-bold text-ink-primary">
              {session.patientName} — {session.sessionId}
            </h3>
          </div>

          <div className="space-y-3 text-[12.5px]">
            <div className="bg-bg p-3 rounded-[10px] border border-[rgba(124,45,45,0.06)] space-y-1">
              <div className="text-[10.5px] uppercase font-bold text-ink-tertiary">Verified Patient Response:</div>
              <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Affirmative Informed Consent Declared
              </div>
              <div className="text-[11px] text-ink-secondary">
                Patient reviewed indication, risks, alternatives, and answered all understanding checkpoint questions.
              </div>
            </div>

            {/* Audit History Timeline */}
            <div>
              <span className="text-[10.5px] uppercase font-bold text-ink-tertiary block mb-2">Audit Log Timeline:</span>
              <div className="relative border-l-2 border-burgundy-200 ml-2 space-y-3 pl-3 text-[11px]">
                {session.auditTrail.slice(-4).map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-burgundy-600" />
                    <div className="font-bold text-ink-primary">{entry.time} · {entry.title}</div>
                    <div className="text-ink-secondary text-[10.5px]">{entry.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinician Notes Input */}
            <div>
              <label className="block text-[11px] uppercase font-bold text-ink-tertiary mb-1">
                Clinician Endorsement Note:
              </label>
              <textarea
                rows={2}
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                className="w-full bg-bg border border-[rgba(124,45,45,0.12)] rounded-[8px] p-2 text-[12px] text-ink-primary focus:outline-none focus:border-burgundy-600"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-[rgba(124,45,45,0.08)]">
              <button
                type="button"
                onClick={handleApprove}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[8px] text-[12.5px] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4" /> Approve &amp; Sign (MMC-2014-08-3921)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/patient/teleconsult"
                  className="py-2 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] text-ink-primary font-semibold rounded-[8px] text-[11.5px] text-center"
                >
                  Video Call Patient
                </Link>
                <button
                  type="button"
                  onClick={handleRequestReconsent}
                  className="py-2 bg-bg hover:bg-rose-50 border border-[rgba(124,45,45,0.12)] text-critical-600 font-semibold rounded-[8px] text-[11.5px] cursor-pointer"
                >
                  Request Re-Consent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
