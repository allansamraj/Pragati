"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Heart, Activity, Sparkles, Volume2, ShieldCheck, Radio } from "lucide-react";

export function AIDoctorRobotAvatar({
  isSpeaking = false,
  currentDialogue = "",
  language = "en",
  onRobotClick,
}: {
  isSpeaking?: boolean;
  currentDialogue?: string;
  language?: "en" | "mr" | "hi" | "ta";
  onRobotClick?: () => void;
}) {
  const [blink, setBlink] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<"center" | "left" | "right">("center");

  // Natural eye blinking & looking around
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);

    const lookInterval = setInterval(() => {
      const dirs: Array<"center" | "left" | "right"> = ["center", "left", "right", "center"];
      setEyeDirection(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 4500);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
    };
  }, []);

  return (
    <div
      onClick={onRobotClick}
      className="relative flex flex-col items-center justify-center select-none cursor-pointer group"
    >
      {/* ── AMBIENT HOLOGRAPHIC GLOW & SCAN RINGS ── */}
      <div className="absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full bg-gradient-to-r from-burgundy-600/20 via-rose-600/15 to-emerald-600/15 blur-2xl pointer-events-none animate-pulse" />

      {/* Floating Holographic Telemetry Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full border border-rose-500/20 border-dashed pointer-events-none"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72 rounded-full border border-emerald-500/15 border-dotted pointer-events-none hidden sm:block"
      />

      {/* Floating Holographic Clinical HUD Pills */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 sm:-top-5 -left-4 sm:left-4 z-20 bg-black/60 backdrop-blur-md border border-emerald-500/30 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white shadow-lg"
      >
        <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
        <span>ECG: <strong>Normal Sinus (74 bpm)</strong></span>
      </motion.div>

      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 sm:-top-5 -right-4 sm:right-4 z-20 bg-black/60 backdrop-blur-md border border-rose-500/30 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white shadow-lg"
      >
        <ShieldCheck className="w-3 h-3 text-rose-400" />
        <span>Cath Lab: <strong>Prepared · Dr. Rao</strong></span>
      </motion.div>

      {/* ── 3D HUMANOID AI DOCTOR ROBOT CHARACTER ── */}
      <motion.div
        animate={{
          y: [-3, 3, -3],
          rotate: isSpeaking ? [-0.5, 0.5, -0.5] : [0, 0, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* ROBOT HEAD */}
        <div className="relative w-32 h-30 sm:w-36 sm:h-34 bg-gradient-to-b from-[#FAF7F5] via-[#E8E0DC] to-[#D5CBC7] rounded-[44px] border-2 border-white/90 shadow-2xl p-2 flex flex-col items-center justify-center">
          {/* Top Medical Cross Antenna / Sensor */}
          <div className="absolute -top-3 flex items-center justify-center">
            <div className="w-6 h-3 bg-burgundy-700 rounded-full border border-white/40 flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Robot Ears / Side Audio Sensors */}
          <div className="absolute -left-2.5 top-10 w-3 h-7 bg-[#B8ABA6] rounded-l-full border border-white/40 shadow-inner flex items-center justify-center">
            <span className="w-1 h-3 bg-rose-500/60 rounded-full" />
          </div>
          <div className="absolute -right-2.5 top-10 w-3 h-7 bg-[#B8ABA6] rounded-r-full border border-white/40 shadow-inner flex items-center justify-center">
            <span className="w-1 h-3 bg-rose-500/60 rounded-full" />
          </div>

          {/* VISOR FACE SCREEN */}
          <div className="relative w-[108px] h-[82px] sm:w-[120px] sm:h-[90px] bg-[#120D0C] rounded-[32px] border-2 border-[#3D2C28] p-2 flex flex-col items-center justify-between shadow-inner overflow-hidden">
            {/* Subtle screen scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

            {/* Top Status Light */}
            <div className="flex items-center gap-1 opacity-70">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[7.5px] font-mono tracking-widest text-emerald-300 uppercase">PRAGATI-MD</span>
            </div>

            {/* GLOWING ANIMATED EYES */}
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

            {/* ANIMATED TALKING MOUTH / SOUNDWAVE EQUALIZER */}
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

        {/* ROBOT NECK CONNECTOR */}
        <div className="w-8 h-2.5 bg-[#8E7E7A] rounded-xs -my-0.5 z-0 shadow-inner" />

        {/* ROBOT TORSO & DOCTOR WHITE COAT */}
        <div className="relative w-44 sm:w-52 h-24 sm:h-28 bg-gradient-to-b from-[#FDFBFB] to-[#EDE5E2] rounded-t-[36px] rounded-b-[20px] border-2 border-white shadow-2xl p-2.5 flex flex-col items-center justify-between overflow-hidden">
          {/* Doctor Coat Lapels */}
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

          {/* Glowing Doctor Badge */}
          <div className="relative z-10 flex items-center gap-1 bg-[#1A1210] border border-white/20 rounded-full px-2.5 py-0.5 text-[8.5px] font-bold text-white shadow-sm mt-auto mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="tracking-wider uppercase text-rose-300">PRAGATI AI CLINICAL BOT</span>
          </div>
        </div>
      </motion.div>

      {/* ── SPEECH BUBBLE / SUBTITLE HUD ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 mt-3 max-w-[90%] sm:max-w-[85%] bg-black/75 backdrop-blur-md border border-white/20 rounded-[14px] p-3 text-center shadow-2xl"
      >
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-0.5">
          <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
          <span>AI Doctor Speaking Live ({language.toUpperCase()})</span>
        </div>
        <p className="text-[12.5px] sm:text-[13px] text-white font-medium leading-relaxed">
          &ldquo;{currentDialogue || "Hello Arjun! I'm PRAGATI AI Care. I'm here to explain your upcoming Coronary Angiogram and answer any questions."}&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
