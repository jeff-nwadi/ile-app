"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/stat-card";

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
      <p className="text-sm text-charcoal/50">Loading overview…</p>
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
