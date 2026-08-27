import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

export function formatWait(minutes: number): string {
  if (minutes === 0) return "No wait";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getStatusColor(status: "available" | "limited" | "unavailable") {
  return {
    available: "text-available bg-available-50",
    limited: "text-limited bg-limited-50",
    unavailable: "text-critical bg-critical-50",
  }[status];
}

export function getStatusLabel(status: "available" | "limited" | "unavailable") {
  return {
    available: "Available",
    limited: "Limited",
    unavailable: "Unavailable",
  }[status];
}

export function getMatchScoreColor(score: number): string {
  if (score >= 85) return "text-available-500";
  if (score >= 65) return "text-limited-500";
  return "text-critical-500";
}
