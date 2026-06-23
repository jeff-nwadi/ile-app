import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user as { role?: string }).role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}
