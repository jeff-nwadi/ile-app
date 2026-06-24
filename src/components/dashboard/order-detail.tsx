"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { StatusTimeline } from "./status-timeline";
import { CancelOrderDialog } from "./cancel-order-dialog";

export type DashboardOrderDetail = {
  id: string;
  status: string;
  totalKobo: number;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string | null;
  paystackReference: string | null;
};

export type DashboardOrderItem = {
  id: string;
  nameSnapshot: string;
  priceKoboSnapshot: number;
  quantity: number;
};

const CUSTOMER_CANCELLABLE = new Set([
  "pending_payment",
  "paid",
  "preparing",
]);

export function OrderDetail({
  order,
  items,
}: {
  order: DashboardOrderDetail;
  items: DashboardOrderItem[];
}) {
  const isCancelled = order.status === "cancelled";
  const canCancel = CUSTOMER_CANCELLABLE.has(order.status);
  const subtotalKobo = items.reduce(
    (sum, i) => sum + i.priceKoboSnapshot * i.quantity,
    0
  );

  return (
    <div className="px-[6vw] pb-32 pt-12 md:pt-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-charcoal/55 transition-colors hover:text-indigo"
        >
          ← All orders
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-indigo-deep md:text-4xl">
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h1>
            <p className="mt-1 text-sm text-charcoal/60">
              Placed at{" "}
              {new Date(order.createdAt).toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Status timeline / cancelled notice */}
        <div className="mt-8">
          {isCancelled ? (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-700">
                Cancelled
              </p>
              <p className="mt-2 font-serif text-xl text-indigo-deep">
                This order has been cancelled.
              </p>
              <p className="mt-2 text-sm text-charcoal/65">
                If a charge was made, our team will follow up on a refund.
              </p>
            </div>
          ) : (
            <StatusTimeline status={order.status} />
          )}
        </div>

        {/* Items */}
        <div className="mt-8 overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
          <div className="border-b border-charcoal/10 px-6 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              Items
            </p>
          </div>
          <ul className="divide-y divide-charcoal/10">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-indigo-deep">
                    {item.nameSnapshot}
                  </p>
                  <p className="mt-1 font-mono text-xs text-charcoal/55">
                    {formatNaira(item.priceKoboSnapshot)} × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm font-medium text-indigo-deep">
                  {formatNaira(item.priceKoboSnapshot * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-charcoal/10 bg-ivory-dim/60 px-6 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-charcoal/55">
              Total
            </p>
            <p className="font-serif text-2xl text-indigo-deep">
              {formatNaira(subtotalKobo)}
            </p>
          </div>
        </div>

        {/* Customer info */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              Contact
            </p>
            <p className="mt-3 font-medium text-indigo-deep">
              {order.customerName}
            </p>
            <p className="mt-1 text-sm text-charcoal/65">
              {order.customerEmail}
            </p>
            <p className="mt-1 text-sm text-charcoal/65">
              {order.customerPhone}
            </p>
          </div>
          {order.notes ? (
            <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                Notes
              </p>
              <p className="mt-3 text-sm text-charcoal/70">{order.notes}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                Reference
              </p>
              <p className="mt-3 break-all font-mono text-xs text-charcoal/55">
                {order.paystackReference ?? "—"}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost">
            <Link href="/menu">Order again</Link>
          </Button>
          {canCancel && <CancelOrderDialog orderId={order.id} />}
        </div>
      </div>
    </div>
  );
}