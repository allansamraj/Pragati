"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Activity, Video, FileText, CheckCircle2,
  Clock, ArrowRight, Stethoscope, AlertTriangle, Sparkles,
  PhoneCall, Heart, User, ChevronRight
} from "lucide-react";
import { useLocationContext } from "@/lib/context/LocationContext";

export default function DoctorDashboard() {
  const { doctorLocation } = useLocationContext();
  const [currentServing, setCurrentServing] = useState(41);
  const [calledNext, setCalledNext] = useState(false);

  const handleCallNext = () => {
    setCurrentServing((c) => c + 1);
    setCalledNext(true);
    setTimeout(() => setCalledNext(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1240px]">
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
              OPD Active · {doctorLocation.room}
            </span>
            <span className="text-[12px] text-ink-tertiary">Morning Shift: 09:00 AM – 02:00 PM</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">
            Welcome, {doctorLocation.doctorName}
          </h1>
          <p className="text-[13px] text-ink-secondary mt-0.5">
            Senior Interventional Cardiologist · {doctorLocation.facilityName}, {doctorLocation.state}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/doctor/teleconsult"
            className="flex items-center gap-2 px-4 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[10px] text-[13px] font-bold transition-all shadow-xs"
          >
            <Video className="w-4 h-4" />
            <span>Join Peripheral Teleconsult Hub</span>
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's OPD Queue", value: "24 Patients", sub: "6 Waiting · 18 Completed", color: "text-ink-primary" },
          { label: "Now In Consultation", value: `Token #${currentServing}`, sub: "Arun Sundaram (54y, Chennai)", color: "text-emerald-600" },
          { label: "Avg Consult Time", value: "11 mins", sub: "Within standard 15m", color: "text-ink-primary" },
          { label: "Teleconsult Requests", value: "2 Pending", sub: "Triplicane & Suburban UPHC Hubs", color: "text-burgundy-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">{stat.label}</div>
            <div className={`text-[24px] font-extrabold font-mono mt-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-[11.5px] text-ink-secondary mt-0.5 font-medium">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Active Consultation (Left) + Queue List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-6">
        {/* Left: Active Consultation Pad */}
        <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(124,45,45,0.08)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-[14px]">
                AS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-ink-primary">Arun Sundaram</h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Token #{currentServing}
                  </span>
                </div>
                <div className="text-[12px] text-ink-tertiary">54y · Male · ABHA: 77-8923-4512-6734 · Chennai, Tamil Nadu</div>
              </div>
            </div>

            <button
              onClick={handleCallNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] text-[12.5px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              {calledNext ? "Calling Next..." : "Call Next Patient"}
            </button>
          </div>

          {/* Vitals Summary */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-bg border border-[rgba(124,45,45,0.08)] rounded-[10px]">
            <div>
              <div className="text-[10px] uppercase font-bold text-ink-tertiary">Heart Rate</div>
              <div className="text-[15px] font-bold text-ink-primary font-mono mt-0.5">74 bpm (Sinus)</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-ink-tertiary">Blood Pressure</div>
              <div className="text-[15px] font-bold text-ink-primary font-mono mt-0.5">120/80 mmHg</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-ink-tertiary">SpO2</div>
              <div className="text-[15px] font-bold text-emerald-600 font-mono mt-0.5">98% Normal</div>
            </div>
          </div>

          {/* Chief Complaints & Clinical Notes */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-ink-primary uppercase tracking-wider block">
              Chief Complaints &amp; Clinical Findings
            </label>
            <textarea
              defaultValue="Patient from Chennai reports mild exertional chest discomfort for past 3 days. 12-Lead ECG shows normal sinus rhythm. Advised Metoprolol 50mg, Aspirin 75mg, and 30-day follow-up."
              rows={3}
              className="w-full p-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[10px] text-[13px] text-ink-primary focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/doctor/consultation"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] text-[13px] font-bold transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4" /> Full Consultation &amp; Issue E-Rx
            </Link>
            <Link
              href="/doctor/patients"
              className="px-4 py-2.5 bg-surface border border-[rgba(124,45,45,0.15)] hover:bg-blush text-ink-primary rounded-[9px] text-[13px] font-semibold transition-colors"
            >
              View ABHA Records
            </Link>
          </div>
        </div>

        {/* Right: Live OPD Waiting Queue */}
        <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-ink-primary">Live OPD Queue</h3>
              <p className="text-[11.5px] text-ink-tertiary">Cardiology Department · {doctorLocation.facilityName}</p>
            </div>
            <Link href="/doctor/queue" className="text-[12px] font-bold text-emerald-700 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              { token: 42, name: "Sundari Karthikeyan", age: "48y", status: "Next in line", priority: "Urgent", wait: "Est. 5 min", loc: "Triplicane" },
              { token: 43, name: "Ganesan Palanisamy", age: "62y", status: "Waiting", priority: "Routine", wait: "Est. 15 min", loc: "Royapettah" },
              { token: 44, name: "Anjalai Shanmugam", age: "39y", status: "Waiting", priority: "Routine", wait: "Est. 25 min", loc: "Park Town" },
              { token: 45, name: "Ramesh Govindarajan", age: "55y", status: "Waiting", priority: "Urgent", wait: "Est. 35 min", loc: "Teynampet" },
            ].map((p) => (
              <div
                key={p.token}
                className="flex items-center justify-between p-3 rounded-[10px] bg-bg border border-[rgba(124,45,45,0.06)] hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[8px] bg-white border border-[rgba(124,45,45,0.12)] font-mono font-bold text-[13px] flex items-center justify-center text-ink-primary">
                    #{p.token}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-ink-primary">{p.name}</div>
                    <div className="text-[11px] text-ink-tertiary">{p.age} · {p.loc} · {p.priority}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    p.status === "Next in line"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-white text-ink-secondary border border-[rgba(124,45,45,0.1)]"
                  }`}>
                    {p.status}
                  </span>
                  <div className="text-[10px] text-ink-tertiary mt-0.5">{p.wait}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
