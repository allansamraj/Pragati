export type AvatarState =
  | "READY"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "PAUSED"
  | "ESCALATION"
  | "EMERGENCY";

export interface AvatarStateConfig {
  state: AvatarState;
  label: string;
  badgeColor: string;
  subtleWaveform: boolean;
  statusMessage: string;
}

export const AVATAR_STATES: Record<AvatarState, AvatarStateConfig> = {
  READY: {
    state: "READY",
    label: "Ready to begin",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    subtleWaveform: false,
    statusMessage: "Doctor is ready in consultation room",
  },
  LISTENING: {
    state: "LISTENING",
    label: "Listening to you...",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    subtleWaveform: true,
    statusMessage: "Patient is speaking...",
  },
  THINKING: {
    state: "THINKING",
    label: "Preparing response...",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    subtleWaveform: false,
    statusMessage: "Reviewing approved clinical guidance...",
  },
  SPEAKING: {
    state: "SPEAKING",
    label: "Doctor Speaking",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    subtleWaveform: true,
    statusMessage: "Explaining procedural information",
  },
  PAUSED: {
    state: "PAUSED",
    label: "Consultation Paused",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    subtleWaveform: false,
    statusMessage: "Waiting for patient continuation",
  },
  ESCALATION: {
    state: "ESCALATION",
    label: "Connecting to Clinician",
    badgeColor: "bg-emerald-600/20 text-emerald-400 border-emerald-500/40",
    subtleWaveform: false,
    statusMessage: "Routing to Dr. Ananya Rao (Cardiology OPD)",
  },
  EMERGENCY: {
    state: "EMERGENCY",
    label: "URGENT ATTENTION REQUIRED",
    badgeColor: "bg-critical-500/20 text-critical-400 border-critical-500/40",
    subtleWaveform: true,
    statusMessage: "Immediate 108 emergency triage recommended",
  },
};

export const avatarService = {
  getStateConfig(state: AvatarState): AvatarStateConfig {
    return AVATAR_STATES[state] || AVATAR_STATES.READY;
  },
};
