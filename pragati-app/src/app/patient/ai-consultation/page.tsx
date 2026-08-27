"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, User, Activity,
  FileText, Share2, ShieldCheck, AlertTriangle, CheckCircle2,
  Clock, ArrowRight, Sparkles, MessageSquare, Volume2, VolumeX,
  ChevronRight, HelpCircle, Check, X, ShieldAlert, Bot, Stethoscope,
  Info, AlertCircle, Phone, Calendar, Building2, Radio, Camera,
  Send
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { consentService, ConsentSessionData } from "@/lib/ai/consentService";
import { avatarService, AvatarState } from "@/lib/ai/avatarService";
import { speechService, SupportedLanguage } from "@/lib/ai/speechService";
import { conversationService, ConversationTurn } from "@/lib/ai/conversationService";
import { AIDoctorAvatar } from "@/components/ai/AIDoctorAvatar";

type ConsultationStep = "OVERVIEW" | "QUESTIONS" | "UNDERSTANDING" | "CONSENT" | "REVIEW";

type PagePhase =
  | "PRE_SESSION"
  | "DISCLOSURE_NOTICE"
  | "VIDEO_SESSION"
  | "DECLINED_VIEW"
  | "CLINICIAN_ESCALATED"
  | "EMERGENCY_STATE";

