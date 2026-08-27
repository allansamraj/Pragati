"use client";

import React from "react";
import { Share2, ArrowRight, CheckCircle2, Clock, Building2 } from "lucide-react";

export default function GovernmentReferralsPage() {
  const referrals = [
    { id: "ref-01", patient: "Arun Sundaram (54y)", from: "Government UPHC Triplicane", to: "Government General Hospital, Chennai", specialty: "Cardiology", reason: "Exertional Angina / ECG Evaluation", urgency: "High Urgency", status: "In Transit / Accepted" },
    { id: "ref-02", patient: "Meera Sundaram (32y)", from: "Royapettah Urban Clinic", to: "Omandurar Multi Super Speciality Hospital", specialty: "Obstetrics", reason: "High-Risk Antenatal Care", urgency: "Medium Urgency", status: "Confirmed Slot" },
    { id: "ref-03", patient: "Suresh Balachandran (61y)", from: "Park Town Dispensary", to: "Government Stanley Medical College Hospital", specialty: "Orthopaedics", reason: "Fracture Stabilization", urgency: "High Urgency", status: "Admitted" },
    { id: "ref-04", patient: "Poongodi Ganesan (24y)", from: "Teynampet Health Post", to: "Madras Medical College Hub", specialty: "Neurology", reason: "Seizure Workup", urgency: "Urgent", status: "Pending Tertiary Bed" },
  ];

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Hub-and-Spoke Teleconsultation &amp; Transfers</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Inter-Facility Referral Pipeline</h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Live tracking of patient transfers from primary rural health centers to secondary &amp; tertiary medical colleges</p>
      </div>

      <div className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[rgba(124,45,45,0.06)] bg-bg flex items-center justify-between">
          <span className="text-[12px] font-bold text-ink-primary">Active Referral Flow (2,184 Monitored Today)</span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            ● 98.4% Transit Confirmation Rate
          </span>
        </div>

        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {referrals.map((r) => (
            <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-ink-primary">{r.patient}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blush text-burgundy-800 border border-[rgba(124,45,45,0.12)]">
                    {r.specialty}
                  </span>
                </div>
                <div className="text-[12.5px] text-ink-secondary flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-ink-primary">{r.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-burgundy-700" />
                  <span className="font-semibold text-ink-primary">{r.to}</span>
                </div>
                <div className="text-[11.5px] text-ink-tertiary">
                  Clinical reason: {r.reason}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-[6px] inline-block">
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
