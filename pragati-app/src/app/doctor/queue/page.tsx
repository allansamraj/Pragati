"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, PhoneCall, CheckCircle2, Clock, Filter, ArrowRight, User } from "lucide-react";
import { useLocationContext } from "@/lib/context/LocationContext";

export default function DoctorQueuePage() {
  const { doctorLocation } = useLocationContext();
  const [servingToken, setServingToken] = useState(41);
  const [filter, setFilter] = useState<"all" | "urgent" | "waiting">("all");

  const [patients, setPatients] = useState([
    { token: 41, name: "Arun Sundaram", age: "54y", gender: "M", complaint: "Chest discomfort, hypertension (Triplicane)", priority: "urgent", status: "in-consultation", wait: "Now" },
    { token: 42, name: "Sundari Karthikeyan", age: "48y", gender: "F", complaint: "Palpitations, post-ECG review (Royapettah)", priority: "urgent", status: "waiting", wait: "5 min" },
    { token: 43, name: "Ganesan Palanisamy", age: "62y", gender: "M", complaint: "Routine cardiac medication review (Park Town)", priority: "routine", status: "waiting", wait: "15 min" },
    { token: 44, name: "Anjalai Shanmugam", age: "39y", gender: "F", complaint: "Mild dyspnea on exertion (Teynampet)", priority: "routine", status: "waiting", wait: "25 min" },
    { token: 45, name: "Ramesh Govindarajan", age: "55y", gender: "M", complaint: "Follow-up after angiography (Adyar)", priority: "urgent", status: "waiting", wait: "35 min" },
    { token: 46, name: "Poongodi Chandran", age: "51y", gender: "F", complaint: "Chest tightness, diabetic check (Anna Nagar)", priority: "urgent", status: "waiting", wait: "45 min" },
  ]);

  const callNext = () => {
    setServingToken((prev) => prev + 1);
    setPatients((list) =>
      list.map((p) =>
        p.token === servingToken + 1 ? { ...p, status: "in-consultation" } : p.token === servingToken ? { ...p, status: "completed" } : p
      )
    );
  };

  const filtered = patients.filter((p) => {
    if (filter === "urgent") return p.priority === "urgent";
    if (filter === "waiting") return p.status === "waiting";
    return true;
  });

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] p-5 shadow-2xs">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">{doctorLocation.facilityName} · OPD Queue</div>
          <h1 className="text-[22px] font-bold text-ink-primary mt-0.5">Cardiology OPD Waiting List</h1>
          <p className="text-[12px] text-ink-tertiary">Currently Serving Token #{servingToken} · Room 204</p>
        </div>

        <button
          onClick={callNext}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] text-[13px] font-bold transition-all shadow-xs cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" /> Call Next Patient (#{servingToken + 1})
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: "all", label: "All Maharashtra Patients (6)" },
          { id: "urgent", label: "Urgent Priority (4)" },
          { id: "waiting", label: "Waiting in Lobby (5)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border transition-all cursor-pointer ${
              filter === tab.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-white text-ink-secondary border-[rgba(124,45,45,0.12)] hover:bg-blush"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[12px] overflow-hidden shadow-2xs">
        <div className="divide-y divide-[rgba(124,45,45,0.06)]">
          {filtered.map((p) => {
            const isServing = p.token === servingToken;
            return (
              <div
                key={p.token}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isServing ? "bg-emerald-50/60 border-l-4 border-l-emerald-600" : "hover:bg-bg"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-[8px] bg-bg border border-[rgba(124,45,45,0.1)] flex items-center justify-center font-mono font-bold text-[14px] text-ink-primary flex-shrink-0">
                    #{p.token}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[14px] font-bold text-ink-primary">{p.name}</div>
                      <span className="text-[11px] text-ink-tertiary">({p.age} · {p.gender})</span>
                      {p.priority === "urgent" && (
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-ink-secondary mt-0.5 truncate">{p.complaint}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11.5px] font-semibold text-ink-primary">
                      {isServing ? (
                        <span className="text-emerald-700 font-bold">In Room 204</span>
                      ) : p.status === "completed" ? (
                        <span className="text-ink-tertiary">Completed</span>
                      ) : (
                        `Wait: ${p.wait}`
                      )}
                    </div>
                  </div>

                  <Link
                    href="/doctor/consultation"
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface border border-[rgba(124,45,45,0.15)] hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 text-ink-primary rounded-[8px] text-[12px] font-bold transition-colors"
                  >
                    Open Pad <ArrowRight className="w-3 h-3" />
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
