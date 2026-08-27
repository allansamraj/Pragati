import { type NextRequest, NextResponse } from "next/server";

// ─── ROUTE PROTECTION PROXY ───────────────────────────────────────────────────
// Reads the `pragati_role` cookie (set by sessionService at login).

const PROTECTED_ROUTES: Record<string, string> = {
  "/patient": "patient",
  "/doctor": "doctor",
  "/provider": "provider",
  "/government": "government",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("pragati_role")?.value;

  // Check each protected prefix
  for (const [prefix, requiredRole] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      // No session → redirect to role-appropriate login
      if (!role) {
        const loginUrl = new URL(`/login/${requiredRole}`, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Wrong role → redirect to unauthorized
      if (role !== requiredRole) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      // Correct role → allow through
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*", "/provider/:path*", "/government/:path*"],
};
