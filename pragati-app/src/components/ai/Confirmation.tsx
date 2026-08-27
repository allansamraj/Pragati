"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { ConfirmationAction } from "@/lib/ai/types";

export function Confirmation({
  action,
  onConfirmed,
}: {
  action: ConfirmationAction;
  onConfirmed?: () => void;
}) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending");

  if (!action) return null;

  const handleConfirm = () => {
    setStatus("confirmed");
    if (onConfirmed) onConfirmed();
  };

  const handleCancel = () => {
    setStatus("cancelled");
  };

  return (
    <div className="bg-surface border border-burgundy-200/80 rounded-[12px] p-4 my-2.5 shadow-xs">
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-6 h-6 rounded-full bg-burgundy-700/10 border border-burgundy-700/20 flex items-center justify-center flex-shrink-0 text-burgundy-700 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-ink-primary">{action.title}</h4>
          <p className="text-[12px] text-ink-secondary mt-0.5 leading-relaxed">{action.description}</p>
        </div>
      </div>

      {status === "pending" && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[rgba(124,45,45,0.08)]">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-1.5 bg-burgundy-700 hover:bg-burgundy-800 text-white rounded-[7px] text-[12px] font-bold transition-colors shadow-2xs cursor-pointer"
          >
            Confirm Action
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-1.5 bg-bg hover:bg-blush border border-[rgba(124,45,45,0.15)] text-ink-secondary rounded-[7px] text-[12px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {status === "confirmed" && (
        <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center gap-2 text-[12px] text-emerald-700 font-semibold bg-emerald-50/70 p-2 rounded-[6px]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{action.confirmedText}</span>
        </div>
      )}

      {status === "cancelled" && (
        <div className="mt-3 pt-2.5 border-t border-[rgba(124,45,45,0.08)] flex items-center gap-2 text-[12px] text-ink-tertiary">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>Action was cancelled.</span>
        </div>
      )}
    </div>
  );
}
