"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, signUp, useSession } from "@/lib/auth-client";
import { isAdmin } from "@/lib/roles";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ClientAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  // Pull `refetch` off the session atom so we can force the navbar (and any
  // other subscriber) to re-validate after sign-in / sign-up. The session
  // atom's internal cache isn't always invalidated automatically by
  // signIn.email / signUp.email in better-auth 1.6.20, so we trigger it
  // explicitly to keep the UI in sync.
  const { refetch: refetchSession } = useSession();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result =
      mode === "in"
        ? await signIn.email({ email: form.email, password: form.password })
        : await signUp.email({
            name: form.name,
            email: form.email,
            password: form.password,
          });

    if (result.error) {
      setError(result.error.message ?? "Something went wrong");
      setLoading(false);
      return;
    }

    if (isAdmin(result.data?.user)) {
      await signOut();
      setError("Staff accounts must sign in through the admin portal.");
      setLoading(false);
      return;
    }

    // Force any useSession() subscribers (navbar, dashboard, etc.) to
    // re-fetch the server-side session before navigation completes.
    // router.refresh() alone is not enough — better-auth's session atom
    // holds its own cache that only refetch() invalidates.
    await refetchSession?.();

    const safeNext = next.startsWith("/admin") ? "/" : next;
    router.push(safeNext);
    router.refresh();
  }

  return (
    <AuthShell
      variant="client"
      footer={
        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-charcoal/45">
          Staff?{" "}
          <Link href="/admin/sign-in" className="text-indigo hover:underline">
            Admin sign in
          </Link>
        </p>
      }
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
        {mode === "in" ? "Welcome back" : "Join Ilé"}
      </p>
      <h1 className="mt-3 font-serif text-4xl text-indigo-deep">
        {mode === "in" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm text-charcoal/60">
        {mode === "in"
          ? "Sign in to reserve a table or track your orders."
          : "Create a guest account to book tables and order ahead."}
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        {mode === "up" && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
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
          {loading
            ? "Please wait…"
            : mode === "in"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-charcoal/50 transition-colors hover:text-indigo"
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setError("");
        }}
      >
        {mode === "in"
          ? "Need an account? Sign up"
          : "Already have one? Sign in"}
      </button>
    </AuthShell>
  );
}

export function ClientAuthPage() {
  return (
    <Suspense>
      <ClientAuthForm />
    </Suspense>
  );
}
