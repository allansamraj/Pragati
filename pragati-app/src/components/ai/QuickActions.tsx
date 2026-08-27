"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function QuickActions({
  actions,
  onSelect,
}: {
  actions: string[];
  onSelect: (action: string) => void;
}) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-none">
      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1 flex-shrink-0 mr-0.5">
        <Sparkles className="w-3 h-3 text-burgundy-600" />
      </span>
      {actions.map((act) => (
        <button
          key={act}
          type="button"
          onClick={() => onSelect(act)}
          className="flex-shrink-0 text-[11.5px] font-semibold text-ink-secondary bg-surface hover:bg-blush hover:text-burgundy-800 border border-[rgba(124,45,45,0.12)] hover:border-burgundy-600/30 rounded-full px-3 py-1 transition-all shadow-2xs cursor-pointer"
        >
          {act}
        </button>
      ))}
    </div>
  );
}
