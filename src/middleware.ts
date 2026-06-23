import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie, getCookieCache } from "better-auth/cookies";
import { isAdmin } from "@/lib/roles";

const ADMIN_SIGN_IN = "/admin/sign-in";

async function readCachedSession(request: NextRequest) {
  return getCookieCache(request, {
    secret: process.env.BETTER_AUTH_SECRET,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminSignIn = pathname === ADMIN_SIGN_IN;
  const hasSession = Boolean(getSessionCookie(request));

  if (isAdminSignIn) {
    if (!hasSession) return NextResponse.next();

    const session = await readCachedSession(request);
    if (session && isAdmin(session.user)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL(ADMIN_SIGN_IN, request.url));
  }

  const session = await readCachedSession(request);

  // Cookie cache hit — enforce admin role at the edge without a DB round-trip.
  if (session) {
    if (!isAdmin(session.user)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  // Session token exists but cache not ready yet (e.g. right after login).
  // Let the request through; the dashboard layout validates via getSession once.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
