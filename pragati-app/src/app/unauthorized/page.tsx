"use client";

import React from "react";
import Link from "next/link";
import { ShieldOff, ArrowRight } from "lucide-react";
import { sessionService } from "@/lib/auth/sessionService";
import { ROLE_DASHBOARD } from "@/lib/auth/types";

export default function UnauthorizedPage() {
  const role = sessionService.getRole();
  const dashboardUrl = role ? ROLE_DASHBOARD[role] : "/";

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="text-center max-w-[400px]">
        <div className="w-14 h-14 rounded-[14px] bg-critical-50 border border-critical-100 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-6 h-6 text-critical-500" aria-hidden />
        </div>
        <h1 className="text-[22px] font-bold text-ink-primary mb-2" style={{ letterSpacing: "-0.02em" }}>
          Access Denied
        </h1>
        <p className="text-[15px] text-ink-secondary mb-8">
          You don&apos;t have permission to access this workspace. Each PRAGATI workspace is role-restricted.
        </p>
        <Link
          href={dashboardUrl}
          className="inline-flex items-center gap-2 bg-burgundy-700 text-white text-[14px] font-semibold px-5 py-3 rounded-[10px] hover:bg-burgundy-800 transition-colors"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="mt-6 text-[12px] text-ink-tertiary">
          Need a different account?{" "}
          <Link href="/" className="text-burgundy-700 hover:underline font-medium">
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
