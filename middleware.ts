// middleware.ts  (Next.js edge middleware — runs before every matched request)
// This is the ONLY place authorization is enforced.
// Route handlers are completely unaware of permissions.

import { NextRequest, NextResponse } from "next/server";
import { evaluate } from "./lib/opa";
import { getUserFromToken } from "./lib/auth";

// Maps URL path prefixes → required OPA action
// Declarative: adding a new protected route = one line here
const ROUTE_ACTIONS: Array<{ pattern: RegExp; action: string }> = [
  { pattern: /^\/api\/dashboard/, action: "dashboard:read" },
  { pattern: /^\/api\/reports\/export/, action: "reports:export" },
  { pattern: /^\/api\/reports/, action: "reports:read" },
  { pattern: /^\/api\/admin/, action: "admin:read" },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Find which action this route requires
  const match = ROUTE_ACTIONS.find(({ pattern }) => pattern.test(pathname));
  if (!match) {
    // Route not protected — pass through
    return NextResponse.next();
  }

  // Extract identity from token (header or query param for demo purposes)
  const token =
    req.headers.get("x-user-token") ??
    req.nextUrl.searchParams.get("token");

  const user = getUserFromToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing or invalid token" },
      { status: 401 }
    );
  }

  // Delegate to OPA — the middleware stays thin and declarative
  const result = await evaluate({
    user: {
      id: user.id,
      role: user.role,
      permissions: user.permissions,
    },
    action: match.action,
    resource: pathname,
  });

  if (!result.allow) {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: result.deny_reason ?? `Action '${match.action}' not permitted`,
        user: user.name,
        role: user.role,
        requiredAction: match.action,
      },
      { status: 403 }
    );
  }

  // Allowed — forward user info to handler via headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-role", user.role);
  requestHeaders.set("x-user-name", user.name);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Only run middleware on API routes
  matcher: ["/api/:path*"],
};
