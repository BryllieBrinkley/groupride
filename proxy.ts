import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, getDashboardPathForRole } from "@/lib/auth";
import type { Role, SessionUser } from "@/lib/types";

const roleRoutes: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/operator", roles: ["operator"] },
  { prefix: "/account", roles: ["customer"] },
];

function decodeSession(value: string) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as SessionUser;
  } catch {
    return null;
  }
}

function getSessionUser(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  return raw ? decodeSession(raw) : null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getSessionUser(request);

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL(getDashboardPathForRole(user.role), request.url));
  }

  for (const route of roleRoutes) {
    if (pathname.startsWith(route.prefix)) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (!route.roles.includes(user.role)) {
        return NextResponse.redirect(new URL(getDashboardPathForRole(user.role), request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/operator/:path*", "/account/:path*"],
};
