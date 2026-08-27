"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Sparkles, Stethoscope, Pill, Building2, ArrowRight } from "lucide-react";
import { ChatMessage, UserRole } from "@/lib/ai/types";
import { FacilityResult } from "./FacilityResult";
import { TokenResult } from "./TokenResult";
import { RecordResult } from "./RecordResult";
import { AnalyticsResult } from "./AnalyticsResult";
import { Confirmation } from "./Confirmation";
import { EmergencyAction } from "./EmergencyAction";
import { MedicineInventoryCard } from "./ActionCard";

export function Message({
  message,
  onPromptSelect,
}: {
  message: ChatMessage;
  onPromptSelect?: (prompt: string) => void;
}) {
  const router = useRouter();
  const isUser = message.sender === "user";

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "doctor":
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />;
      case "provider":
        return <Pill className="w-3.5 h-3.5 text-amber-400" />;
      case "government":
        return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
      case "patient":
      default:
        return <Sparkles className="w-3.5 h-3.5 text-rose-300" />;
    }
  };

  const handleActionClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById("facility-results") || document.getElementById("triage-input");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }
  };

  return (
    <div className={`flex gap-2.5 my-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs ${
          isUser
            ? "bg-burgundy-700 text-white"
            : "bg-[#1A1210] border border-white/10 text-white"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : getRoleIcon(message.role)}
      </div>

      {/* Message Content */}
      <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`p-3.5 rounded-[14px] text-[13px] leading-relaxed shadow-2xs ${
            isUser
              ? "bg-burgundy-700 text-white font-medium rounded-tr-xs"
              : "bg-surface border border-[rgba(124,45,45,0.1)] text-ink-primary rounded-tl-xs"
          }`}
        >
          <div className="whitespace-pre-wrap">{message.text}</div>

          {/* Attached Structured Widget (if any) */}
          {message.widget && (
            <div className="mt-2 text-left">
              {message.widget.type === "facility_list" && (
                <FacilityResult facilities={message.widget.data} />
              )}
              {message.widget.type === "token_status" && (
                <TokenResult data={message.widget.data} />
              )}
              {message.widget.type === "patient_summary" && (
                <RecordResult data={message.widget.data} isDoctor={message.role === "doctor"} />
              )}
              {message.widget.type === "medicine_inventory" && (
                <MedicineInventoryCard items={message.widget.data} />
              )}
              {message.widget.type === "district_analytics" && (
                <AnalyticsResult districts={message.widget.data} />
              )}
              {message.widget.type === "confirmation" && (
                <Confirmation action={message.widget.data} />
              )}
              {message.widget.type === "emergency" && (
                <EmergencyAction data={message.widget.data} />
              )}
            </div>
          )}

          {/* Primary Action Button link */}
          {message.actionLink && (
            <div className="mt-3 pt-2.5 border-t border-[rgba(124,45,45,0.08)]">
              <button
                type="button"
                onClick={(e) => handleActionClick(e, message.actionLink!.href)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-burgundy-700 hover:bg-burgundy-800 active:scale-[0.98] text-white rounded-[8px] text-[12px] font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <span>{message.actionLink.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Suggested Prompts attached to message */}
        {message.suggestedPrompts && message.suggestedPrompts.length > 0 && onPromptSelect && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestedPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPromptSelect(p)}
                className="text-[11px] font-medium text-ink-secondary bg-surface hover:bg-blush hover:text-burgundy-800 border border-[rgba(124,45,45,0.1)] rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="block text-[9.5px] text-ink-tertiary mt-1 px-1">{message.timestamp}</span>
      </div>
    </div>
  );
}
