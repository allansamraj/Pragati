"use client";

import React, { useState } from "react";
import { useLocation } from "@/lib/context/LocationContext";
import { UserRole } from "@/lib/auth/types";
import { MapPin, Navigation, Building2, ChevronDown, Check, X, Shield, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface RoleLocationHeaderProps {
  role: UserRole;
}

export function RoleLocationHeader({ role }: RoleLocationHeaderProps) {
  const {
    getRoleLocationSummary,
    patientLocation,
    refreshGPS,
    setManualLocation,
    isRefreshing,
    governmentLocation,
    setGovernmentState,
    setGovernmentDistrict,
    setGovernmentBlock,
  } = useLocation();

  const summary = getRoleLocationSummary(role);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Government dropdown toggles
  const [showGovDropdown, setShowGovDropdown] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setManualLoading(true);
    setManualError(null);
    try {
      await setManualLocation(manualQuery);
      setShowPatientModal(false);
      setManualQuery("");
    } catch (err: any) {
      setManualError(err?.message || "Location not found");
    } finally {
      setManualLoading(false);
    }
  };

  // ── 1. PATIENT HEADER ──
  if (role === "patient") {
    return (
      <>
        <div className="flex items-center gap-2 text-[12.5px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-burgundy-50 border border-[rgba(124,45,45,0.12)] rounded-[8px]">
            <MapPin className="w-3.5 h-3.5 text-burgundy-700 flex-shrink-0" />
            <span className="font-bold text-ink-primary truncate max-w-[220px]">
              {summary.primaryLabel}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wider ml-1">
              {summary.badgeLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowPatientModal(true)}
            className="text-[11.5px] font-semibold text-burgundy-700 hover:text-burgundy-900 hover:underline flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer"
          >
            Change Location
          </button>
        </div>

        {/* Patient Location Change Modal */}
        <AnimatePresence>
          {showPatientModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[16px] max-w-[460px] w-full shadow-2xl border border-[rgba(124,45,45,0.15)] overflow-hidden"
              >
                <div className="p-4 border-b border-[rgba(124,45,45,0.1)] bg-bg flex items-center justify-between">
                  <span className="text-[13px] font-bold text-ink-primary flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-burgundy-700" /> Patient Location Selector
                  </span>
                  <button
                    onClick={() => setShowPatientModal(false)}
                    className="p-1 rounded hover:bg-blush text-ink-secondary cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blush/60 rounded-[10px] border border-[rgba(124,45,45,0.1)]">
                    <div>
                      <span className="text-[11px] font-bold text-ink-tertiary uppercase block">Current Active GPS</span>
                      <span className="text-[13px] font-bold text-ink-primary block mt-0.5">{patientLocation.displayName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        refreshGPS(true);
                        setShowPatientModal(false);
                      }}
                      disabled={isRefreshing}
                      className="px-2.5 py-1.5 bg-white hover:bg-blush border border-[rgba(124,45,45,0.15)] rounded-[7px] text-[11.5px] font-bold text-burgundy-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} /> Detect GPS
                    </button>
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11.5px] font-bold text-ink-secondary block mb-1">
                        Or enter city, district, town, or PIN code:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Uthandi Chennai, Nandurbar, Mumbai, 600119..."
                        value={manualQuery}
                        onChange={(e) => setManualQuery(e.target.value)}
                        className="w-full h-10 px-3 bg-bg border border-[rgba(124,45,45,0.15)] rounded-[8px] text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600"
                      />
                      {manualError && <p className="text-[11px] text-rose-600 mt-1">{manualError}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10.5px] font-bold text-ink-tertiary uppercase block">Quick Presets:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {["Uthandi, Chennai", "Perungudi, Chennai", "Nandurbar", "Navapur", "Mumbai", "Pune"].map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setManualQuery(loc)}
                            className="px-2.5 py-1 rounded-[6px] text-[11px] font-medium bg-bg hover:bg-blush border border-[rgba(124,45,45,0.1)] text-ink-secondary cursor-pointer"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPatientModal(false)}
                        className="px-3 py-1.5 rounded-[7px] border border-[rgba(124,45,45,0.12)] text-[12px] font-semibold text-ink-secondary cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={manualLoading}
                        className="px-4 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white font-bold text-[12px] rounded-[7px] shadow-2xs cursor-pointer"
                      >
                        {manualLoading ? "Setting..." : "Update Location"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── 2. DOCTOR HEADER ──
  if (role === "doctor") {
    return (
      <div className="flex items-center gap-2.5 text-[12.5px]">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[rgba(124,45,45,0.12)] rounded-[9px] shadow-2xs">
          <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-ink-primary text-[12.5px]">{summary.primaryLabel}</span>
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                Registered Work Facility
              </span>
            </div>
            <div className="text-[11px] text-ink-secondary mt-0.2 flex items-center gap-1">
              <span>{summary.secondaryLabel}</span>
              <span>·</span>
              <span className="font-semibold text-emerald-800">{summary.badgeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. PROVIDER / PHARMACY HEADER ──
  if (role === "provider") {
    return (
      <div className="flex items-center gap-2.5 text-[12.5px]">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[rgba(124,45,45,0.12)] rounded-[9px] shadow-2xs">
          <Building2 className="w-4 h-4 text-burgundy-700 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-ink-primary text-[12.5px]">{summary.primaryLabel}</span>
              <span className="text-[9.5px] font-bold text-burgundy-700 bg-blush border border-[rgba(124,45,45,0.15)] px-1.5 py-0.2 rounded uppercase">
                Registered Business Location
              </span>
            </div>
            <div className="text-[11px] text-ink-secondary mt-0.2">
              {summary.secondaryLabel}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 4. GOVERNMENT HEADER ──
  return (
    <div className="flex items-center gap-2 text-[12px] flex-wrap">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-white/20 rounded-[9px] shadow-2xs">
        <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="font-bold text-ink-primary">Administrative Hierarchy:</span>

        {/* State Selector */}
        <select
          value={governmentLocation.state}
          onChange={(e) => setGovernmentState(e.target.value)}
          className="bg-bg border border-[rgba(124,45,45,0.15)] rounded-[6px] px-2 py-0.5 text-[11.5px] font-bold text-ink-primary focus:outline-none"
        >
          {governmentLocation.availableStates.map((s) => (
            <option key={s} value={s}>
              State: {s}
            </option>
          ))}
        </select>

        {/* District Selector */}
        <select
          value={governmentLocation.district}
          onChange={(e) => setGovernmentDistrict(e.target.value)}
          className="bg-bg border border-[rgba(124,45,45,0.15)] rounded-[6px] px-2 py-0.5 text-[11.5px] font-bold text-ink-primary focus:outline-none"
        >
          {governmentLocation.availableDistricts.map((d) => (
            <option key={d} value={d}>
              District: {d}
            </option>
          ))}
        </select>

        {/* Block Selector */}
        <select
          value={governmentLocation.block}
          onChange={(e) => setGovernmentBlock(e.target.value)}
          className="bg-bg border border-[rgba(124,45,45,0.15)] rounded-[6px] px-2 py-0.5 text-[11.5px] font-bold text-ink-primary focus:outline-none"
        >
          {governmentLocation.availableBlocks.map((b) => (
            <option key={b} value={b}>
              Block: {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
