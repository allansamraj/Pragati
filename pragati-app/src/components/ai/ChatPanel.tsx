"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X, Send, Mic, MicOff, RefreshCw, Sparkles, Globe,
  ShieldCheck, ArrowRight, User, Stethoscope, Pill, Building2,
  Volume2, VolumeX, AlertCircle, Radio, Check
} from "lucide-react";
import { ChatMessage, UserRole, AssistantLanguage } from "@/lib/ai/types";
import { aiService } from "@/lib/ai/aiService";
import { getAssistantConfig } from "@/lib/ai/roleContext";
import { Message } from "./Message";
import { QuickActions } from "./QuickActions";

export function ChatPanel({
  role,
  onClose,
}: {
  role: UserRole;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<AssistantLanguage>("en");
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState<number[]>([40, 60, 30, 75, 50, 65, 35]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionInstanceRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const config = getAssistantConfig(role);

  // Load conversation history on role change
  useEffect(() => {
    const history = aiService.getHistory(role);
    setMessages(history);
  }, [role]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isListening]);

  // Clean up audio & recognition on unmount
  useEffect(() => {
    return () => {
      stopVoiceCapture();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech (TTS) Voice Readout Function
  const speakResponse = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, "").replace(/\n+/g, ". ");
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const langCodeMap: Record<AssistantLanguage, string> = {
        en: "en-IN",
        mr: "mr-IN",
        hi: "hi-IN",
        ta: "ta-IN",
      };
      utterance.lang = langCodeMap[language] || "en-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS playback failed:", err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    stopVoiceCapture();

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      role,
      language,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue("");
    setLiveTranscript("");
    setLoading(true);

    try {
      const response = await aiService.sendMessage(text, role, language);
      const updatedHistory = [...newHistory, response];
      setMessages(updatedHistory);
      aiService.saveHistory(role, updatedHistory);

      if (ttsEnabled && response.text) {
        speakResponse(response.text);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    stopVoiceCapture();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    aiService.clearHistory(role);
    setMessages(aiService.getHistory(role));
  };

  // ── ON-DEMAND REAL-TIME VOICE RECOGNITION ──
  const startVoiceCapture = async () => {
    setIsListening(true);
    setLiveTranscript("");

    // Simulate animated waveform while listening
    const interval = setInterval(() => {
      setVoiceVolume([
        Math.floor(Math.random() * 60 + 20),
        Math.floor(Math.random() * 80 + 20),
        Math.floor(Math.random() * 95 + 10),
        Math.floor(Math.random() * 70 + 30),
        Math.floor(Math.random() * 85 + 15),
        Math.floor(Math.random() * 60 + 25),
        Math.floor(Math.random() * 50 + 20),
      ]);
    }, 120);

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;

        const langMap: Record<AssistantLanguage, string> = {
          en: "en-IN",
          mr: "mr-IN",
          hi: "hi-IN",
          ta: "ta-IN",
        };
        recognition.lang = langMap[language] || "en-IN";

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join("");
          setLiveTranscript(transcript);
          setInputValue(transcript);

          if (event.results[0]?.isFinal) {
            clearInterval(interval);
            setIsListening(false);
            setTimeout(() => {
              handleSend(transcript);
            }, 500);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Web Speech API note:", e.error);
        };

        recognition.onend = () => {
          clearInterval(interval);
          setIsListening(false);
        };

        recognitionInstanceRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn("Direct SpeechRecognition start failed:", err);
      }
    }

    // Interactive fallback: if speech recognition ends or unsupported, give user preset options
  };

  const stopVoiceCapture = () => {
    setIsListening(false);
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {}
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopVoiceCapture();
      if (liveTranscript.trim()) {
        handleSend(liveTranscript);
      }
    } else {
      startVoiceCapture();
    }
  };

  const toggleTTS = () => {
    if (ttsEnabled) {
      setTtsEnabled(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      setTtsEnabled(true);
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender === "assistant") {
          speakResponse(lastMsg.text);
        }
      }
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "doctor":
        return <Stethoscope className="w-4 h-4 text-emerald-300" />;
      case "provider":
        return <Pill className="w-4 h-4 text-amber-300" />;
      case "government":
        return <Building2 className="w-4 h-4 text-blue-300" />;
      case "patient":
      default:
        return <Sparkles className="w-4 h-4 text-rose-300" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F5] text-ink-primary select-text relative">
      {/* ── HEADER ── */}
      <header className="bg-[#170E0D] border-b border-white/10 text-white p-3 px-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <div className="w-8 h-8 rounded-[8px] bg-burgundy-700/80 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-sm">
            {getRoleIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[13.5px] text-white tracking-tight leading-none">
                {config.assistantName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
              <span className="uppercase tracking-wider font-extrabold text-rose-300 bg-white/10 px-1.5 py-0.2 rounded">
                {config.badgeLabel}
              </span>
              <span className="text-white/30">·</span>
              <span className="text-emerald-400/90 font-medium">Voice Enabled</span>
            </div>
          </div>
        </div>

        {/* Header Actions: TTS Speaker + Language Picker + Clear + Close */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={toggleTTS}
            className={`w-6.5 h-6.5 rounded-[5px] flex items-center justify-center transition-colors cursor-pointer ${
              ttsEnabled
                ? "bg-rose-600 text-white shadow-xs"
                : "hover:bg-white/10 text-white/60 hover:text-white"
            }`}
            title={ttsEnabled ? "Disable Voice Output" : "Enable Voice Output"}
            aria-label="Toggle Text to Speech"
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AssistantLanguage)}
              aria-label="Select Assistant Language"
              className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-[5px] text-white text-[10.5px] font-semibold py-0.5 px-1.5 focus:outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer appearance-none pr-4.5"
            >
              <option value="en" className="bg-[#170E0D] text-white">EN</option>
              <option value="mr" className="bg-[#170E0D] text-white">मराठी</option>
              <option value="hi" className="bg-[#170E0D] text-white">हिन्दी</option>
              <option value="ta" className="bg-[#170E0D] text-white">தமிழ்</option>
            </select>
            <Globe className="w-2.5 h-2.5 text-white/60 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="w-6.5 h-6.5 rounded-[5px] hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-6.5 h-6.5 rounded-[5px] hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-0.5"
            title="Close Assistant"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── MESSAGE STREAM ── */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 min-h-0 bg-gradient-to-b from-[#FFFDFC] to-[#FAF7F5]">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} onPromptSelect={(p) => handleSend(p)} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-[12px] text-ink-tertiary my-3">
            <div className="w-6 h-6 rounded-[6px] bg-[#1A1210] flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3 text-rose-300 animate-spin" />
            </div>
            <span className="italic">PRAGATI Assist is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── LIVE INTERACTIVE VOICE RECORDING OVERLAY ── */}
      {isListening && (
        <div className="absolute inset-x-3 bottom-20 bg-[#1A1210] text-white border border-rose-500/40 rounded-[18px] p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[12.5px] font-bold text-rose-300">Live Voice Input ({language.toUpperCase()})</span>
            </div>
            <button
              type="button"
              onClick={stopVoiceCapture}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated Voice Level Equalizer */}
          <div className="flex items-center justify-center gap-1.5 h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 my-2">
            {voiceVolume.map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-rose-500 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(8, h * 0.4)}px` }}
              />
            ))}
          </div>

          {/* Live Transcript / Prompt display */}
          <div className="text-[13px] text-white font-medium text-center my-2 min-h-[24px]">
            {liveTranscript ? (
              <span className="text-white italic">&ldquo;{liveTranscript}&rdquo;</span>
            ) : (
              <span className="text-white/70">Listening to your voice... Speak your question now</span>
            )}
          </div>

          {/* Direct Tap Voice Presets */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5 justify-center">
            {(role === "doctor"
              ? ["Who is next in queue?", "Summarize patient #42", "Show cardiology queue"]
              : role === "provider"
              ? ["Which medicines are low in stock?", "Update ECG availability", "Request resupply"]
              : role === "government"
              ? ["Which districts have access gaps?", "Why is Nandurbar flagged?", "Show shortage report"]
              : [
                  "Find a cardiologist near me",
                  "Where am I in the queue?",
                  "When is my next appointment?",
                  "Show my active prescriptions",
                ]
            ).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  stopVoiceCapture();
                  handleSend(sample);
                }}
                className="text-[11px] bg-white/10 hover:bg-rose-600/80 border border-white/15 text-white rounded-full px-2.5 py-1 transition-all cursor-pointer"
              >
                🎤 &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                if (liveTranscript.trim()) {
                  handleSend(liveTranscript);
                } else {
                  stopVoiceCapture();
                }
              }}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-[8px] text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Send Spoken Query
            </button>
            <button
              type="button"
              onClick={stopVoiceCapture}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-[8px] text-[12px] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS CHIPS ── */}
      <div className="border-t border-[rgba(124,45,45,0.08)] bg-surface/80 backdrop-blur-sm px-3">
        <QuickActions
          actions={config.suggestedActions}
          onSelect={(actionText) => handleSend(actionText)}
        />
      </div>

      {/* ── INPUT FORM WITH VOICE BUTTON ── */}
      <div className="p-3 bg-surface border-t border-[rgba(124,45,45,0.1)] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                role === "doctor"
                  ? "Ask about OPD queue, patients, or prescriptions..."
                  : role === "provider"
                  ? "Ask about medicine stock, labs, or resupply..."
                  : role === "government"
                  ? "Ask about district gaps, shortages, or workload..."
                  : "Ask or speak your symptoms, doctors, or tokens..."
              }
              className="w-full h-10 pl-3 pr-10 rounded-[10px] bg-bg border border-[rgba(124,45,45,0.15)] text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600/20 transition-all shadow-2xs"
            />

            {/* Clickable Voice Mic Button inside input */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all cursor-pointer ${
                isListening
                  ? "text-white bg-rose-600 shadow-md ring-4 ring-rose-200 scale-110 animate-pulse"
                  : "text-ink-tertiary hover:text-burgundy-700 hover:bg-blush"
              }`}
              title="Click to Activate Voice Assistant"
              aria-label="Activate Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="h-10 px-3.5 bg-burgundy-700 hover:bg-burgundy-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-[10px] font-bold flex items-center justify-center transition-colors shadow-2xs cursor-pointer flex-shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Healthcare Disclaimer */}
        <div className="text-[9.5px] text-ink-tertiary text-center mt-2 leading-tight">
          PRAGATI Assist provides informational &amp; workflow navigation support. It does not replace professional medical judgement.
        </div>
      </div>
    </div>
  );
}
