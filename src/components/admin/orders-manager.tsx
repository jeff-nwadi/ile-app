"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalKobo: number;
  status: string;
  createdAt: string;
};

const nextStatus: Record<string, { label: string; status: string }[]> = {
  paid: [{ label: "Start prep", status: "preparing" }],
  preparing: [{ label: "Mark ready", status: "ready" }],
  ready: [{ label: "Complete", status: "completed" }],
  pending_payment: [{ label: "Cancel", status: "cancelled" }],
};

export function OrdersManager() {
  const [list, setList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setList(d.orders ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
      {loading ? (
        <p className="px-6 py-10 text-sm text-charcoal/50">Loading…</p>
      ) : list.length === 0 ? (
        <p className="px-6 py-10 text-sm text-charcoal/50">No orders yet.</p>
      ) : (
        <div className="divide-y divide-charcoal/10">
          {list.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-serif text-lg text-indigo-deep">
                    {o.customerName}
                  </p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-2 text-sm text-charcoal/55">
                  {o.customerPhone} · {o.customerEmail}
                </p>
                <p className="mt-1 font-mono text-xs text-charcoal/40">
                  {new Date(o.createdAt).toLocaleString("en-NG")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <p className="font-mono text-sm font-medium text-indigo-deep">
                  {formatNaira(o.totalKobo)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(nextStatus[o.status] ?? []).map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      variant={
                        action.status === "cancelled" ? "outline" : "default"
                      }
                      onClick={() => updateStatus(o.id, action.status)}
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
