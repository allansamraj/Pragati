"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Search, Calendar, Stethoscope,
  FileText, Share2, RefreshCw, ChevronRight
} from "lucide-react";

const JOURNEY_STEPS = [
  {
    id: "understand",
    number: "01",
    icon: <MessageSquare className="w-4 h-4" />,
    label: "Understand",
    sublabel: "Describe your need",
    preview: {
      title: "What care do you need?",
      content: (
        <div className="space-y-2">
          <div className="bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] p-3 text-[12px] text-ink-primary italic">
            "I've had chest discomfort since this morning and need to see a heart doctor."
          </div>
          <div className="bg-available-50 border border-available-100 rounded-[8px] p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-available-500 mb-1.5">Understood</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ["Care", "Cardiology"],
                ["Diagnostic", "ECG"],
                ["Urgency", "Routine"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-ink-tertiary">{k}:</span>
                  <span className="text-[11px] font-semibold text-ink-primary">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: "match",
    number: "02",
    icon: <Search className="w-4 h-4" />,
    label: "Match",
    sublabel: "Find available facility",
    preview: {
      title: "4 facilities matched",
      content: (
        <div className="space-y-1.5">
          {[
            { name: "District Hospital", score: 94, color: "text-available-500" },
            { name: "Government Hospital", score: 78, color: "text-limited-500" },
            { name: "Rural Hospital", score: 54, color: "text-critical-500" },
          ].map((f) => (
            <div key={f.name} className="flex items-center justify-between bg-surface border border-[rgba(124,45,45,0.08)] rounded-[8px] px-3 py-2">
              <span className="text-[12px] font-medium text-ink-primary">{f.name}</span>
              <span className={`text-[13px] font-bold font-mono ${f.color}`}>{f.score}%</span>
            </div>
          ))}
        </div>
      ),
    },
  },
  {
    id: "book",
    number: "03",
    icon: <Calendar className="w-4 h-4" />,
    label: "Book",
    sublabel: "Reserve your token",
    preview: {
      title: "Token Reserved",
      content: (
        <div className="text-center py-2">
          <div className="text-[11px] uppercase tracking-widest text-ink-tertiary font-semibold mb-1">Your Token</div>
          <div className="text-[48px] font-bold font-mono text-burgundy-700 leading-none">#47</div>
          <div className="text-[12px] text-ink-secondary mt-2">6 patients ahead • Est. 18 min</div>
          <div className="mt-3 bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] p-2 text-[11px] text-ink-secondary">
            Nandurbar District Civil Hospital — Cardiology
          </div>
        </div>
      ),
    },
  },
  {
    id: "care",
    number: "04",
    icon: <Stethoscope className="w-4 h-4" />,
    label: "Care",
    sublabel: "Consultation",
    preview: {
      title: "Consultation",
      content: (
        <div className="space-y-2">
          <div className="bg-surface border border-[rgba(124,45,45,0.08)] rounded-[8px] p-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blush border border-[rgba(124,45,45,0.12)] flex items-center justify-center text-[11px] font-bold text-burgundy-700">AR</div>
            <div>
              <div className="text-[12px] font-semibold text-ink-primary">Dr. Ananya Rao</div>
              <div className="text-[10px] text-ink-tertiary">Cardiology — Nandurbar District Civil Hospital</div>
            </div>
          </div>
          <div className="text-[11px] text-ink-secondary bg-blush border border-[rgba(124,45,45,0.08)] rounded-[8px] p-2.5">
            Clinical assessment in progress. Records accessible with consent.
          </div>
        </div>
      ),
    },
  },
  {
    id: "record",
    number: "05",
    icon: <FileText className="w-4 h-4" />,
    label: "Record",
    sublabel: "Prescription + history",
    preview: {
      title: "Health Records",
      content: (
        <div className="space-y-1.5">
          {[
            { date: "25 Aug", type: "Prescription", icon: "Rx" },
            { date: "24 Aug", type: "ECG Report", icon: "📋" },
            { date: "23 Aug", type: "Consultation", icon: "Dr" },
          ].map((r) => (
            <div key={r.date} className="flex items-center gap-2.5 bg-surface border border-[rgba(124,45,45,0.07)] rounded-[8px] px-3 py-2">
              <div className="w-6 h-6 rounded-[4px] bg-blush flex items-center justify-center text-[9px] font-bold text-burgundy-700">{r.icon}</div>
              <div>
                <div className="text-[11px] font-semibold text-ink-primary">{r.type}</div>
                <div className="text-[10px] text-ink-tertiary">{r.date}</div>
              </div>
              <div className="ml-auto text-[10px] text-available-500 font-medium">Secured</div>
            </div>
          ))}
        </div>
      ),
    },
  },
  {
    id: "refer",
    number: "06",
    icon: <Share2 className="w-4 h-4" />,
    label: "Referral",
    sublabel: "If specialist care needed",
    preview: {
      title: "Referral Tracker",
      content: (
        <div className="space-y-1.5">
          {[
            { step: "Created", done: true },
            { step: "Accepted", done: true },
            { step: "Appointment Scheduled", done: true },
            { step: "Patient Arrived", done: false },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold ${s.done ? "bg-available-500 border-available-500 text-white" : "bg-surface border-[rgba(124,45,45,0.15)] text-ink-tertiary"}`}>
                {s.done ? "✓" : ""}
              </div>
              <span className={`text-[12px] ${s.done ? "text-ink-primary font-medium" : "text-ink-tertiary"}`}>{s.step}</span>
            </div>
          ))}
        </div>
      ),
    },
  },
  {
    id: "continue",
    number: "07",
    icon: <RefreshCw className="w-4 h-4" />,
    label: "Continue",
    sublabel: "Follow-up care",
    preview: {
      title: "Care Timeline",
      content: (
        <div className="space-y-2">
          {[
            { date: "Today", event: "Medication due", type: "medication" },
            { date: "30 Aug", event: "Cardiology follow-up", type: "appointment" },
            { date: "02 Sep", event: "Blood test (fasting)", type: "diagnostic" },
            { date: "15 Sep", event: "Next checkup", type: "appointment" },
          ].map((e) => (
            <div key={e.date} className="flex items-start gap-2.5">
              <div className="w-14 text-[10px] font-bold text-ink-tertiary pt-0.5 flex-shrink-0">{e.date}</div>
              <div className="w-px self-stretch bg-[rgba(124,45,45,0.1)] mx-1 flex-shrink-0" />
              <div className="text-[12px] font-medium text-ink-primary">{e.event}</div>
            </div>
          ))}
        </div>
      ),
    },
  },
];

export function CoreSolutionSection() {
  const [activeStep, setActiveStep] = useState(0);
  const active = JOURNEY_STEPS[activeStep];

  return (
    <section
      id="how-it-works"
      className="section-py bg-bg"
      aria-labelledby="solution-heading"
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="eyebrow mb-4">Core Solution</div>
          <h2
            id="solution-heading"
            className="text-[clamp(28px,3.5vw,40px)] font-bold text-ink-primary"
            style={{ letterSpacing: "-0.02em" }}
          >
            One connected healthcare journey.
          </h2>
          <p className="text-[16px] text-ink-secondary mt-3 max-w-[480px] mx-auto">
            From understanding your need to continued care — every step connected.
          </p>
        </div>

        {/* Journey steps */}
        <div
          className="flex items-stretch gap-0 mb-10 overflow-x-auto pb-2"
          role="tablist"
          aria-label="Care journey steps"
        >
          {JOURNEY_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <button
                role="tab"
                id={`tab-${step.id}`}
                aria-selected={activeStep === i}
                aria-controls={`panel-${step.id}`}
                onClick={() => setActiveStep(i)}
                className={`flex flex-col items-center text-center px-4 py-3 rounded-[10px] min-w-[100px] flex-1 transition-all duration-200 cursor-pointer border ${
                  activeStep === i
                    ? "bg-burgundy-700 border-burgundy-700 text-white shadow-sm"
                    : "bg-surface border-[rgba(124,45,45,0.08)] text-ink-secondary hover:bg-blush hover:border-[rgba(124,45,45,0.15)]"
                }`}
              >
                <div className={`mb-1.5 ${activeStep === i ? "text-white" : "text-burgundy-600"}`} aria-hidden>
                  {step.icon}
                </div>
                <div className={`text-[13px] font-bold leading-tight ${activeStep === i ? "text-white" : "text-ink-primary"}`}>
                  {step.label}
                </div>
                <div className={`text-[11px] mt-0.5 ${activeStep === i ? "text-white/70" : "text-ink-tertiary"}`}>
                  {step.sublabel}
                </div>
              </button>
              {i < JOURNEY_STEPS.length - 1 && (
                <div className="flex items-center px-1 flex-shrink-0">
                  <ChevronRight className={`w-4 h-4 ${activeStep === i ? "text-burgundy-600" : "text-ink-tertiary/40"}`} aria-hidden />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step preview panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            id={`panel-${active.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[14px] p-6 max-w-[420px] mx-auto shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-[8px] bg-blush border border-[rgba(124,45,45,0.12)] flex items-center justify-center text-burgundy-700">
                {active.icon}
              </div>
              <div>
                <div className="text-[11px] font-mono text-ink-tertiary">Step {active.number}</div>
                <div className="text-[15px] font-bold text-ink-primary">{active.preview.title}</div>
              </div>
            </div>
            {active.preview.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
