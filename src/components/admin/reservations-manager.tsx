"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  status: string;
  specialRequests: string | null;
  createdAt: string;
};

const actions: Record<string, { label: string; status: string }[]> = {
  requested: [
    { label: "Confirm", status: "confirmed" },
    { label: "Cancel", status: "cancelled" },
  ],
  confirmed: [
    { label: "Complete", status: "completed" },
    { label: "Cancel", status: "cancelled" },
  ],
};

export function ReservationsManager() {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/reservations")
      .then((r) => r.json())
      .then((d) => setList(d.reservations ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
      {loading ? (
        <div className="divide-y divide-charcoal/10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="px-6 py-10 text-sm text-charcoal/50">
          No reservations yet.
        </p>
      ) : (
        <div className="divide-y divide-charcoal/10">
          {list.map((r) => (
            <div key={r.id} className="px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-serif text-lg text-indigo-deep">
                      {r.name}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-2 font-mono text-sm text-charcoal/70">
                    {r.date} · {r.time} · Party of {r.partySize}
                  </p>
                  <p className="mt-1 text-sm text-charcoal/55">
                    {r.phone} · {r.email}
                  </p>
                  {r.specialRequests && (
                    <p className="mt-3 rounded-lg bg-ivory-dim px-3 py-2 text-sm text-charcoal/70">
                      {r.specialRequests}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(actions[r.status] ?? []).map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      variant={
                        action.status === "cancelled" ? "outline" : "default"
                      }
                      onClick={() => updateStatus(r.id, action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
