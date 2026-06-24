import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";

const ADMIN_SIGN_IN = "/admin/sign-in";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminSignIn = pathname === ADMIN_SIGN_IN;

  const session = await auth.api.getSession({ headers: request.headers });
  const isAdminUser = !!session && isAdmin(session.user);

  if (isAdminSignIn) {
    if (isAdminUser) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL(ADMIN_SIGN_IN, request.url));
  }
  if (!isAdminUser) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
