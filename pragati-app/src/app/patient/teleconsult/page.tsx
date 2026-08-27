"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, User, Activity,
  FileText, Share2, ShieldCheck, AlertTriangle, CheckCircle2,
  Clock, ArrowRight, Sparkles, MessageSquare, Volume2
} from "lucide-react";
import { useConnectivity } from "@/lib/connectivity/ConnectivityContext";
import { useLanguage } from "@/lib/i18n";

export default function TeleconsultPage() {
  const { mode } = useConnectivity();
  const { t } = useLanguage();

  const [inCall, setInCall] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"vitals" | "notes" | "rx">("vitals");
  const [callDuration, setCallDuration] = useState(142); // seconds

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
      {/* Top Breadcrumb & Hub-and-Spoke Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-2 py-0.5">
              {t("nav.teleconsult")}
            </span>
            <span className="text-[11px] text-available-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-available-500 animate-pulse" />
              {t("tele.connected")}
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-ink-primary">
            Triplicane UPHC Spoke <span className="text-burgundy-600 font-mono">⟷</span> Government General Hospital, Chennai
          </h1>
          <p className="text-[12px] text-ink-secondary mt-0.5">
            Connecting Patient <strong className="text-ink-primary">Arun Sundaram (54y, Chennai)</strong> with Specialist <strong className="text-ink-primary">Dr. Ananya Natarajan (Cardiology)</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mode === "low-data" && (
            <span className="text-[11px] font-semibold text-limited-500 bg-limited-50 border border-limited-200 rounded px-2.5 py-1">
              Audio-Optimized 2G Stream
            </span>
          )}
          <div className="text-center bg-bg border border-[rgba(124,45,45,0.1)] rounded-[8px] px-3 py-1.5 font-mono text-[14px] font-bold text-ink-primary">
            {formatTime(callDuration)}
          </div>
        </div>
      </div>

      {/* Main Video & Clinical Consultation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        {/* Left: Video Streams */}
        <div className="space-y-4">
          <div className="relative bg-[#1A1210] rounded-[16px] overflow-hidden border border-[rgba(124,45,45,0.15)] aspect-[16/10] flex items-center justify-center">
            {/* Doctor's Primary Stream */}
            {videoOn ? (
              <div className="relative w-full h-full bg-gradient-to-b from-[#2A1E1C] to-[#1A1210] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-burgundy-700/40 border-2 border-burgundy-600 flex items-center justify-center text-white mb-3 shadow-lg">
                  <User className="w-12 h-12 text-rose" />
                </div>
                <div className="text-[16px] font-bold text-white">Dr. Ananya Natarajan</div>
                <div className="text-[12px] text-white/70">Senior Cardiologist · Government General Hospital, Chennai</div>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-[11px] text-white/80">
                  <Activity className="w-3 h-3 text-available-500" />
                  HD Video Feed (PRAGATI Secure Tunnel)
                </div>
              </div>
            ) : (
              <div className="text-center text-white/50 p-6">
                <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-[13px]">Camera disabled (Audio-only mode)</p>
              </div>
            )}

            {/* Self / Patient Floating PIP Window (Bottom Right) */}
            <div className="absolute bottom-4 right-4 w-36 h-28 sm:w-44 sm:h-32 bg-[#2D1F1C] border-2 border-white/20 rounded-[12px] overflow-hidden shadow-xl flex flex-col items-center justify-center p-2 text-center">
              <div className="w-8 h-8 rounded-full bg-burgundy-700 flex items-center justify-center text-white text-[11px] font-bold mb-1">
                AS
              </div>
              <div className="text-[11px] font-bold text-white truncate max-w-[120px]">Arun Sundaram (UPHC)</div>
              <div className="text-[9px] text-white/60">Assisted by Community Health Nurse (V. Selvi)</div>
            </div>

            {/* Floating Live Vitals HUD */}
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              <div className="bg-black/60 backdrop-blur-sm border border-white/15 rounded-[8px] px-2.5 py-1 text-white flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3 h-3 text-critical-500 animate-pulse" />
                <span>HR: <strong>74 bpm</strong></span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-white/15 rounded-[8px] px-2.5 py-1 text-white flex items-center gap-1.5 text-[11px]">
                <span>BP: <strong>120/80</strong></span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-white/15 rounded-[8px] px-2.5 py-1 text-white flex items-center gap-1.5 text-[11px]">
                <span>SpO2: <strong>98%</strong></span>
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[12px] p-3 flex items-center justify-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-full transition-colors ${
                micOn ? "bg-bg text-ink-primary hover:bg-blush border border-[rgba(124,45,45,0.15)]" : "bg-critical-50 text-critical-500 border border-critical-200"
              }`}
              title={micOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-full transition-colors ${
                videoOn ? "bg-bg text-ink-primary hover:bg-blush border border-[rgba(124,45,45,0.15)]" : "bg-critical-50 text-critical-500 border border-critical-200"
              }`}
              title={videoOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <Link
              href="/patient/dashboard"
              className="px-5 py-3 rounded-full bg-critical-500 hover:bg-critical-600 text-white font-semibold text-[13px] flex items-center gap-2 transition-colors shadow-sm"
            >
              <PhoneOff className="w-4 h-4" /> {t("tele.callEnd")}
            </Link>
          </div>
        </div>

        {/* Right: Real-time Clinical Notes & Tele-Prescription Panel */}
        <div className="bg-surface border border-[rgba(124,45,45,0.09)] rounded-[16px] overflow-hidden flex flex-col h-[520px]">
          {/* Tab Navigation */}
          <div className="flex border-b border-[rgba(124,45,45,0.08)] bg-bg">
            {[
              { id: "vitals", label: t("tele.liveVitals") },
              { id: "notes", label: t("tele.notes") },
              { id: "rx", label: t("records.prescriptions") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-[12px] font-bold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-burgundy-700 text-burgundy-700 bg-surface"
                    : "border-transparent text-ink-tertiary hover:text-ink-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeTab === "vitals" && (
              <div className="space-y-3">
                <div className="p-3.5 bg-blush/60 border border-[rgba(124,45,45,0.1)] rounded-[10px]">
                  <div className="text-[11px] font-semibold text-burgundy-700 uppercase tracking-wider mb-1">
                    Hub-and-Spoke Telemedicine Assessment
                  </div>
                  <div className="text-[13px] text-ink-secondary">
                    Patient presenting with mild chest discomfort. ECG performed at Dhadgaon Rural PHC Hub transmitting to Dr. Rao.
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.07)]">
                    <span className="text-[12px] text-ink-secondary">ECG Rhythm</span>
                    <span className="text-[12px] font-bold text-available-600">Normal Sinus Rhythm</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.07)]">
                    <span className="text-[12px] text-ink-secondary">Blood Glucose (Fasting)</span>
                    <span className="text-[12px] font-bold text-ink-primary">112 mg/dL</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.07)]">
                    <span className="text-[12px] text-ink-secondary">Temperature</span>
                    <span className="text-[12px] font-bold text-ink-primary">98.4 °F</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary mb-2">
                    Care Pathway Recommendation
                  </div>
                  <div className="p-3 bg-available-50 border border-available-100 rounded-[10px] text-[12px] text-available-600 font-medium">
                    ✓ Condition stable. No emergency ambulance required. Follow-up ECG recommended in 4 weeks.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                <div className="text-[13px] text-ink-primary leading-relaxed bg-bg p-3.5 rounded-[10px] border border-[rgba(124,45,45,0.07)]">
                  &ldquo;Advised patient to maintain low sodium diet and take prescribed medication on schedule. Continue regular walk routine. In case of acute symptoms, visit District Hospital immediately.&rdquo;
                </div>
                <div className="text-[11px] text-ink-tertiary flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-available-500" />
                  Digitally signed by Dr. Ananya Rao (MMC Reg: MMC-2014-08-3921)
                </div>
              </div>
            )}

            {activeTab === "rx" && (
              <div className="space-y-3">
                <div className="border border-[rgba(124,45,45,0.1)] rounded-[10px] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-ink-primary">Metoprolol Succinate 50mg</span>
                    <span className="text-[11px] text-ink-tertiary">1 tab / day</span>
                  </div>
                  <div className="text-[11px] text-ink-secondary">Duration: 30 days · Take after morning breakfast</div>
                </div>

                <div className="border border-[rgba(124,45,45,0.1)] rounded-[10px] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-ink-primary">Aspirin (Ecosprin) 75mg</span>
                    <span className="text-[11px] text-ink-tertiary">1 tab / day</span>
                  </div>
                  <div className="text-[11px] text-ink-secondary">Duration: 30 days · Post lunch</div>
                </div>

                <Link
                  href="/patient/prescriptions"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[12px] font-semibold rounded-[8px] transition-colors"
                >
                  {t("rx.viewPdf")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Referral Escalation Action */}
          <div className="p-3.5 bg-bg border-t border-[rgba(124,45,45,0.08)]">
            <Link
              href="/patient/referrals"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-blush border border-[rgba(124,45,45,0.15)] text-burgundy-700 hover:bg-rose text-[12px] font-bold rounded-[8px] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> {t("ref.title")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
