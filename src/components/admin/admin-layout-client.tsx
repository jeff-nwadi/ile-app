"use client";

import Link from "next/link";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import { AdminSidebar, type AdminSidebarProps } from "./admin-sidebar";
import { Separator } from "@/components/ui/separator";

export function AdminLayoutClient({
  user,
  children,
}: AdminSidebarProps & { children: React.ReactNode}) {
  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar": "var(--indigo-deep)",
          "--sidebar-foreground": "var(--ivory)",
          "--sidebar-primary": "var(--gold)",
          "--sidebar-primary-foreground": "var(--charcoal)",
          "--sidebar-accent": "color-mix(in oklch, var(--ivory) 12%, transparent)",
          "--sidebar-accent-foreground": "var(--ivory)",
          "--sidebar-border": "color-mix(in oklch, var(--ivory) 14%, transparent)",
          "--sidebar-ring": "var(--gold)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar user={user} />
      <SidebarInset className="bg-ivory-dim">{children}</SidebarInset>
    </SidebarProvider>
  );
}

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-24 shrink-0 items-center border-b border-charcoal/10 bg-ivory/90 px-8 py-6 backdrop-blur-md">
      <SidebarTrigger className="size-9 shrink-0" />
      <Separator orientation="vertical" className="mx-3 h-10" />
      <div className="flex min-w-0 flex-1 items-center justify-between_gap-6">
        <div className="min-w-0 py-0.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Dashboard
          </p>
          <h1 className="mt-1 truncate font-serif text-2xl font-medium leading-tight text-indigo-deep md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 hidden max-w-xl text-sm leading-relaxed text-charcoal/60 sm:block">
              {description}
            </p>
          )}
        </div>
        <Link
          href="/"
          className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-charcoal/50 transition-colors hover:text-indigo sm:inline"
        >
          View site →
        </Link>
      </div>
    </header>
  );
}
