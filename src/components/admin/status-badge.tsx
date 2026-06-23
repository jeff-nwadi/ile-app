import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  requested: "bg-amber-100 text-amber-900 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  pending_payment: "bg-amber-100 text-amber-900 border-amber-200",
  paid: "bg-blue-100 text-blue-900 border-blue-200",
  preparing: "bg-violet-100 text-violet-900 border-violet-200",
  ready: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        styles[status] ?? "bg-charcoal/5 text-charcoal border-charcoal/10",
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
