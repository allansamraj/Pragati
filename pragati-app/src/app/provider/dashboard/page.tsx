"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pill, FlaskConical, AlertTriangle, CheckCircle2, RefreshCw,
  ArrowRight, Package, Truck, Activity, Building2, Plus
} from "lucide-react";
import { useLocationContext } from "@/lib/context/LocationContext";

export default function ProviderDashboard() {
  const { providerLocation } = useLocationContext();
  const [resupplied, setResupplied] = useState(false);

  const handleResupply = () => {
    setResupplied(true);
    setTimeout(() => setResupplied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-[1240px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy-700 bg-blush border border-burgundy-200 rounded px-2 py-0.5">
              Hospital Pharmacy &amp; Supplies Command
            </span>
            <span className="text-[12px] text-ink-tertiary">Registered Facility · {providerLocation.district}</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">
            {providerLocation.facilityName}
          </h1>
          <p className="text-[13px] text-ink-secondary mt-0.5">
            Central Medicine Stores · Diagnostic Lab Status · Service Coverage: {providerLocation.serviceRadiusKm} km
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResupply}
            className="flex items-center gap-2 px-4 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[10px] text-[13px] font-bold transition-all shadow-xs cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>{resupplied ? "Resupply Batch Dispatched!" : "Request State Resupply"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Medicine SKUs", value: "248 Items", sub: "Central Inventory Live", color: "text-ink-primary" },
          { label: "Critical Stockouts", value: "2 Medicines", sub: "Metformin 500mg, Amlodipine", color: "text-rose-600" },
          { label: "Diagnostic Machines", value: "5 / 6 Active", sub: "CT Scan under maintenance", color: "text-amber-700" },
          { label: "Oxygen Cylinders", value: "84 Units", sub: "Adequate (92% Capacity)", color: "text-emerald-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[12px] p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">{stat.label}</div>
            <div className={`text-[24px] font-extrabold font-mono mt-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-[11.5px] text-ink-secondary mt-0.5 font-medium">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Medicine Alerts (Left) + Diagnostics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-6">
        {/* Left: Essential Medicine Stock Levels */}
        <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-ink-primary">Priority Medicines Stock Status</h3>
              <p className="text-[11.5px] text-ink-tertiary">Real-time inventory connected to hospital dispensary</p>
            </div>
            <Link href="/provider/medicines" className="text-[12px] font-bold text-burgundy-700 hover:underline flex items-center gap-1">
              Full Inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[rgba(124,45,45,0.06)] border border-[rgba(124,45,45,0.08)] rounded-[10px] overflow-hidden">
            {[
              { name: "Paracetamol 500mg Tablets", stock: 240, min: 100, status: "available" },
              { name: "Amoxicillin 250mg Capsules", stock: 48, min: 100, status: "limited" },
              { name: "Atorvastatin 20mg Tablets", stock: 12, min: 50, status: "limited" },
              { name: "Metformin 500mg Tablets", stock: 0, min: 150, status: "critical" },
              { name: "Aspirin 75mg Gastro-resistant", stock: 380, min: 100, status: "available" },
              { name: "Amlodipine 5mg Tablets", stock: 0, min: 100, status: "critical" },
            ].map((m) => (
              <div key={m.name} className="p-3.5 flex items-center justify-between gap-3 hover:bg-bg transition-colors">
                <div>
                  <div className="text-[13px] font-bold text-ink-primary">{m.name}</div>
                  <div className="text-[11px] text-ink-tertiary">Minimum threshold: {m.min} units</div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right font-mono font-bold text-[14px] text-ink-primary">
                    {m.stock} <span className="text-[11px] text-ink-tertiary font-sans font-normal">units</span>
                  </div>
                  <span
                    className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      m.status === "available"
                        ? "bg-available-50 border-available-100 text-available-600"
                        : m.status === "limited"
                        ? "bg-limited-50 border-limited-100 text-limited-600"
                        : "bg-critical-50 border-critical-100 text-critical-500"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blush/60 rounded-[10px] border border-burgundy-200 flex items-center justify-between">
            <span className="text-[12px] text-ink-secondary">2 critical stockouts broadcasted to state supply chain.</span>
            <Link href="/provider/medicines" className="text-[12px] font-bold text-burgundy-700 hover:underline">
              Manage Orders →
            </Link>
          </div>
        </div>

        {/* Right: Diagnostic Labs & Equipment */}
        <div className="bg-white border border-[rgba(124,45,45,0.09)] rounded-[14px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-ink-primary">Diagnostic Labs &amp; Equipment</h3>
              <p className="text-[11.5px] text-ink-tertiary">Real-time machine availability</p>
            </div>
            <Link href="/provider/diagnostics" className="text-[12px] font-bold text-burgundy-700 hover:underline flex items-center gap-1">
              Update Status <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              { name: "12-Lead ECG Machine (Room 102)", wait: "15 min", status: "Operational" },
              { name: "Digital X-Ray Unit (Radiology)", wait: "25 min", status: "Operational" },
              { name: "64-Slice CT Scan (Block C)", wait: "Down for Service", status: "Maintenance" },
              { name: "Ultrasound Sonography (USG)", wait: "20 min", status: "Operational" },
              { name: "Automated Pathology Analyzer", wait: "45 min", status: "Operational" },
            ].map((d) => (
              <div key={d.name} className="p-3 rounded-[10px] bg-bg border border-[rgba(124,45,45,0.07)] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-ink-primary">{d.name}</div>
                  <div className="text-[11px] text-ink-tertiary mt-0.5">Est. Wait: {d.wait}</div>
                </div>
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded border ${
                    d.status === "Operational"
                      ? "bg-available-50 border-available-100 text-available-600"
                      : "bg-limited-50 border-limited-100 text-limited-600"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
