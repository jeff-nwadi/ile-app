"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { isAdmin } from "@/lib/roles";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AdminAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (session?.user && isAdmin(session.user)) {
      router.replace(next.startsWith("/admin") ? next : "/admin");
    }
  }, [session, router, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn.email({
      email: form.email,
      password: form.password,
    });

    if (result.error) {
      setError(result.error.message ?? "Invalid credentials");
      setLoading(false);
      return;
    }

    if (!isAdmin(result.data?.user)) {
      await signOut();
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }

    // Hard navigation ensures auth cookies are sent before middleware runs again.
    window.location.assign(next.startsWith("/admin") ? next : "/admin");
  }

  return (
    <AuthShell
      variant="admin"
      footer={
        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-charcoal/45">
          Guest?{" "}
          <Link href="/sign-in" className="text-indigo hover:underline">
            Client sign in
          </Link>
        </p>
      }
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
        Admin portal
      </p>
      <h1 className="mt-3 font-serif text-4xl text-indigo-deep">Staff sign in</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Authorized staff only. Manage menu, reservations, and orders.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Work email</Label>
          <Input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Enter dashboard"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function AdminAuthPage() {
  return (
    <Suspense>
      <AdminAuthForm />
    </Suspense>
  );
}
