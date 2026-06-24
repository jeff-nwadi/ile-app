"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderRow, type DashboardOrder } from "./order-row";

type Filter = "all" | "active" | "completed" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES = new Set(["paid", "preparing", "ready"]);

function matches(filter: Filter, status: string): boolean {
  switch (filter) {
    case "all":
      return true;
    case "active":
      return ACTIVE_STATUSES.has(status);
    case "completed":
      return status === "completed";
    case "cancelled":
      return status === "cancelled";
  }
}

export function DashboardShell({ initialOrders }: { initialOrders: DashboardOrder[] }) {
  const [orders, setOrders] = useState<DashboardOrder[]>(initialOrders);
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { orders: DashboardOrder[] };
      setOrders(data.orders ?? []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 30s polling, paused while tab is hidden, refetched on focus.
  useEffect(() => {
    function start() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(refresh, 30_000);
    }
    function stop() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    function onVisibility() {
      if (document.hidden) {
        stop();
      } else {
        refresh();
        start();
      }
    }
    function onFocus() {
      refresh();
    }

    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const filtered = orders.filter((o) => matches(filter, o.status));
  const counts: Record<Filter, number> = {
    all: orders.length,
    active: orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="px-[6vw] pb-32 pt-12 md:pt-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              Your account
            </p>
            <h1 className="mt-2 font-serif text-3xl text-indigo-deep md:text-4xl">
              Orders
            </h1>
            <p className="mt-2 max-w-lg text-sm text-charcoal/60">
              Track what you&apos;ve ordered, see live kitchen status, and cancel
              while it&apos;s still possible.
            </p>
          </div>
          <p
            className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-opacity ${
              refreshing ? "text-gold opacity-100" : "text-charcoal/30 opacity-0"
            }`}
            aria-live="polite"
          >
            Refreshing…
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-charcoal/10">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                data-filter={f.id}
                onClick={() => setFilter(f.id)}
                className={`relative -mb-px border-b-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-gold text-indigo-deep"
                    : "border-transparent text-charcoal/50 hover:text-indigo"
                }`}
              >
                {f.label}
                <span className="ml-2 text-charcoal/40">{counts[f.id]}</span>
              </button>
            );
          })}
        </div>

        {/* List or empty state */}
        <div className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState hasAny={orders.length > 0} filter={filter} />
          ) : (
            <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
              <div className="divide-y divide-charcoal/10">
                {filtered.map((o) => (
                  <OrderRow key={o.id} order={o} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasAny, filter }: { hasAny: boolean; filter: Filter }) {
  if (!hasAny) {
    return (
      <div className="rounded-xl border border-dashed border-charcoal/15 bg-white/50 px-8 py-16 text-center">
        <p className="font-serif text-xl text-indigo-deep">
          You haven&apos;t placed any orders yet.
        </p>
        <p className="mt-2 text-sm text-charcoal/60">
          Browse the tasting menu to get started.
        </p>
        <Button asChild className="mt-6">
          <Link href="/menu">View the menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-charcoal/15 bg-white/50 px-8 py-12 text-center">
      <p className="font-serif text-lg text-indigo-deep">
        No {filter} orders.
      </p>
      <button
        type="button"
        onClick={() => {
          const el = document.querySelector<HTMLButtonElement>(
            'button[data-filter="all"]'
          );
          el?.click();
        }}
        className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-charcoal/55 hover:text-indigo"
      >
        Show all orders
      </button>
    </div>
  );
}