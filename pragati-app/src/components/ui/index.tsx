"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ─── BUTTON ───────────────────────────────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, iconRight, className, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy-700 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-burgundy-700 text-white hover:bg-burgundy-800 active:bg-burgundy-900 shadow-xs",
      secondary: "bg-blush text-burgundy-700 hover:bg-rose border border-[rgba(124,45,45,0.15)] hover:border-[rgba(124,45,45,0.25)]",
      ghost: "bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-blush",
      destructive: "bg-critical-50 text-critical-500 hover:bg-critical-100 border border-critical-100",
      outline: "bg-transparent text-ink-primary border border-[rgba(124,45,45,0.18)] hover:bg-blush hover:border-[rgba(124,45,45,0.28)]",
    };

    const sizes = {
      sm: "text-[13px] px-3 py-[7px] h-8",
      md: "text-[14px] px-4 py-[9px] h-9",
      lg: "text-[15px] px-5 py-[11px] h-11",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" aria-hidden />
        ) : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

type StatusType = "available" | "limited" | "unavailable" | "emergency" | "pending";

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  available:   { label: "Available",   className: "text-available-500 bg-available-50 border-available-100" },
  limited:     { label: "Limited",     className: "text-limited-500 bg-limited-50 border-limited-100" },
  unavailable: { label: "Unavailable", className: "text-critical-500 bg-critical-50 border-critical-100" },
  emergency:   { label: "Emergency",   className: "text-critical-500 bg-critical-50 border-critical-100" },
  pending:     { label: "Pending",     className: "text-limited-500 bg-limited-50 border-limited-100" },
};

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, label, size = "sm", className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const displayLabel = label ?? config.label;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded border tracking-wide",
        size === "sm" ? "text-[11px] px-[6px] py-[3px]" : "text-[12px] px-2 py-1",
        config.className,
        className
      )}
      role="status"
      aria-label={displayLabel}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"
        aria-hidden
      />
      {displayLabel}
    </span>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "burgundy" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default:  "bg-blush text-ink-secondary border border-[rgba(124,45,45,0.1)]",
    burgundy: "bg-burgundy-700 text-white",
    muted:    "bg-surface-2 text-ink-tertiary border border-[rgba(124,45,45,0.07)]",
  };
  return (
    <span className={cn("inline-flex items-center text-[11px] font-semibold tracking-wider uppercase px-2 py-[3px] rounded", variants[variant], className)}>
      {children}
    </span>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  hoverable?: boolean;
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ level = 2, hoverable, selected, className, children, ...props }, ref) => {
    const levels = {
      1: "bg-bg",
      2: "bg-surface border border-[rgba(124,45,45,0.08)] shadow-xs",
      3: "bg-surface border border-[rgba(124,45,45,0.12)] shadow-sm",
    };
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[14px]",
          levels[level],
          hoverable && "transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[rgba(124,45,45,0.18)]",
          selected && "border-burgundy-600 ring-1 ring-burgundy-600/20 shadow-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// ─── INPUT ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, iconRight, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-ink-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-ink-tertiary pointer-events-none" aria-hidden>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-surface border border-[rgba(124,45,45,0.12)] rounded-[10px]",
              "text-[15px] text-ink-primary placeholder:text-ink-tertiary",
              "px-3 py-2.5 h-10",
              "transition-all duration-150",
              "focus:outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600/20",
              "disabled:opacity-50 disabled:bg-surface-2",
              icon && "pl-9",
              iconRight && "pr-9",
              error && "border-critical-500 focus:border-critical-500 focus:ring-critical-500/20",
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-ink-tertiary" aria-hidden>
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="text-[12px] text-critical-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── SKELETON ─────────────────────────────────────────────────────────────────

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-rose/40", className)}
      aria-hidden
      {...props}
    />
  );
}

// ─── DEMO ENVIRONMENT BADGE ───────────────────────────────────────────────────

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("demo-badge", className)} aria-label="Demo environment">
      Demo
    </span>
  );
}
