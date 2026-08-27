"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Search, Filter, ShieldCheck, Activity, Users, Bed, ChevronRight } from "lucide-react";
import { DEMO_FACILITIES, Facility } from "@/data/facilities";

import { useLocationContext } from "@/lib/context/LocationContext";

export default function GovernmentFacilitiesPage() {
  const { governmentLocation } = useLocationContext();
  const state = governmentLocation?.state || "Tamil Nadu";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = DEMO_FACILITIES.filter((f: Facility) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.district.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || f.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 mb-1">Statewide Infrastructure</p>
        <h1 className="text-[24px] font-extrabold text-ink-primary tracking-tight">Public Healthcare Facilities</h1>
        <p className="text-[12.5px] text-ink-secondary mt-1">Live monitoring across {state} health network — {DEMO_FACILITIES.length} regional hubs &amp; clinics tracked</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name, district, or address..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-burgundy-600 shadow-2xs"
          />
        </div>
        <div className="flex gap-2">
          {["all", "hospital", "primary"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-[8px] text-[12px] font-bold border transition-colors cursor-pointer capitalize ${
                typeFilter === type
                  ? "bg-burgundy-700 text-white border-burgundy-700 shadow-2xs"
                  : "bg-white border-[rgba(124,45,45,0.12)] text-ink-secondary hover:bg-blush"
              }`}
            >
              {type === "all" ? "All Types" : type === "hospital" ? "HOSPITALS" : "PHCs"}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fac: Facility) => (
          <div key={fac.id} className="bg-white border border-[rgba(124,45,45,0.08)] rounded-[14px] p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-700 bg-blush px-2 py-0.5 rounded border border-[rgba(124,45,45,0.12)]">
                  {fac.type}
                </span>
                <h3 className="font-bold text-[14px] text-ink-primary mt-1.5 leading-snug">{fac.name}</h3>
                <p className="text-[11.5px] text-ink-secondary">{fac.district} District · {fac.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-bg p-2 rounded-[8px] border border-[rgba(124,45,45,0.06)]">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-ink-tertiary block">Beds</span>
                <strong className="text-ink-primary">300</strong>
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-bold text-ink-tertiary block">Doctors</span>
                <strong className="text-ink-primary">{fac.doctors?.length || 4} Active</strong>
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-bold text-ink-tertiary block">Queue</span>
                <strong className="text-emerald-700 font-mono">#{fac.queue?.nowServing || 41} Serving</strong>
              </div>
            </div>

            <div className="text-[11px] text-ink-secondary space-y-1">
              <div>Diagnostics: <strong>{fac.diagnostics?.map((d) => d.name).join(", ") || "ECG, X-Ray"}</strong></div>
              <div>Operating Hours: <strong>{fac.hours}</strong></div>
            </div>

            <Link
              href={`/patient/facilities/${fac.id}`}
              className="block w-full py-2 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.12)] rounded-[8px] text-[11.5px] font-bold text-burgundy-700 text-center transition-colors"
            >
              View Facility Details →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
