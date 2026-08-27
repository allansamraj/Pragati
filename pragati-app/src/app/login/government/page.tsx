"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Lock, Eye, EyeOff, Sparkles,
  Building2, User, Stethoscope
} from "lucide-react";
import { authService } from "@/lib/auth/authService";
import { DEMO_CREDENTIALS } from "@/lib/auth/types";

export default function GovernmentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.government.email);
    setPassword(DEMO_CREDENTIALS.government.password);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authService.login(email, password, "government");
      if (result.success) {
        router.push("/government/dashboard");
      } else {
        setError(result.error ?? "Invalid Government ID or authorization token.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-38px)] bg-[#F8F6F4] flex flex-col lg:flex-row">
      {/* ── LEFT: Sovereign Analytical Dark Console ── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-[#161210] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 text-white">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-burgundy-700 rounded-[8px] flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden>
                <rect x="14" y="6" width="4" height="20" rx="2" fill="white" />
                <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-[16px] font-extrabold text-white tracking-tight leading-none">PRAGATI</div>
              <div className="text-[10px] font-bold text-amber-300 tracking-wider leading-none mt-1">GOVERNMENT OF MAHARASHTRA</div>
            </div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 my-8 lg:my-0"
        >
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-300 bg-amber-950/80 border border-amber-500/40 rounded-full px-3 py-1 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Public Health Decision-Support System
          </div>

          <h1 className="text-[32px] sm:text-[38px] font-extrabold text-white leading-[1.15] tracking-tight">
            <span className="text-white">Maharashtra Healthcare</span><br />
            <span className="text-amber-300">Intelligence Portal</span>
          </h1>

          <p className="text-[15px] text-slate-200 mt-4 leading-relaxed max-w-[420px] font-normal" style={{ color: '#E2E8F0' }}>
            Strategic surveillance of healthcare accessibility, specialist shortages, diagnostic capacity, and cross-facility referral flows across all 36 Maharashtra districts.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { label: "District-level Accessibility Map (Nandurbar, Gadchiroli, Pune)", dotColor: "#FBBF24" },
              { label: "Real-time Specialist & Diagnostic Shortage Heatmaps", dotColor: "#F43F5E" },
              { label: "Facility Hierarchy & Workload Monitoring (PHC → Medical College)", dotColor: "#34D399" },
              { label: "Algorithmic Priority Insights & Resource Allocation Guidance", dotColor: "#22D3EE" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-[10px] p-3 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.dotColor }} />
                <span className="text-[13.5px] font-semibold text-white" style={{ color: '#FFFFFF' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="bg-white/10 border border-white/15 rounded-[10px] p-3 text-center backdrop-blur-md">
              <div className="text-[22px] font-extrabold font-mono text-white" style={{ color: '#FFFFFF' }}>1,284</div>
              <div className="text-[10.5px] text-slate-300 uppercase tracking-wider mt-0.5 font-bold" style={{ color: '#CBD5E1' }}>Facilities</div>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-[10px] p-3 text-center backdrop-blur-md">
              <div className="text-[22px] font-extrabold font-mono text-white" style={{ color: '#FFFFFF' }}>36</div>
              <div className="text-[10.5px] text-slate-300 uppercase tracking-wider mt-0.5 font-bold" style={{ color: '#CBD5E1' }}>Districts</div>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-[10px] p-3 text-center backdrop-blur-md">
              <div className="text-[22px] font-extrabold font-mono text-amber-300" style={{ color: '#FCD34D' }}>37</div>
              <div className="text-[10.5px] text-slate-300 uppercase tracking-wider mt-0.5 font-bold" style={{ color: '#CBD5E1' }}>Alerts</div>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11.5px] text-slate-300" style={{ color: '#CBD5E1' }}>
          <span className="flex items-center gap-1.5 font-bold text-amber-300" style={{ color: '#FCD34D' }}>
            <ShieldCheck className="w-4 h-4" /> Restricted Authorised Access
          </span>
          <span className="text-slate-400 font-medium">Public Health Department</span>
        </div>
      </div>

      {/* ── RIGHT: Official Government Secure Login ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full max-w-[420px] space-y-6"
        >
          {/* Security Banner */}
          <div className="flex items-center gap-2 text-[11.5px] text-ink-secondary bg-surface border border-[rgba(124,45,45,0.12)] p-2.5 rounded-[10px] shadow-2xs">
            <Lock className="w-4 h-4 text-burgundy-700 flex-shrink-0" />
            <span>Official Administrative Gateway · Audit Logged</span>
          </div>

          <div>
            <h2 className="text-[26px] font-extrabold text-ink-primary tracking-tight">Government Sign In</h2>
            <p className="text-[14px] text-ink-secondary mt-1">
              Public Health Administration &amp; Surveillance Gateway
            </p>
          </div>

          {/* Security Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {["Microsoft Entra ID", "MFA Protected", "RBAC Authority"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {badge}
              </span>
            ))}
          </div>

          {/* 1-Click Demo Fill */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full flex items-center gap-3 p-3.5 rounded-[12px] bg-gradient-to-r from-blush to-rose/30 border border-burgundy-300/40 hover:border-burgundy-600 hover:shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[8px] bg-burgundy-700 flex items-center justify-center flex-shrink-0 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-bold text-burgundy-800">Use Demo Government Account</div>
              <div className="text-[11px] text-ink-tertiary truncate font-mono">government@pragati.demo · Tamil Nadu Health Command</div>
            </div>
            <ArrowRight className="w-4 h-4 text-burgundy-700 group-hover:translate-x-1 transition-transform" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-ink-primary mb-1.5">
                Government Officer ID / Official Email
              </label>
              <input
                id="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@maharashtra.gov.in"
                className="w-full h-11 px-4 rounded-[10px] bg-surface border border-[rgba(124,45,45,0.15)] text-[14px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 focus:ring-2 focus:ring-burgundy-600/15 transition-all shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[13px] font-bold text-ink-primary">
                  Password
                </label>
                <button type="button" className="text-[12px] text-burgundy-700 hover:underline font-semibold">
                  MFA Token
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
                  placeholder="Enter administrative credentials"
                  className="w-full h-11 px-4 pr-11 rounded-[10px] bg-surface border border-[rgba(124,45,45,0.15)] text-[14px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 focus:ring-2 focus:ring-burgundy-600/15 transition-all shadow-2xs"
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
              className="w-full h-11 bg-burgundy-700 hover:bg-burgundy-800 text-white text-[14.5px] font-bold rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Secure Sign In <Lock className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[12px] text-ink-tertiary text-center leading-relaxed">
            Access restricted to authorised state health department officers. All login events are audited under state cyber security guidelines.
          </p>

          {/* Quick links to Patient and Provider */}
          <div className="pt-2 border-t border-[rgba(124,45,45,0.08)] flex items-center justify-center gap-4 text-[12px] text-ink-tertiary">
            <Link href="/login/patient" className="hover:text-burgundy-700 font-semibold flex items-center gap-1">
              <User className="w-3 h-3" /> Patient Login
            </Link>
            <span>·</span>
            <Link href="/login/provider" className="hover:text-burgundy-700 font-semibold flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Doctor Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
