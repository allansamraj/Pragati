"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Pill, Eye, EyeOff, Sparkles,
  Building2, FlaskConical, Package, Truck, Stethoscope, User
} from "lucide-react";
import { authService } from "@/lib/auth/authService";
import { DEMO_CREDENTIALS } from "@/lib/auth/types";

export default function ProviderLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.provider.email);
    setPassword(DEMO_CREDENTIALS.provider.password);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authService.login(email, password, "provider");
      if (result.success) {
        router.push("/provider/dashboard");
      } else {
        setError(result.error ?? "Invalid Pharmacy / Provider ID or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-38px)] bg-[#F8F6F4] flex flex-col lg:flex-row">
      {/* ── LEFT: High-Contrast Pharmacy & Resource Console ── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-[#161210] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 text-white">
        {/* Glowing atmospheric background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-burgundy-600/15 rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-burgundy-700 rounded-[8px] flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md group-hover:scale-105 transition-transform">
              <Pill className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[16px] font-extrabold text-white tracking-tight leading-none">PRAGATI</div>
              <div className="text-[10px] font-bold text-rose-300 tracking-wider leading-none mt-1">PHARMACY &amp; FACILITY PORTAL</div>
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
            Central Pharmacy &amp; Medical Supplies
          </div>

          <h1 className="text-[32px] sm:text-[38px] font-extrabold text-white leading-[1.15] tracking-tight">
            <span className="text-white">Hospital Pharmacy &amp;</span><br />
            <span className="text-rose-400">Resource Operations</span>
          </h1>

          <p className="text-[15px] text-slate-200 mt-4 leading-relaxed max-w-[420px] font-normal" style={{ color: '#E2E8F0' }}>
            Manage real-time medicine inventory, track essential drug stockouts, update diagnostic lab status, and coordinate state supply chain resupply requests.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Pill, label: "Live Medicine Stock Levels & Expiry Tracking", iconColor: "#FBBF24" },
              { icon: Truck, label: "1-Click Emergency State Resupply Dispatch", iconColor: "#34D399" },
              { icon: FlaskConical, label: "Diagnostics & Lab Machine Operational Status", iconColor: "#22D3EE" },
              { icon: Package, label: "Oxygen Cylinders & Surgical Consumables", iconColor: "#FB7185" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-[10px] p-3 backdrop-blur-md">
                <div className="w-7 h-7 rounded-[7px] bg-white/10 flex items-center justify-center flex-shrink-0" style={{ color: item.iconColor }}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-semibold text-white" style={{ color: '#FFFFFF' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11.5px] text-slate-300" style={{ color: '#CBD5E1' }}>
          <span className="flex items-center gap-1.5 font-bold text-amber-300" style={{ color: '#FCD34D' }}>
            <ShieldCheck className="w-4 h-4" /> State Health Supply Chain Link
          </span>
          <span className="text-slate-400 font-medium">Chennai Central Pharmacy & Diagnostics</span>
        </div>
      </div>

      {/* ── RIGHT: Pharmacy Sign-in Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full max-w-[420px] space-y-6"
        >
          {/* Facility Header Badge */}
          <div className="flex items-center gap-3 p-3 bg-surface border border-[rgba(124,45,45,0.12)] rounded-[12px] shadow-2xs">
            <div className="w-9 h-9 rounded-[9px] bg-blush border border-burgundy-200 flex items-center justify-center flex-shrink-0 text-burgundy-700">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-ink-primary">Chennai Central Pharmacy &amp; Diagnostics</div>
              <div className="text-[11px] text-ink-tertiary">Hospital Pharmacy &amp; Resource Operations · 15 km Radius</div>
            </div>
          </div>

          <div>
            <h2 className="text-[26px] font-extrabold text-ink-primary tracking-tight">Provider Sign In</h2>
            <p className="text-[14px] text-ink-secondary mt-1">
              Access hospital pharmacy inventory and supply chain operations.
            </p>
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
              <div className="text-[12.5px] font-bold text-burgundy-800">Use Demo Pharmacy Account</div>
              <div className="text-[11px] text-ink-tertiary truncate font-mono">provider@pragati.demo · Rajesh Kulkarni</div>
            </div>
            <ArrowRight className="w-4 h-4 text-burgundy-700 group-hover:translate-x-1 transition-transform" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-ink-primary mb-1.5">
                Pharmacist / Supply Admin Email
              </label>
              <input
                id="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="provider@hospital.gov.in"
                className="w-full h-11 px-4 rounded-[10px] bg-surface border border-[rgba(124,45,45,0.15)] text-[14px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 focus:ring-2 focus:ring-burgundy-600/15 transition-all shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[13px] font-bold text-ink-primary">
                  Password
                </label>
                <button type="button" className="text-[12px] text-burgundy-700 hover:underline font-semibold">
                  Forgot Password?
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
                  placeholder="Enter pharmacy portal password"
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
                  Access Pharmacy &amp; Stores <ArrowRight className="w-4 h-4" />
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
            <Link href="/login/doctor" className="hover:text-emerald-700 font-semibold flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Doctor
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
