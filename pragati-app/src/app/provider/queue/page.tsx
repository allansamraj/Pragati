"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, Filter, Search, ChevronRight } from "lucide-react";

const SPECIALTIES = ["All Doctors", "Cardiology", "Paediatrics", "General Medicine", "Gynaecology"];

const FULL_QUEUE = [
  { token: 41, name: "Arjun Deshmukh",    age: 54, specialty: "Cardiology",        abha: "77-8923", status: "active",    wait: 0 },
  { token: 42, name: "Sunita Kulkarni",   age: 48, specialty: "Cardiology",        abha: "62-4411", status: "waiting",   wait: 5 },
  { token: 43, name: "Ganesh Patil",      age: 62, specialty: "Cardiology",        abha: "91-2234", status: "waiting",   wait: 10 },
  { token: 44, name: "Anjali Shinde",     age: 39, specialty: "Cardiology",        abha: "55-6723", status: "waiting",   wait: 15 },
  { token: 45, name: "Mohammed Salim",    age: 38, specialty: "Cardiology",        abha: "44-8891", status: "waiting",   wait: 20 },
  { token: 46, name: "Sarla Deshmukh",    age: 60, specialty: "Cardiology",        abha: "33-5512", status: "waiting",   wait: 25 },
  { token: 47, name: "Suresh Gaikwad",    age: 42, specialty: "Cardiology",        abha: "22-9980", status: "waiting",   wait: 30 },
  { token: 48, name: "Pooja Chavan",      age: 28, specialty: "Paediatrics",       abha: "11-3345", status: "waiting",   wait: 15 },
  { token: 49, name: "Vinod More",        age: 55, specialty: "General Medicine",  abha: "88-7712", status: "waiting",   wait: 12 },
];

export default function QueuePage() {
  const [filter, setFilter] = useState("All Doctors");
  const [nowServing, setNowServing] = useState(41);

  const filtered = FULL_QUEUE.filter((p) => filter === "All Doctors" || p.specialty === filter);
  const nextPatient = filtered.find((p) => p.token > nowServing && p.status === "waiting");

  return (
    <div className="max-w-[900px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-1">Provider</p>
          <h1 className="text-[24px] font-bold text-ink-primary" style={{ letterSpacing: "-0.02em" }}>OPD Queue Management</h1>
        </div>
        <div className="text-center bg-surface border border-[rgba(124,45,45,0.1)] rounded-[10px] px-4 py-2.5">
          <div className="text-[10px] uppercase tracking-widest text-ink-tertiary">Now Serving</div>
          <div className="text-[28px] font-bold font-mono text-burgundy-700 leading-none">#{nowServing}</div>
        </div>
      </div>

      {/* Call next */}
      <div className="flex items-center gap-3 p-4 bg-surface border border-[rgba(124,45,45,0.1)] rounded-[12px]">
        <div className="flex-1">
          {nextPatient ? (
            <>
              <div className="text-[12px] text-ink-tertiary">Next patient</div>
              <div className="text-[15px] font-bold text-ink-primary">{nextPatient.name} · <span className="font-mono">#{nextPatient.token}</span></div>
              <div className="text-[12px] text-ink-secondary">{nextPatient.age}y · {nextPatient.specialty} · ABHA: {nextPatient.abha}</div>
            </>
          ) : (
            <div className="text-[14px] text-ink-tertiary">Queue is empty for the selected filter.</div>
          )}
        </div>
        <button
          onClick={() => nextPatient && setNowServing(nextPatient.token)}
          disabled={!nextPatient}
          className="flex items-center gap-2 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserCheck className="w-4 h-4" aria-hidden />
          Call Next Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-ink-tertiary" aria-hidden />
        {SPECIALTIES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-[7px] transition-colors ${filter === s ? "bg-burgundy-700 text-white" : "bg-surface border border-[rgba(124,45,45,0.1)] text-ink-secondary hover:bg-blush"}`}
          >{s}</button>
        ))}
      </div>

      {/* Queue table */}
      <div className="bg-surface border border-[rgba(124,45,45,0.09)] rounded-[14px] overflow-hidden">
        <div className="divide-y divide-[rgba(124,45,45,0.05)]">
          {filtered.map((p) => {
            const isActive = p.token === nowServing;
            const isDone = p.token < nowServing;
            return (
              <div key={p.token} className={`flex items-center gap-4 px-5 py-3.5 ${isActive ? "bg-available-50/60" : isDone ? "opacity-40" : ""}`}>
                <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center font-mono font-bold text-[12px] flex-shrink-0 ${
                  isActive ? "bg-available-500 text-white" : isDone ? "bg-surface-2 border border-[rgba(124,45,45,0.07)] text-ink-tertiary" : "bg-blush border border-[rgba(124,45,45,0.12)] text-burgundy-700"
                }`}>#{p.token}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink-primary">{p.name}</div>
                  <div className="text-[11px] text-ink-tertiary">{p.age}y · {p.specialty} · ABHA: {p.abha}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isActive ? (
                    <span className="text-[11px] font-bold text-available-600 bg-available-50 border border-available-100 rounded px-2 py-0.5">In Consultation</span>
                  ) : isDone ? (
                    <span className="text-[11px] text-ink-tertiary">Done</span>
                  ) : (
                    <span className="text-[11px] text-ink-tertiary">~{p.wait} min</span>
                  )}
                  <Link href={`/provider/patients?token=${p.token}`} className="text-[11px] font-semibold text-burgundy-700 hover:underline flex items-center gap-0.5">
                    Profile <ChevronRight className="w-3 h-3" aria-hidden />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
