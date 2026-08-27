"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Eye, Clock, Unlink } from "lucide-react";

const PROBLEMS = [
  {
    number: "01",
    icon: <AlertCircle className="w-4 h-4" />,
    headline: "Wrong Facility",
    body: "A patient may reach a facility that cannot provide the required service, resulting in wasted time and delayed care.",
  },
  {
    number: "02",
    icon: <Eye className="w-4 h-4" />,
    headline: "Unclear Availability",
    body: "Doctor and diagnostic availability may not be visible before travel. Patients have no way to verify this in advance.",
  },
  {
    number: "03",
    icon: <Clock className="w-4 h-4" />,
    headline: "Long Waiting",
    body: "Patients may spend significant time waiting without queue visibility, disrupting daily lives and rural livelihoods.",
  },
  {
    number: "04",
    icon: <Unlink className="w-4 h-4" />,
    headline: "Disconnected Care",
    body: "Referrals, prescriptions and medical history may be fragmented across facilities with no continuity for the patient.",
  },
];

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="section-py bg-surface border-t border-[rgba(124,45,45,0.06)]"
      aria-labelledby="problem-heading"
    >
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">

          {/* Left — label + headline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <div className="eyebrow mb-4">The Problem</div>
            <h2
              id="problem-heading"
              className="text-[clamp(28px,3.5vw,38px)] font-bold text-ink-primary text-balance"
              style={{ letterSpacing: "-0.02em", lineHeight: "1.18" }}
            >
              Healthcare exists.
              <br />
              <span className="text-burgundy-700">Access is still fragmented.</span>
            </h2>
            <p className="text-[15px] text-ink-secondary mt-4 max-w-[320px] leading-relaxed">
              Public healthcare infrastructure in India is extensive. But patients often cannot navigate to the right facility at the right time.
            </p>
          </motion.div>

          {/* Right — editorial problem list */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-0"
            role="list"
          >
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={p.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                role="listitem"
                className={`p-6 border-[rgba(124,45,45,0.07)] ${
                  i === 0 ? "border-b border-r" :
                  i === 1 ? "border-b" :
                  i === 2 ? "border-r sm:border-b-0 border-b" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-[8px] bg-blush border border-[rgba(124,45,45,0.1)] flex items-center justify-center">
                    <span className="text-[13px] font-bold font-mono text-burgundy-700">{p.number}</span>
                  </div>

                  <div>
                    {/* Icon + Headline */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-burgundy-600" aria-hidden>{p.icon}</span>
                      <h3 className="text-[15px] font-bold text-ink-primary">{p.headline}</h3>
                    </div>
                    {/* Body */}
                    <p className="text-[14px] text-ink-secondary leading-relaxed">{p.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
