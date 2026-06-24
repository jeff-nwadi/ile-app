import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatNaira } from "@/lib/utils";

export type DashboardOrder = {
  id: string;
  status: string;
  totalKobo: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

function shortRef(id: string) {
  // First 8 chars, uppercase, looks like a kitchen ticket number.
  return id.slice(0, 8).toUpperCase();
}

export function OrderRow({ order }: { order: DashboardOrder }) {
  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group block px-6 py-5 transition-colors hover:bg-ivory-dim"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-serif text-lg text-indigo-deep">
              Order #{shortRef(order.id)}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-charcoal/55">
            {new Date(order.createdAt).toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 lg:justify-end">
          <p className="font-mono text-sm font-medium text-indigo-deep">
            {formatNaira(order.totalKobo)}
          </p>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-charcoal/40 transition-colors group-hover:text-indigo">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}