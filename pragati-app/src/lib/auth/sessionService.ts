// ─── PRAGATI SESSION SERVICE ──────────────────────────────────────────────────
// Manages client-side session state via localStorage + a cookie for middleware.
//
// FUTURE: Replace localStorage body with:
//   - Secure HttpOnly JWT cookie (set by API route)
//   - Microsoft Entra ID token cache (MSAL)

import { type Session, type UserRole } from "./types";

const SESSION_KEY = "pragati_session";
const SESSION_COOKIE = "pragati_role"; // Read by Next.js middleware

export const sessionService = {
  /** Persist session to localStorage + set a lightweight role cookie for middleware */
  set(session: Session): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      // Middleware-readable cookie (not HttpOnly in prototype — future: server-set JWT)
      document.cookie = `${SESSION_COOKIE}=${session.role}; path=/; SameSite=Lax`;
    } catch {
      // Storage unavailable — session lives in memory only
    }
  },

  /** Read session from localStorage */
  get(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: Session = JSON.parse(raw);
      // Check expiry
      if (new Date(session.expiresAt) < new Date()) {
        sessionService.clear();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  /** Clear session from localStorage + clear cookie */
  clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(SESSION_KEY);
      document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch {
      // Ignore
    }
  },

  /** Check if a valid session exists */
  isAuthenticated(): boolean {
    return sessionService.get() !== null;
  },

  /** Get the current role */
  getRole(): UserRole | null {
    return sessionService.get()?.role ?? null;
  },

  /** Get the current user */
  getUser() {
    return sessionService.get()?.user ?? null;
  },

  /** Check if current session has a specific role */
  hasRole(role: UserRole): boolean {
    return sessionService.getRole() === role;
  },
};
