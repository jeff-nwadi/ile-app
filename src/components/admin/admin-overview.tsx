"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
  menu: { total: number; available: number };
  reservations: { total: number; pending: number; today: number };
  orders: { total: number; pending: number };
};

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-9 w-16" />
            <Skeleton className="mt-3 h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Menu items"
        value={stats.menu.total}
        hint={`${stats.menu.available} currently visible`}
      />
      <StatCard
        label="Pending reservations"
        value={stats.reservations.pending}
        hint={`${stats.reservations.today} booked for today`}
      />
      <StatCard
        label="Total reservations"
        value={stats.reservations.total}
      />
      <StatCard
        label="Open orders"
        value={stats.orders.pending}
        hint={`${stats.orders.total} orders all time`}
      />
    </div>
  );
}
