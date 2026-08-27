export interface ConsentAuditEntry {
  time: string;
  title: string;
  description: string;
  actor: "PATIENT" | "AI_ASSISTANT" | "CLINICIAN" | "SYSTEM";
  status?: string;
}

export interface ConsentSessionData {
  sessionId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  abhaId: string;
  location: string;
  facility: string;
  department: string;
  supervisingClinician: string;
  clinicianRegistration: string;
  scheduledDate: string;
  scheduledTime: string;
  procedureName: string;
  procedureSummary: string;
  status: "READY" | "IN_PROGRESS" | "CONSENTED" | "DECLINED" | "CLINICIAN_ESCALATED" | "APPROVED";
  consentDecisionTimestamp?: string;
  clinicianReviewTimestamp?: string;
  understandingCheckPassed: boolean;
  patientQuestionsCount: number;
  auditTrail: ConsentAuditEntry[];
}

const INITIAL_SESSION: ConsentSessionData = {
  sessionId: "PRG-AIC-7829",
  patientName: "Arun Sundaram",
  patientAge: 54,
  patientGender: "Male",
  abhaId: "77-8923-4512-6734",
  location: "Chennai, Tamil Nadu",
  facility: "Government General Hospital, Chennai",
  department: "Cardiology (Cath Lab Suite)",
  supervisingClinician: "Dr. Ananya Natarajan, MD, DM",
  clinicianRegistration: "TMC-2014-08-3921",
  scheduledDate: "30 Aug 2026",
  scheduledTime: "10:30 AM",
  procedureName: "Diagnostic Coronary Angiogram & Hemodynamic Assessment",
  procedureSummary: "Diagnostic imaging procedure using fluoroscopy X-ray contrast dye to visualize coronary arteries and assess blood flow restriction.",
  status: "READY",
  understandingCheckPassed: false,
  patientQuestionsCount: 0,
  auditTrail: [
    {
      time: "09:45 AM",
      title: "Consent Session Scheduled",
      description: "Dr. Ananya Natarajan scheduled AI-assisted pre-procedure consent explanation.",
      actor: "CLINICIAN",
    },
    {
      time: "10:28 AM",
      title: "Patient Joined Pre-Session",
      description: "Arun Sundaram connected via PRAGATI secure patient workspace.",
      actor: "PATIENT",
    },
  ],
};

const STORAGE_KEY = "pragati_consent_session_v1";

export const consentService = {
  getSession(): ConsentSessionData {
    if (typeof window === "undefined") return INITIAL_SESSION;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return INITIAL_SESSION;
  },

  saveSession(session: ConsentSessionData): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {}
  },

  addAuditEntry(title: string, description: string, actor: "PATIENT" | "AI_ASSISTANT" | "CLINICIAN" | "SYSTEM") {
    const session = this.getSession();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    session.auditTrail.push({
      time: now,
      title,
      description,
      actor,
    });
    this.saveSession(session);
  },

  recordConsent(decision: "CONSENTED" | "DECLINED" | "CLINICIAN_ESCALATED") {
    const session = this.getSession();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    session.status = decision === "CONSENTED" ? "CONSENTED" : decision === "DECLINED" ? "DECLINED" : "CLINICIAN_ESCALATED";
    session.consentDecisionTimestamp = now;

    if (decision === "CONSENTED") {
      session.auditTrail.push({
        time: now,
        title: "Informed Consent Recorded",
        description: "Patient reviewed risks, benefits, alternatives and provided affirmative consent.",
        actor: "PATIENT",
        status: "PENDING_CLINICIAN_REVIEW",
      });
    } else if (decision === "DECLINED") {
      session.auditTrail.push({
        time: now,
        title: "Patient Declined Procedure",
        description: "Patient elected not to consent. Notification dispatched to supervising clinician.",
        actor: "PATIENT",
        status: "DECLINED",
      });
    } else {
      session.auditTrail.push({
        time: now,
        title: "Clinician Discussion Requested",
        description: "Patient requested real-time direct consultation with Dr. Ananya Rao.",
        actor: "PATIENT",
        status: "ESCALATED",
      });
    }

    this.saveSession(session);
    return session;
  },

  approveByClinician(notes?: string) {
    const session = this.getSession();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    session.status = "APPROVED";
    session.clinicianReviewTimestamp = now;
    session.auditTrail.push({
      time: now,
      title: "Clinician Review & Approval Completed",
      description: `Dr. Ananya Rao (MMC-2014-08-3921) reviewed consent video transcript, quiz score, and validated affirmative record. ${notes || ""}`,
      actor: "CLINICIAN",
      status: "APPROVED_FINAL",
    });
    this.saveSession(session);
    return session;
  },

  resetSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
