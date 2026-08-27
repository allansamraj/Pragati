"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, User, Activity,
  FileText, Share2, ShieldCheck, CheckCircle2, Clock
} from "lucide-react";

export default function DoctorTeleconsultPage() {
  const [inCall, setInCall] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"vitals" | "notes" | "rx">("vitals");
  const [callDuration, setCallDuration] = useState(185);

  useEffect(() => {
    if (!inCall) return;
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [inCall]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
              PRAGATI Rural Teleconsultation Line
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          <h1 className="text-[18px] font-bold text-ink-primary">
            Triplicane UPHC Spoke <span className="text-emerald-700 font-mono">⟷</span> Government General Hospital, Chennai (Cardiology)
          </h1>
          <p className="text-[12px] text-ink-secondary mt-0.5">
            Patient: <strong className="text-ink-primary">Arjun Deshmukh (54y, Male, Chennai)</strong> · Assisted by Community Health Worker
          </p>
        </div>

        <div className="text-center bg-bg border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3.5 py-1.5 font-mono text-[14px] font-bold text-ink-primary">
          {formatTime(callDuration)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        {/* Left: Video Streams */}
        <div className="space-y-4">
          <div className="relative bg-[#1A1210] rounded-[16px] overflow-hidden border border-white/10 aspect-[16/10] flex items-center justify-center">
            {/* Patient Remote Feed */}
            {videoOn ? (
              <div className="relative w-full h-full bg-gradient-to-b from-[#221715] to-[#120B0A] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-burgundy-700/40 border-2 border-burgundy-600 flex items-center justify-center text-white mb-3 shadow-lg">
                  <User className="w-12 h-12 text-rose-300" />
                </div>
                <div className="text-[16px] font-bold text-white">Arjun Deshmukh (54y)</div>
                <div className="text-[12px] text-white/70">Connected from Dhadgaon Rural Primary Health Centre, Nandurbar</div>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-[11px] text-white/80">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Live Digital Stethoscope &amp; ECG Synced
                </div>
              </div>
            ) : (
              <div className="text-center text-white/50 p-6">
                <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-[13px]">Camera disabled (Audio-only stream)</p>
              </div>
            )}

            {/* Doctor Self Floating PIP Window */}
            <div className="absolute bottom-4 right-4 w-36 h-28 sm:w-44 sm:h-32 bg-[#2D1F1C] border-2 border-white/20 rounded-[12px] overflow-hidden shadow-xl flex flex-col items-center justify-center p-2 text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[11px] font-bold mb-1">
                AR
              </div>
              <div className="text-[11px] font-bold text-white truncate max-w-[120px]">Dr. Ananya Rao</div>
              <div className="text-[9px] text-white/60">Nandurbar District Civil OPD</div>
            </div>

            {/* Floating Live Vitals HUD */}
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              <div className="bg-black/70 backdrop-blur-sm border border-white/15 rounded-[8px] px-2.5 py-1 text-white flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>HR: <strong>74 bpm</strong></span>
              </div>
              <div className="bg-black/70 backdrop-blur-sm border border-white/15 rounded-[8px] px-2.5 py-1 text-white flex items-center gap-1.5 text-[11px]">
                <span>BP: <strong>120/80</strong></span>
              </div>
              <div className="bg-black/70 backdrop-blur-sm border border-white/15 rounded-[8px] px-2.5 py-1 text-white flex items-center gap-1.5 text-[11px]">
                <span>SpO2: <strong>98%</strong></span>
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-white border border-[rgba(124,45,45,0.1)] rounded-[12px] p-3 flex items-center justify-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-full transition-colors ${
                micOn ? "bg-bg text-ink-primary hover:bg-blush border border-[rgba(124,45,45,0.15)]" : "bg-rose-50 text-rose-600 border border-rose-200"
              }`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full transition-colors ${
                videoOn ? "bg-bg text-ink-primary hover:bg-blush border border-[rgba(124,45,45,0.15)]" : "bg-rose-50 text-rose-600 border border-rose-200"
              }`}
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <Link
              href="/doctor/dashboard"
              className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[13px] flex items-center gap-2 transition-colors shadow-xs"
            >
              <PhoneOff className="w-4 h-4" /> End Teleconsultation
            </Link>
          </div>
        </div>

        {/* Right: Tele-Prescription Panel */}
        <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[16px] overflow-hidden flex flex-col h-[520px] shadow-2xs">
          <div className="p-4 border-b border-[rgba(124,45,45,0.08)] bg-bg">
            <div className="text-[13px] font-bold text-ink-primary">Live Clinical Notes &amp; Rx</div>
            <div className="text-[11px] text-ink-tertiary">Real-time sync to Dhadgaon PHC tablet</div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-[11.5px] font-bold text-ink-primary uppercase tracking-wider block">
                Doctor Advice &amp; Instructions
              </label>
              <textarea
                defaultValue="Advise patient Arjun Deshmukh to take Metoprolol 50mg regularly. Dhadgaon PHC nurse to re-check BP in 1 week. If symptoms worsen, transfer to Nandurbar Civil Hospital."
                rows={4}
                className="w-full p-2.5 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[12.5px] text-ink-primary focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-[rgba(124,45,45,0.06)]">
              <div className="text-[12px] font-bold text-ink-primary">E-Prescription Items</div>
              <div className="p-2.5 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.07)] text-[12px]">
                <div className="font-bold text-ink-primary">Metoprolol Succinate 50mg</div>
                <div className="text-[11px] text-ink-secondary">1 Tab / Day · 30 Days</div>
              </div>
              <div className="p-2.5 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.07)] text-[12px]">
                <div className="font-bold text-ink-primary">Aspirin 75mg</div>
                <div className="text-[11px] text-ink-secondary">1 Tab / Day · 30 Days</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-bg border-t border-[rgba(124,45,45,0.08)]">
            <button
              onClick={() => alert("Digital prescription transmitted instantly to Dhadgaon Rural PHC pharmacy.")}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] text-[12.5px] font-bold transition-colors cursor-pointer"
            >
              Sign &amp; Transmit Rx to Dhadgaon PHC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
