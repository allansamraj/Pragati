// ─── PRAGATI AUTH SERVICE ─────────────────────────────────────────────────────
// Mock authentication for prototype.
//
// FUTURE: Replace this entire file with Microsoft MSAL (Entra ID):
//   import { PublicClientApplication } from "@azure/msal-browser";
//   const msalInstance = new PublicClientApplication(msalConfig);
//
// The calling interface (login / logout / getCurrentUser) stays the same.

import {
  type AuthResult,
  type UserRole,
  type Session,
  DEMO_CREDENTIALS,
  ROLE_DASHBOARD,
  ROLE_LOGIN,
} from "./types";
import { sessionService } from "./sessionService";

// Session duration: 8 hours for prototype
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export const authService = {
  /**
   * Authenticate a user.
   * FUTURE: Replace body with MSAL `loginPopup` or `loginRedirect`.
   */
  async login(email: string, password: string, role: UserRole): Promise<AuthResult> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    const cred = DEMO_CREDENTIALS[role];

    if (
      email.trim().toLowerCase() !== cred.email.toLowerCase() ||
      password !== cred.password
    ) {
      return { success: false, error: "Incorrect credentials. Use the demo account button." };
    }

    const now = new Date();
    const session: Session = {
      user: cred.user,
      role,
      isAuthenticated: true,
      loginAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
      isDemoSession: true,
    };

    sessionService.set(session);
    return { success: true, session };
  },

  /**
   * Log out and clear session.
   * Returns the login URL to redirect to.
   */
  logout(role?: UserRole): string {
    const currentRole = role ?? sessionService.getRole();
    sessionService.clear();
    return currentRole ? ROLE_LOGIN[currentRole] : "/";
  },

  /** Get the current authenticated session */
  getSession(): Session | null {
    return sessionService.get();
  },

  /** Get dashboard URL for current session */
  getDashboardUrl(role: UserRole): string {
    return ROLE_DASHBOARD[role];
  },

  /** Check if a route is accessible by the current session */
  canAccess(pathname: string): boolean {
    const session = sessionService.get();
    if (!session) return false;

    const protectedPrefixes: Record<UserRole, string> = {
      patient: "/patient",
      doctor: "/doctor",
      provider: "/provider",
      government: "/government",
    };

    for (const [role, prefix] of Object.entries(protectedPrefixes)) {
      if (pathname.startsWith(prefix) && session.role !== role) {
        return false;
      }
    }
    return true;
  },
};
