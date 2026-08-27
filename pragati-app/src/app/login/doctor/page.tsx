"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Stethoscope, Eye, EyeOff, Sparkles,
  Building2, Users, Activity, Video, FileText, User, Pill
} from "lucide-react";
import { authService } from "@/lib/auth/authService";
import { DEMO_CREDENTIALS } from "@/lib/auth/types";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.doctor.email);
    setPassword(DEMO_CREDENTIALS.doctor.password);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authService.login(email, password, "doctor");
      if (result.success) {
        router.push("/doctor/dashboard");
      } else {
        setError(result.error ?? "Invalid Doctor Registration ID or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-38px)] bg-[#F8F6F4] flex flex-col lg:flex-row">
      {/* ── LEFT: High-Contrast Doctor Clinical Console ── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-[#161210] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 text-white">
        {/* Subtle glowing gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-burgundy-700 rounded-[8px] flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md group-hover:scale-105 transition-transform">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[16px] font-extrabold text-white tracking-tight leading-none">PRAGATI</div>
              <div className="text-[10px] font-bold text-emerald-300 tracking-wider leading-none mt-1">DOCTOR CLINICAL CONSOLE</div>
            </div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 my-8 lg:my-0"
        >
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 rounded-full px-3 py-1 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Licensed Medical Practitioner Access
          </div>

          <h1 className="text-[32px] sm:text-[38px] font-extrabold text-white leading-[1.15] tracking-tight">
            <span className="text-white">Doctor Clinical</span><br />
            <span className="text-emerald-400">Consultation Workspace</span>
          </h1>

          <p className="text-[15px] text-slate-200 mt-4 leading-relaxed max-w-[420px] font-normal" style={{ color: '#E2E8F0' }}>
            Call waiting OPD patients, conduct PRAGATI teleconsultations with remote rural PHCs, write digital e-prescriptions, and review longitudinal clinical records.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Users, label: "Live OPD Token Call System (#41 → #42)", color: "#34D399" },
              { icon: Video, label: "PRAGATI Telemedicine (Rural Hub-and-Spoke)", color: "#22D3EE" },
              { icon: FileText, label: "1-Click Digital E-Prescription & Vitals Sync", color: "#FBBF24" },
              { icon: Activity, label: "Doctor Availability Schedule & On-Duty Status", color: "#FB7185" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-[10px] p-3 backdrop-blur-md">
                <div className="w-7 h-7 rounded-[7px] bg-white/10 flex items-center justify-center flex-shrink-0" style={{ color: item.color }}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-semibold text-white" style={{ color: '#FFFFFF' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11.5px] text-slate-300" style={{ color: '#CBD5E1' }}>
          <span className="flex items-center gap-1.5 font-bold text-emerald-400" style={{ color: '#34D399' }}>
            <ShieldCheck className="w-4 h-4" /> Medical Council Verified & Registered
          </span>
          <span className="text-slate-400 font-medium">Government General Hospital, Chennai</span>
        </div>
      </div>

      {/* ── RIGHT: Doctor Sign-in Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full max-w-[420px] space-y-6"
        >
          {/* Doctor Profile Badge */}
          <div className="flex items-center gap-3 p-3 bg-surface border border-[rgba(124,45,45,0.12)] rounded-[12px] shadow-2xs">
            <div className="w-9 h-9 rounded-[9px] bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-700">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-ink-primary">Dr. Ananya Natarajan · Cardiologist</div>
              <div className="text-[11px] text-ink-tertiary">Government General Hospital, Chennai · Dept of Cardiology</div>
            </div>
          </div>

          <div>
            <h2 className="text-[26px] font-extrabold text-ink-primary tracking-tight">Doctor Sign In</h2>
            <p className="text-[14px] text-ink-secondary mt-1">
              Access your clinical consultation pad and live OPD queue.
            </p>
          </div>

          {/* 1-Click Demo Fill */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full flex items-center gap-3 p-3.5 rounded-[12px] bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[8px] bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-bold text-emerald-900">Use Demo Doctor Account</div>
              <div className="text-[11px] text-emerald-700 truncate font-mono">doctor@pragati.demo · Dr. Ananya Natarajan</div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-ink-primary mb-1.5">
                Doctor Registration Email or MCI ID
              </label>
              <input
                id="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@pragati.demo"
                className="w-full h-11 px-4 rounded-[10px] bg-surface border border-[rgba(124,45,45,0.15)] text-[14px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[13px] font-bold text-ink-primary">
                  Password
                </label>
                <button type="button" className="text-[12px] text-emerald-700 hover:underline font-semibold">
                  OTP Sign-in
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter clinical password"
                  className="w-full h-11 px-4 pr-11 rounded-[10px] bg-surface border border-[rgba(124,45,45,0.15)] text-[14px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-tertiary hover:text-ink-secondary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-[14.5px] font-bold rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Consultation Pad <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick links to other portals */}
          <div className="pt-2 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-center gap-3 text-[12px] text-ink-tertiary flex-wrap">
            <Link href="/login/patient" className="hover:text-burgundy-700 font-semibold flex items-center gap-1">
              <User className="w-3 h-3" /> Patient
            </Link>
            <span>·</span>
            <Link href="/login/provider" className="hover:text-burgundy-700 font-semibold flex items-center gap-1">
              <Pill className="w-3 h-3" /> Provider / Pharmacy
            </Link>
            <span>·</span>
            <Link href="/login/government" className="hover:text-burgundy-700 font-semibold flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Government
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
