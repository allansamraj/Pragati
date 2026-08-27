"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Activity, Sparkles, Volume2, ShieldCheck, Heart, Radio, Mic, Bot } from "lucide-react";
import { AvatarState } from "@/lib/ai/avatarService";

export function AIDoctorAvatar({
  avatarState = "READY",
  onAvatarClick,
}: {
  avatarState?: AvatarState;
  onAvatarClick?: () => void;
}) {
  const isSpeaking = avatarState === "SPEAKING";
  const isListening = avatarState === "LISTENING";
  const isThinking = avatarState === "THINKING";

  const [blink, setBlink] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<"center" | "left" | "right">("center");

  // Natural blinking & looking around
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3400);

    const lookInterval = setInterval(() => {
      const dirs: Array<"center" | "left" | "right"> = ["center", "left", "right", "center"];
      setEyeDirection(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 4000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
    };
  }, []);

  return (
    <div
      onClick={onAvatarClick}
      className="relative w-full h-full min-h-[460px] sm:min-h-[500px] lg:min-h-[530px] rounded-[16px] overflow-hidden select-none cursor-pointer flex flex-col justify-between p-4 shadow-md bg-[#0C1218]"
    >
      {/* ── 1. HIGH-TECH CLINICAL ROOM ENVIRONMENT ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#182430] via-[#101A24] to-[#0A1016] overflow-hidden pointer-events-none">
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* Floating Concentric Telemetry Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-cyan-500/15 border-dashed pointer-events-none"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-76 sm:h-76 rounded-full border border-rose-500/10 border-dotted pointer-events-none"
        />

        {/* Cardiac Monitor Display on Left Wall */}
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-emerald-500/30 rounded-[8px] px-2.5 py-1.5 hidden sm:flex items-center gap-2 text-white text-[10px] shadow-sm">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-300">ECG: <strong>74 bpm</strong></span>
          <span className="font-mono text-cyan-300 pl-1.5 border-l border-white/20">SpO2: <strong>99%</strong></span>
        </div>

        {/* Cath Lab Ready on Right Wall */}
        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md border border-white/15 rounded-[8px] px-2.5 py-1.5 hidden sm:flex items-center gap-1.5 text-white text-[10px] shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>Cath Lab: <strong className="text-rose-300">Prepared</strong></span>
        </div>
      </div>

      {/* ── 2. SUBTLE IDENTITY LABEL (TOP-LEFT) ── */}
      <div className="relative z-20 self-start bg-black/75 backdrop-blur-md border border-white/15 rounded-[8px] px-3 py-1.5 text-white shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-tight">PRAGATI AI CARE</span>
          <span className="text-[9px] text-white/70 font-semibold uppercase tracking-wider pl-1 border-l border-white/20">
            AI DOCTOR ROBOT
          </span>
        </div>
        <div className="text-[9.5px] text-white/75 mt-0.5 flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
          <span>Supervised by Dr. Ananya Rao</span>
        </div>
      </div>

      {/* ── 3. ANIMATED 3D AI DOCTOR ROBOT CHARACTER (TALKING LIVE) ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto">
        <motion.div
          animate={{
            y: isSpeaking ? [-4, 4, -4] : isListening ? [-2, 2, -2] : [-3, 3, -3],
            rotate: isListening ? -1.5 : isSpeaking ? [-0.8, 0.8, -0.8] : [0, 0, 0],
          }}
          transition={{
            duration: isSpeaking ? 1.4 : isListening ? 2.8 : 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex flex-col items-center"
        >
          {/* ROBOT HEAD */}
          <div className="relative w-32 h-30 sm:w-36 sm:h-34 bg-gradient-to-b from-[#FAF7F5] via-[#E8E0DC] to-[#D5CBC7] rounded-[44px] border-2 border-white/90 shadow-2xl p-2 flex flex-col items-center justify-center">
            {/* Top Medical Cross Sensor */}
            <div className="absolute -top-3 flex items-center justify-center">
              <div className="w-6 h-3 bg-burgundy-700 rounded-full border border-white/40 flex items-center justify-center shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Robot Side Ears */}
            <div className="absolute -left-2.5 top-10 w-3 h-7 bg-[#B8ABA6] rounded-l-full border border-white/40 shadow-inner flex items-center justify-center">
              <span className="w-1 h-3 bg-rose-500/60 rounded-full" />
            </div>
            <div className="absolute -right-2.5 top-10 w-3 h-7 bg-[#B8ABA6] rounded-r-full border border-white/40 shadow-inner flex items-center justify-center">
              <span className="w-1 h-3 bg-rose-500/60 rounded-full" />
            </div>

            {/* VISOR FACE SCREEN */}
            <div className="relative w-[108px] h-[82px] sm:w-[120px] sm:h-[90px] bg-[#120D0C] rounded-[32px] border-2 border-[#3D2C28] p-2 flex flex-col items-center justify-between shadow-inner overflow-hidden">
              {/* Scanline texture */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

              {/* Status Header */}
              <div className="flex items-center gap-1 opacity-70">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[7.5px] font-mono tracking-widest text-emerald-300 uppercase">PRAGATI-MD</span>
              </div>

              {/* GLOWING ANIMATED LED EYES */}
              <div className="flex items-center justify-center gap-5 sm:gap-6 my-auto">
                {/* Left Eye */}
                <div
                  className={`transition-all duration-150 rounded-full flex items-center justify-center shadow-[0_0_12px_#34D399] ${
                    blink
                      ? "w-6 h-0.5 bg-emerald-400"
                      : isSpeaking
                      ? "w-5 h-6 sm:w-6 sm:h-7 bg-emerald-400 rounded-t-full"
                      : "w-5 h-6 sm:w-6 sm:h-7 bg-emerald-400"
                  }`}
                  style={{
                    transform:
                      eyeDirection === "left"
                        ? "translateX(-3px)"
                        : eyeDirection === "right"
                        ? "translateX(3px)"
                        : "translateX(0)",
                  }}
                >
                  {!blink && <div className="w-2 h-2 rounded-full bg-white opacity-80" />}
                </div>

                {/* Right Eye */}
                <div
                  className={`transition-all duration-150 rounded-full flex items-center justify-center shadow-[0_0_12px_#34D399] ${
                    blink
                      ? "w-6 h-0.5 bg-emerald-400"
                      : isSpeaking
                      ? "w-5 h-6 sm:w-6 sm:h-7 bg-emerald-400 rounded-t-full"
                      : "w-5 h-6 sm:w-6 sm:h-7 bg-emerald-400"
                  }`}
                  style={{
                    transform:
                      eyeDirection === "left"
                        ? "translateX(-3px)"
                        : eyeDirection === "right"
                        ? "translateX(3px)"
                        : "translateX(0)",
                  }}
                >
                  {!blink && <div className="w-2 h-2 rounded-full bg-white opacity-80" />}
                </div>
              </div>

              {/* ANIMATED TALKING MOUTH EQUALIZER */}
              <div className="h-3 flex items-center justify-center gap-0.5">
                {isSpeaking ? (
                  <>
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce" style={{ height: "10px", animationDelay: "0ms" }} />
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce" style={{ height: "14px", animationDelay: "120ms" }} />
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce" style={{ height: "8px", animationDelay: "240ms" }} />
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce" style={{ height: "12px", animationDelay: "360ms" }} />
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce" style={{ height: "6px", animationDelay: "180ms" }} />
                  </>
                ) : (
                  <div className="w-6 h-1 bg-rose-400/80 rounded-full shadow-[0_0_6px_#FB7185]" />
                )}
              </div>
            </div>
          </div>

          {/* NECK CONNECTOR */}
          <div className="w-8 h-2.5 bg-[#8E7E7A] rounded-xs -my-0.5 z-0 shadow-inner" />

          {/* ROBOT TORSO & DOCTOR LAB COAT */}
          <div className="relative w-44 sm:w-52 h-24 sm:h-28 bg-gradient-to-b from-[#FDFBFB] to-[#EDE5E2] rounded-t-[36px] rounded-b-[20px] border-2 border-white shadow-2xl p-2.5 flex flex-col items-center justify-between overflow-hidden">
            {/* White Coat Lapels */}
            <div className="absolute inset-x-0 top-0 flex justify-between px-3">
              <div className="w-10 h-16 bg-gradient-to-br from-[#ECE3E0] to-[#DDD2CE] -rotate-12 rounded-bl-xl border-r border-[#CBBFB9] shadow-xs" />
              <div className="w-10 h-16 bg-gradient-to-bl from-[#ECE3E0] to-[#DDD2CE] rotate-12 rounded-br-xl border-l border-[#CBBFB9] shadow-xs" />
            </div>

            {/* Stethoscope Around Neck */}
            <div className="relative z-10 w-full flex items-center justify-center">
              <div className="w-24 h-12 border-2 border-slate-700 rounded-b-full flex items-end justify-center pb-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 border border-white flex items-center justify-center shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-burgundy-700" />
                </div>
              </div>
            </div>

            {/* Glowing Badge */}
            <div className="relative z-10 flex items-center gap-1 bg-[#1A1210] border border-white/20 rounded-full px-2.5 py-0.5 text-[8.5px] font-bold text-white shadow-sm mt-auto mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="tracking-wider uppercase text-rose-300">PRAGATI AI CLINICAL BOT</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 4. SPEECH STATE INDICATOR (BOTTOM-RIGHT) ── */}
      <div className="relative z-20 self-end mt-auto">
        <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 text-[11px] font-medium text-white flex items-center gap-2 shadow-sm">
          {isSpeaking ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-white font-medium text-[11px]">Speaking</span>
              <div className="flex items-center gap-0.5 ml-0.5">
                {[6, 12, 16, 9, 14].map((h, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: ["3px", `${h}px`, "3px"] }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      delay: i * 0.06,
                    }}
                    className="w-0.5 bg-rose-400 rounded-full"
                  />
                ))}
              </div>
            </>
          ) : isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 font-medium text-[11px]">Listening...</span>
            </>
          ) : isThinking ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
              <span className="text-amber-300 font-medium text-[11px]">Thinking...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/90 text-[11px]">Ready</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
