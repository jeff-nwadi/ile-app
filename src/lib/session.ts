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
 * a NextResponse the caller can return directly. Use `adminGate()` from
 * route handlers:
 *   const gate = await adminGate();
 *   if (!gate.ok) return gate.response;
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
