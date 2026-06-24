import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>["user"];

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export type AdminAuth =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse };

/**
 * Server-side admin gate. Returns either the authenticated admin user, or
 * a NextResponse the caller can return directly. Use `mustAdmin()` from
 * route handlers for a one-line guard.
 */
export async function requireAdmin(): Promise<AdminAuth> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if ((user as { role?: string }).role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}

/**
 * Convenience wrapper: returns the user on success, or throws a NextResponse
 * the route handler returns. Lets callers stay one-liner clean:
 *   const user = await mustAdmin();
 */
export async function mustAdmin(): Promise<SessionUser> {
  const r = await requireAdmin();
  if (!r.ok) throw r.response;
  return r.user;
}