export default function AIConsultationPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [phase, setPhase] = useState<PagePhase>("PRE_SESSION");
  const [step, setStep] = useState<ConsultationStep>("OVERVIEW");
  const [session, setSession] = useState<ConsentSessionData>(consentService.getSession());
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");

  // Call & Hardware State
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [avatarState, setAvatarState] = useState<AvatarState>("READY");
  const [currentDialogue, setCurrentDialogue] = useState(
    "Hello. I'm PRAGATI AI Care. I'll help explain the information related to your upcoming care and answer questions using the information provided by your healthcare team."
  );

  // Session elapsed timer
  const [sessionSeconds, setSessionSeconds] = useState(512); // ~ 00:08:32
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  // Video & Audio Stream Refs
  const patientVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Understanding Quiz
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  // Conversation Transcript History
  const [transcript, setTranscript] = useState<ConversationTurn[]>([
    {
      id: "turn-0",
      sender: "assistant",
      text: "Hello. I'm PRAGATI AI Care. I'll help explain the information related to your upcoming care and answer questions using the information provided by your healthcare team.",
      timestamp: "10:30 AM",
    },
  ]);
  const [textInput, setTextInput] = useState("");
  const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(3);

  useEffect(() => {
    setSession(consentService.getSession());
  }, [phase]);

  // Session elapsed timer
  useEffect(() => {
    if (phase !== "VIDEO_SESSION") return;
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ── WEBCAM FEED MANAGEMENT ──
  useEffect(() => {
    if (phase === "VIDEO_SESSION" && videoOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [phase, videoOn]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 360, height: 240 },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (patientVideoRef.current) {
          patientVideoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      }
    } catch {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // ── REAL-TIME SPEECH LISTENING ──
  useEffect(() => {
    if (phase !== "VIDEO_SESSION" || !micOn || avatarState === "SPEAKING") {
      speechService.stopListening();
      if (avatarState === "LISTENING") setAvatarState("READY");
      return;
    }

    speechService.startListening(selectedLanguage, {
      onTranscript: (spokenText, isFinal) => {
        setAvatarState("LISTENING");
        if (isFinal && spokenText.trim().length > 2) {
          handlePatientQuery(spokenText.trim());
        }
      },
      onStateChange: (listening) => {
        if (listening) setAvatarState("LISTENING");
      },
      onError: () => {
        if (avatarState === "LISTENING") setAvatarState("READY");
      },
    });

    return () => {
      speechService.stopListening();
    };
  }, [phase, micOn, avatarState, selectedLanguage]);

  // ── SPEECH PROCESSING PIPELINE ──
  const handlePatientQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // 1. Log patient turn in transcript
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      sender: "patient",
      text: queryText,
      timestamp: nowTime,
    };
    setTranscript((prev) => [...prev, newTurn]);
    setQuestionsAnsweredCount((prev) => prev + 1);

    // 2. Set State to THINKING
    setAvatarState("THINKING");

    // 3. Process via clinical conversation service
    const result = await conversationService.processQuery(queryText, selectedLanguage);

    if (result.isEmergency) {
      setAvatarState("EMERGENCY");
      setPhase("EMERGENCY_STATE");
      speakDoctorDialogue(result.response);
      return;
    }

    if (result.isEscalation) {
      setAvatarState("ESCALATION");
      speakDoctorDialogue(result.response, () => {
        setPhase("CLINICIAN_ESCALATED");
      });
      return;
    }

    // 4. Doctor Responds
    setTimeout(() => {
      const doctorTurn: ConversationTurn = {
        id: `turn-${Date.now() + 1}`,
        sender: "assistant",
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setTranscript((prev) => [...prev, doctorTurn]);
      speakDoctorDialogue(result.response);
    }, 400);
  };

  const speakDoctorDialogue = (text: string, onFinish?: () => void) => {
    setCurrentDialogue(text);
    setAvatarState("SPEAKING");

    if (!ttsEnabled) {
      setTimeout(() => {
        setAvatarState("READY");
        if (onFinish) onFinish();
      }, 3500);
      return;
    }

    speechService.speak(
      text,
      selectedLanguage,
      () => setAvatarState("SPEAKING"),
      () => {
        setAvatarState("READY");
        if (onFinish) onFinish();
      }
    );
  };

  const handleStartSession = () => {
    consentService.addAuditEntry("Patient Accepted AI Disclosure", "Informed AI consultation notice acknowledged by patient.", "PATIENT");
    setPhase("VIDEO_SESSION");
    setStep("OVERVIEW");

    const welcome =
      selectedLanguage === "mr"
        ? "नमस्कार. मी प्रगती एआय केअर आहे. आपल्या नियोजित काळजीची माहिती समजावून सांगण्यासाठी मी येथे उपस्थित आहे."
        : selectedLanguage === "hi"
        ? "नमस्ते। मैं प्रगति एआई केयर हूँ। आपकी आगामी चिकित्सा की जानकारी समझाने के लिए मैं यहाँ उपस्थित हूँ।"
        : selectedLanguage === "ta"
        ? "வணக்கம். நான் பிரகதி AI கேர். உங்கள் சிகிச்சை பற்றிய தகவல்களை விளக்க நான் இங்கே இருக்கிறேன்."
        : "Hello. I'm PRAGATI AI Care. I'll help explain the information related to your upcoming care and answer questions using the information provided by your healthcare team.";

    speakDoctorDialogue(welcome);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === 1) {
      setQuizSubmitted(true);
      setQuizError(false);
      consentService.addAuditEntry("Understanding Check Completed", "Patient correctly identified procedure purpose (Score: 100%).", "PATIENT");
      speakDoctorDialogue("Excellent. Your understanding is verified. Would you like to continue to the consent declaration step?", () => {
        setStep("CONSENT");
      });
    } else {
      setQuizError(true);
      speakDoctorDialogue("That's okay. Let me explain that again. The coronary angiogram is a diagnostic imaging procedure to visualize heart arteries.");
    }
  };

  const handleConsentDecision = (decision: "CONSENTED" | "DECLINED" | "CLINICIAN_ESCALATED") => {
    if (decision === "CONSENTED") {
      const updated = consentService.recordConsent("CONSENTED");
      setSession(updated);
      setStep("REVIEW");
      speakDoctorDialogue("Your consent response has been recorded and submitted for clinician review.");
    } else if (decision === "DECLINED") {
      consentService.recordConsent("DECLINED");
      setPhase("DECLINED_VIEW");
      speakDoctorDialogue("No consent has been recorded for this care.");
    } else {
      consentService.recordConsent("CLINICIAN_ESCALATED");
      setPhase("CLINICIAN_ESCALATED");
      speakDoctorDialogue("Connecting you to Dr. Ananya Rao.");
    }
  };

  const handleEscalateToClinician = () => {
    consentService.recordConsent("CLINICIAN_ESCALATED");
    setPhase("CLINICIAN_ESCALATED");
    speakDoctorDialogue("Connecting you to the supervising healthcare team.");
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-4">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between bg-surface border border-[rgba(124,45,45,0.08)] rounded-[12px] px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-burgundy-700 flex items-center justify-center text-white font-extrabold text-[12px]">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[13.5px] text-ink-primary">PRAGATI AI CARE</span>
              <span className="text-[9.5px] font-semibold text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] rounded px-1.5 py-0.2 uppercase">
                AI HEALTHCARE ASSISTANT
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Doctor Online</span>
          </div>

          <div className="text-[11px] font-mono text-ink-tertiary bg-bg border border-[rgba(124,45,45,0.08)] rounded-[6px] px-2.5 py-0.5">
            {formatTimer(sessionSeconds)}
          </div>
        </div>
      </div>

      {/* ── STAGE 1: PRE-CONSULTATION SCREEN ── */}
      {phase === "PRE_SESSION" && (
        <div className="max-w-[680px] mx-auto bg-surface border border-[rgba(124,45,45,0.1)] rounded-[16px] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[rgba(124,45,45,0.08)] pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-burgundy-700 block mb-0.5">
                Upcoming AI Care Session
              </span>
              <h2 className="text-[19px] font-bold text-ink-primary">
                {session.procedureName}
              </h2>
            </div>
            <span className="text-[10.5px] font-bold text-available-600 bg-available-50 border border-available-200 rounded px-2 py-0.5">
              ● Ready
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12.5px] bg-bg rounded-[10px] p-3.5 border border-[rgba(124,45,45,0.06)]">
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Patient</span>
              <span className="font-semibold text-ink-primary">{session.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Department</span>
              <span className="font-semibold text-ink-primary">{session.department}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Supervising Clinician</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> {session.supervisingClinician}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-tertiary block">Scheduled</span>
              <span className="font-semibold text-ink-primary flex items-center gap-1">
                <Calendar className="w-3 h-3 text-burgundy-600" /> {session.scheduledDate} · {session.scheduledTime}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blush/60 border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[12px] text-ink-secondary leading-relaxed">
            <strong className="text-burgundy-800">Purpose:</strong> Procedure / treatment explanation and informed consent workflow.
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPhase("DISCLOSURE_NOTICE")}
              className="flex-1 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[8px] text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            >
              Join Consultation <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/patient/appointments"
              className="px-4 py-2.5 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] text-ink-primary rounded-[8px] text-[12.5px] font-medium transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* ── STAGE 2: CONSENT NOTICE BEFORE VIDEO ── */}
      {phase === "DISCLOSURE_NOTICE" && (
        <div className="max-w-[620px] mx-auto bg-surface border border-[rgba(124,45,45,0.12)] rounded-[16px] p-6 shadow-xs space-y-5">
          <div className="w-10 h-10 rounded-full bg-blush border border-[rgba(124,45,45,0.15)] flex items-center justify-center text-burgundy-700">
            <ShieldAlert className="w-5 h-5 text-burgundy-700" />
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-ink-primary">
              AI Care Consultation Notice
            </h2>
            <p className="text-[13px] text-ink-secondary mt-1 leading-relaxed">
              &ldquo;PRAGATI AI Care provides information and assists with the consent workflow. It does not replace a qualified healthcare professional.&rdquo;
            </p>
          </div>

          {/* Preferred Language Picker */}
          <div>
            <label className="block text-[12px] font-semibold text-ink-primary mb-1.5">
              Consultation Language:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { code: "en", label: "English" },
                { code: "mr", label: "मराठी" },
                { code: "hi", label: "हिन्दी" },
                { code: "ta", label: "தமிழ்" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code as any)}
                  className={`py-1.5 rounded-[6px] text-[11.5px] font-bold border transition-all cursor-pointer ${
                    selectedLanguage === lang.code
                      ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                      : "bg-bg text-ink-secondary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-blush/40 border border-[rgba(124,45,45,0.12)] rounded-[8px] cursor-pointer">
            <input
              type="checkbox"
              checked={disclosureAccepted}
              onChange={(e) => setDisclosureAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-burgundy-700 focus:ring-burgundy-600 mt-0.5"
            />
            <span className="text-[12px] font-semibold text-ink-primary leading-snug">
              I understand that this session uses an AI assistant.
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!disclosureAccepted}
              onClick={handleStartSession}
              className="flex-1 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 disabled:opacity-50 text-white rounded-[8px] text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            >
              Continue →
            </button>
            <button
              type="button"
              onClick={() => setPhase("PRE_SESSION")}
              className="px-4 py-2.5 bg-bg hover:bg-blush text-ink-secondary rounded-[8px] text-[12px] font-medium"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 3: REDESIGNED PREMIUM TELEMEDICINE INTERFACE ── */}
      {phase === "VIDEO_SESSION" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* ── LEFT 70%: AI DOCTOR VIDEO & CONVERSATION ── */}
          <div className="space-y-3">
            {/* 1. AI Doctor Video Stage */}
            <div className="relative rounded-[16px] overflow-hidden border border-[rgba(124,45,45,0.15)] bg-[#0C1116] shadow-sm">
              <AIDoctorAvatar
                avatarState={avatarState}
                onAvatarClick={() => handlePatientQuery("Can you explain the procedure in simple terms?")}
              />

              {/* 2. Patient Video Preview (Bottom Left of Video) ~180x120px */}
              <div className="absolute bottom-3 left-3 w-[150px] sm:w-[170px] h-[100px] sm:h-[115px] bg-[#161210] border border-white/30 rounded-[12px] overflow-hidden shadow-md flex flex-col items-center justify-center z-30">
                {videoOn ? (
                  <>
                    <video
                      ref={patientVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                    />
                    {!cameraActive && (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-white">
                        <div className="w-6 h-6 rounded-full bg-burgundy-700 flex items-center justify-center text-[10px] font-bold mb-1">
                          AD
                        </div>
                        <span className="text-[9.5px] font-bold truncate max-w-[110px]">Demo Patient</span>
                        <span className="text-[7.5px] text-emerald-400 font-semibold">Camera Live</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-white/60">
                    <User className="w-5 h-5 mb-0.5 text-ink-tertiary" />
                    <span className="text-[8.5px]">Camera Paused</span>
                  </div>
                )}

                <div className="absolute bottom-1 left-1 right-1 bg-black/70 rounded-[4px] px-1.5 py-0.5 flex items-center justify-between text-[7.5px] text-white">
                  <span className="truncate font-semibold">You</span>
                  <span className="text-emerald-400 font-bold">● Live</span>
                </div>
              </div>
            </div>

            {/* 3. Bottom Controls Bar */}
            <div className="bg-surface border border-[rgba(124,45,45,0.08)] rounded-[12px] p-2.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMicOn(!micOn)}
                  className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    micOn
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-critical-600 hover:bg-critical-700 text-white"
                  }`}
                  title={micOn ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{micOn ? "Mic ON" : "Muted"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoOn(!videoOn)}
                  className={`p-2 rounded-[8px] text-ink-secondary hover:text-ink-primary hover:bg-bg border border-[rgba(124,45,45,0.1)] transition-colors cursor-pointer ${
                    !videoOn ? "bg-critical-50 text-critical-600" : ""
                  }`}
                  title={videoOn ? "Turn Camera Off" : "Turn Camera On"}
                >
                  {videoOn ? <Camera className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-2 rounded-[8px] text-ink-secondary hover:text-ink-primary hover:bg-bg border border-[rgba(124,45,45,0.1)] transition-colors cursor-pointer ${
                    !ttsEnabled ? "bg-amber-50 text-amber-700" : ""
                  }`}
                  title="Toggle Audio Speech Voice"
                >
                  {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTranscriptOpen(!transcriptOpen)}
                  className={`px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium border border-[rgba(124,45,45,0.1)] transition-colors cursor-pointer ${
                    transcriptOpen ? "bg-blush text-burgundy-800" : "bg-bg text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  <span>Transcript</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEscalateToClinician}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-[8px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Stethoscope className="w-3 h-3" /> Connect to Clinician
                </button>

                <button
                  type="button"
                  onClick={() => setPhase("PRE_SESSION")}
                  className="px-3 py-1.5 bg-critical-600 hover:bg-critical-700 text-white text-[11.5px] font-bold rounded-[8px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-3 h-3" /> End Consultation
                </button>
              </div>
            </div>

            {/* 4. Clean Conversation Area Below Video */}
            <div className="bg-surface border border-[rgba(124,45,45,0.08)] rounded-[12px] p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-burgundy-700 flex items-center justify-center text-white text-[9.5px] font-bold flex-shrink-0 mt-0.5">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-700 block">
                    AI DOCTOR
                  </span>
                  <p className="text-[12.5px] text-ink-primary leading-relaxed mt-0.5">
                    &ldquo;{currentDialogue}&rdquo;
                  </p>
                </div>
              </div>

              {/* Input row */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePatientQuery(textInput);
                      setTextInput("");
                    }
                  }}
                  placeholder="Ask PRAGATI AI Care..."
                  className="flex-1 h-9 px-3 bg-bg border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[12px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    handlePatientQuery(textInput);
                    setTextInput("");
                  }}
                  className="h-9 px-3 bg-burgundy-700 text-white rounded-[8px] text-[11.5px] font-bold hover:bg-burgundy-800 flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>

              {/* 3 subtle suggestion chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] font-bold text-ink-tertiary">Quick Questions:</span>
                {[
                  "What is planned?",
                  "Common risks?",
                  "Hospital recovery?",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handlePatientQuery(q)}
                    className="text-[10.5px] font-medium bg-bg hover:bg-blush border border-[rgba(124,45,45,0.1)] text-ink-secondary rounded-full px-2.5 py-0.5 cursor-pointer transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible Transcript Drawer */}
            {transcriptOpen && (
              <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[12px] p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-[rgba(124,45,45,0.06)] pb-1.5">
                  <span className="text-[10.5px] font-bold uppercase text-burgundy-700">Transcript History</span>
                  <button
                    type="button"
                    onClick={() => setTranscriptOpen(false)}
                    className="text-[10px] text-ink-tertiary hover:text-ink-primary"
                  >
                    Hide
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 text-[11.5px]">
                  {transcript.map((t) => (
                    <div
                      key={t.id}
                      className={`p-2 rounded-[6px] ${
                        t.sender === "patient"
                          ? "bg-blush/60 text-burgundy-900 border border-[rgba(124,45,45,0.08)]"
                          : "bg-bg text-ink-primary border border-[rgba(124,45,45,0.06)]"
                      }`}
                    >
                      <span className="text-[9.5px] font-bold text-ink-tertiary block mb-0.5">
                        {t.sender === "patient" ? "PATIENT" : "AI DOCTOR"} · {t.timestamp}
                      </span>
                      <div>{t.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT 30%: COMPACT PROGRESSIVE CONSULTATION PANEL ── */}
          <div className="bg-surface border border-[rgba(124,45,45,0.1)] rounded-[16px] overflow-hidden flex flex-col h-full min-h-[520px] shadow-2xs">
            {/* Step Tabs */}
            <div className="flex border-b border-[rgba(124,45,45,0.08)] bg-bg">
              {[
                { id: "OVERVIEW", label: "Overview" },
                { id: "QUESTIONS", label: "Questions" },
                { id: "UNDERSTANDING", label: "Understanding" },
                { id: "CONSENT", label: "Consent" },
                { id: "REVIEW", label: "Audit" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStep(t.id as any)}
                  className={`flex-1 py-2.5 text-[11px] font-bold border-b-2 transition-colors cursor-pointer ${
                    step === t.id
                      ? "border-burgundy-700 text-burgundy-700 bg-surface"
                      : "border-transparent text-ink-tertiary hover:text-ink-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Panel Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-[12px]">
              {/* STEP 1: COMPACT OVERVIEW */}
              {step === "OVERVIEW" && (
                <div className="space-y-3">
                  {/* Compact Consultation Context Box */}
                  <div className="bg-bg rounded-[10px] p-3 border border-[rgba(124,45,45,0.06)] space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-burgundy-700">
                      CARDIOLOGY
                    </div>
                    <div className="font-bold text-[13px] text-ink-primary">
                      Care Explanation: Diagnostic Coronary Angiogram
                    </div>
                    <div className="text-[11.5px] text-ink-secondary pt-0.5 space-y-1">
                      <div>Supervising clinician: <strong className="text-ink-primary">Dr. Ananya Rao</strong></div>
                      <div>Consent status: <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded text-[10px]">Not started</span></div>
                      <div>Questions: <strong className="text-ink-primary">{questionsAnsweredCount} answered</strong></div>
                    </div>
                  </div>

                  {/* Compact Procedural Highlights */}
                  <div className="text-[11.5px] text-ink-secondary space-y-1.5 bg-blush/30 p-2.5 rounded-[8px] border border-[rgba(124,45,45,0.08)]">
                    <div>• <strong>Planned:</strong> Catheter contrast X-ray mapping</div>
                    <div>• <strong>Duration:</strong> 30–45 mins under local anesthesia</div>
                    <div>• <strong>Recovery:</strong> Daycare 4–6h observation</div>
                    <div>• <strong>Risks:</strong> Mild wrist bruising (3-5%)</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("UNDERSTANDING")}
                    className="w-full py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white font-bold rounded-[8px] text-[11.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    Proceed to Understanding Check <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 2: QUESTIONS */}
              {step === "QUESTIONS" && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold uppercase text-ink-tertiary block">
                    Common Questions &amp; Answers
                  </span>
                  <div className="space-y-2 text-[11.5px]">
                    <div className="p-2.5 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.06)]">
                      <span className="font-bold text-ink-primary block">Will I feel pain?</span>
                      <span className="text-ink-secondary mt-0.5 block">Local numbing medicine is applied at the wrist site so you will not feel sharp pain.</span>
                    </div>
                    <div className="p-2.5 bg-bg rounded-[8px] border border-[rgba(124,45,45,0.06)]">
                      <span className="font-bold text-ink-primary block">When can I go home?</span>
                      <span className="text-ink-secondary mt-0.5 block">After 4-6 hours in the observation ward, most patients are discharged the same day.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("UNDERSTANDING")}
                    className="w-full py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white font-bold rounded-[8px] text-[11.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    Continue to Understanding Check <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 3: UNDERSTANDING CHECK */}
              {step === "UNDERSTANDING" && (
                <div className="space-y-3 p-3 bg-bg rounded-[10px] border border-[rgba(124,45,45,0.08)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-700 block">
                    Understanding Check
                  </span>
                  <p className="text-[12px] text-ink-primary font-medium">
                    What is the main purpose of the procedure discussed?
                  </p>

                  <div className="space-y-1.5">
                    {[
                      "To surgically replace the heart valve",
                      "To visualize heart arteries using X-ray dye and assess blood flow",
                      "To prescribe routine medication",
                    ].map((option, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAnswer(idx)}
                        className={`w-full p-2.5 rounded-[6px] text-left text-[11px] border transition-all cursor-pointer ${
                          selectedAnswer === idx
                            ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs font-semibold"
                            : "bg-surface text-ink-primary border-[rgba(124,45,45,0.1)] hover:bg-blush"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {quizError && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[10.5px] text-amber-800">
                      That&apos;s okay. Let me explain that again. The angiogram is a diagnostic imaging procedure to visualize heart arteries.
                    </div>
                  )}

                  {quizSubmitted && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[10.5px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Understanding Verified!
                    </div>
                  )}

                  {!quizSubmitted && (
                    <button
                      type="button"
                      disabled={selectedAnswer === null}
                      onClick={handleQuizSubmit}
                      className="w-full py-2 bg-burgundy-700 hover:bg-burgundy-800 disabled:opacity-50 text-white font-bold rounded-[6px] text-[11.5px] cursor-pointer"
                    >
                      Verify Understanding
                    </button>
                  )}
                </div>
              )}

              {/* STEP 4: INFORMED CONSENT */}
              {step === "CONSENT" && (
                <div className="space-y-3">
                  <div className="p-2.5 bg-blush/60 border border-[rgba(124,45,45,0.12)] rounded-[8px]">
                    <span className="text-[9.5px] uppercase font-bold text-burgundy-700 block">Informed Consent</span>
                    <div className="text-[12px] font-bold text-ink-primary mt-0.5">
                      {session.procedureName}
                    </div>
                  </div>

                  <label className="flex items-start gap-2 p-2.5 bg-bg border border-[rgba(124,45,45,0.1)] rounded-[8px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentAcknowledged}
                      onChange={(e) => setConsentAcknowledged(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-burgundy-700 focus:ring-burgundy-600 mt-0.5"
                    />
                    <span className="text-[11px] font-medium text-ink-primary leading-snug">
                      I have received information about the proposed care, understand that I may ask questions, and understand that I can decline or request discussion with a healthcare professional.
                    </span>
                  </label>

                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      disabled={!consentAcknowledged}
                      onClick={() => handleConsentDecision("CONSENTED")}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-[6px] text-[11.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" /> I Consent
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConsentDecision("DECLINED")}
                      className="w-full py-1.5 bg-bg hover:bg-rose-50 border border-[rgba(124,45,45,0.12)] text-critical-600 font-semibold rounded-[6px] text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> I Do Not Consent
                    </button>

                    <button
                      type="button"
                      onClick={handleEscalateToClinician}
                      className="w-full py-1.5 bg-blush border border-[rgba(124,45,45,0.1)] text-burgundy-700 font-bold rounded-[6px] text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Stethoscope className="w-3 h-3" /> Speak to Clinician
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW / AUDIT RECORD */}
              {step === "REVIEW" && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] space-y-2">
                    <div className="font-bold text-[12px] text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Consent Recorded
                    </div>
                    <div className="text-[10.5px] text-emerald-900 space-y-0.5 font-mono">
                      <div>Session: <strong>{session.sessionId}</strong></div>
                      <div>Date: <strong>30 Aug 2026 · 10:34 AM</strong></div>
                      <div>Status: <span className="font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">PENDING REVIEW</span></div>
                    </div>
                  </div>

                  <Link
                    href="/patient/records"
                    className="block w-full py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white text-center font-bold rounded-[6px] text-[11.5px] transition-colors"
                  >
                    View in Health Records →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 4: CLINICIAN ESCALATION ── */}
      {phase === "CLINICIAN_ESCALATED" && (
        <div className="max-w-[620px] mx-auto bg-surface border border-emerald-200 rounded-[16px] p-6 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <Stethoscope className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-[19px] font-bold text-ink-primary">
              Connecting You to Dr. Ananya Rao
            </h2>
            <p className="text-[12.5px] text-ink-secondary mt-1 max-w-[420px] mx-auto">
              Request sent. Status: Waiting for clinician.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              href="/patient/teleconsult"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[8px] text-[12px] shadow-2xs flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" /> Open Teleconsult Room
            </Link>
            <button
              type="button"
              onClick={() => setPhase("VIDEO_SESSION")}
              className="px-4 py-2.5 bg-bg hover:bg-blush text-ink-secondary rounded-[8px] text-[11.5px] font-medium"
            >
              Return to AI Session
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 5: DECLINED CONSENT ── */}
      {phase === "DECLINED_VIEW" && (
        <div className="max-w-[620px] mx-auto bg-surface border border-rose-200 rounded-[16px] p-6 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
            <X className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-[19px] font-bold text-ink-primary">
              No consent has been recorded for this care.
            </h2>
            <p className="text-[12.5px] text-ink-secondary mt-1 max-w-[420px] mx-auto">
              Your decision has been noted. Your healthcare team will discuss alternative care pathways with you.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleEscalateToClinician}
              className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-white font-bold rounded-[8px] text-[12px]"
            >
              Speak to Clinician
            </button>
            <Link
              href="/patient/dashboard"
              className="px-4 py-2 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] text-ink-primary rounded-[8px] text-[11.5px] font-medium"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* ── STAGE 6: EMERGENCY PROTOCOL ── */}
      {phase === "EMERGENCY_STATE" && (
        <div className="max-w-[620px] mx-auto bg-critical-50 border-2 border-critical-400 rounded-[16px] p-6 text-center space-y-4 shadow-md">
          <div className="w-12 h-12 rounded-full bg-critical-100 border border-critical-300 flex items-center justify-center text-critical-700 mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-[19px] font-black text-critical-950">
              URGENT MEDICAL ATTENTION MAY BE REQUIRED
            </h2>
            <p className="text-[12.5px] text-critical-900 mt-1 max-w-[420px] mx-auto">
              Please do not wait. Immediate emergency medical evaluation is strongly recommended.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <a
              href="tel:108"
              className="py-2.5 bg-critical-600 hover:bg-critical-700 text-white font-black rounded-[8px] text-[12px] flex items-center justify-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> CALL 108
            </a>
            <Link
              href="/patient/find-care?specialty=emergency"
              className="py-2.5 bg-white hover:bg-critical-50 border border-critical-300 text-critical-900 font-bold rounded-[8px] text-[11.5px] flex items-center justify-center gap-1"
            >
              Find Emergency Care
            </Link>
            <button
              type="button"
              onClick={handleEscalateToClinician}
              className="py-2.5 bg-white hover:bg-critical-50 border border-critical-300 text-critical-900 font-bold rounded-[8px] text-[11.5px] flex items-center justify-center gap-1"
            >
              Talk to Clinician
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
