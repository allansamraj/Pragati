"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, ScrollText, Lock, HardDrive } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: <KeyRound className="w-4 h-4" />,
    label: "Role-based access",
    detail: "Patient, Provider, and Government roles with distinct permissions.",
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    label: "Patient consent",
    detail: "Health records are shared only with patient's explicit consent.",
  },
  {
    icon: <ScrollText className="w-4 h-4" />,
    label: "Audit logs",
    detail: "All record access is logged and auditable by authorised administrators.",
  },
  {
    icon: <Lock className="w-4 h-4" />,
    label: "Secure authentication",
    detail: "Microsoft Entra ID with multi-factor authentication for providers.",
  },
  {
    icon: <HardDrive className="w-4 h-4" />,
    label: "Encrypted storage",
    detail: "Documents are encrypted at rest and in transit.",
  },
];

export function TrustSection() {
  return (
    <section
      id="trust"
      className="section-py-sm bg-surface border-t border-[rgba(124,45,45,0.06)]"
      aria-labelledby="trust-heading"
    >
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
          <div>
            <div className="eyebrow mb-4">Security & Consent</div>
            <h2
              id="trust-heading"
              className="text-[22px] font-bold text-ink-primary"
              style={{ letterSpacing: "-0.015em" }}
            >
              Built with patient safety at the centre.
            </h2>
            <p className="text-[14px] text-ink-secondary mt-3 leading-relaxed">
              Healthcare data requires the highest standard of access control, consent management, and audit transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRUST_ITEMS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-3 p-4 bg-bg border border-[rgba(124,45,45,0.07)] rounded-[12px]"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-[7px] bg-blush border border-[rgba(124,45,45,0.12)] flex items-center justify-center text-burgundy-700">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink-primary">{item.label}</div>
                  <div className="text-[12px] text-ink-tertiary mt-1 leading-relaxed">{item.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Auth architecture footnote */}
        <div className="mt-8 pt-6 border-t border-[rgba(124,45,45,0.06)] flex items-center gap-3 flex-wrap">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-ink-tertiary">
            Authentication architecture:
          </span>
          {["Microsoft Entra ID", "Microsoft Authenticator", "RBAC"].map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium text-ink-secondary bg-surface border border-[rgba(124,45,45,0.08)] rounded px-2.5 py-1"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section
      id="cta"
      className="section-py bg-bg border-t border-[rgba(124,45,45,0.06)]"
      aria-labelledby="cta-heading"
    >
      <div className="section-container text-center">
        <div className="eyebrow mb-5">Get Started</div>
        <h2
          id="cta-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-bold text-ink-primary mb-4 text-balance"
          style={{ letterSpacing: "-0.025em" }}
        >
          Find care. Manage care.{" "}
          <span className="text-burgundy-700">Continue care.</span>
        </h2>
        <p className="text-[16px] text-ink-secondary max-w-[460px] mx-auto mb-8">
          A connected healthcare journey for patients in rural and underserved India.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/patient/find-care"
            className="inline-flex items-center gap-2 bg-burgundy-700 text-white text-[15px] font-semibold px-6 py-3.5 rounded-[10px] hover:bg-burgundy-800 transition-colors shadow-sm"
          >
            Find Available Care <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center gap-2 border border-[rgba(124,45,45,0.2)] text-[15px] font-medium text-ink-secondary px-6 py-3.5 rounded-[10px] hover:bg-blush transition-colors"
          >
            View Patient Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Platform: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Facilities", href: "/#facilities" },
    { label: "Providers", href: "/#providers" },
    { label: "Government", href: "/#government" },
  ],
  Resources: [
    { label: "Research", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
  Contact: [
    { label: "GitHub", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer
      className="bg-surface border-t border-[rgba(124,45,45,0.08)]"
      role="contentinfo"
    >
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-10 mb-10">

          {/* Brand */}
          <div className="max-w-[280px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-burgundy-700 rounded-[6px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <rect x="14" y="7" width="4" height="18" rx="1.5" fill="white" />
                  <rect x="7" y="14" width="18" height="4" rx="1.5" fill="white" />
                  <circle cx="23.5" cy="23.5" r="2.5" fill="#F4B8B8" />
                </svg>
              </div>
              <span className="text-[16px] font-bold text-ink-primary tracking-tight">PRAGATI</span>
            </div>
            <p className="text-[13px] text-ink-tertiary leading-relaxed mb-4">
              Platform for Rural Access, Guidance &amp; Integrated Treatment.
              Smart Public Healthcare Access &amp; Continuity Platform.
            </p>
            <p className="text-[12px] italic text-ink-tertiary">
              Find Care. Manage Care. Continue Care.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-tertiary mb-4">
                {group}
              </div>
              <ul className="space-y-2.5" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-ink-secondary hover:text-ink-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[rgba(124,45,45,0.07)] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-burgundy-700">PRAGATI HealthTech</span>
            <div className="w-px h-3.5 bg-[rgba(124,45,45,0.1)]" />
            <span className="text-[12px] text-ink-tertiary">Public Healthcare Access &amp; Continuity Platform</span>
          </div>
          <div className="text-[12px] text-ink-tertiary">
            Demo prototype data for demonstration purposes only.
          </div>
        </div>
      </div>
    </footer>
  );
}
