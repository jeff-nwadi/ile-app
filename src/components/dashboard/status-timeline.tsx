import { cn } from "@/lib/utils";

// Lifecycle steps a customer can move through. `cancelled` is handled
// separately by the parent component.
const STEPS = [
  { id: "pending_payment", label: "Pending" },
  { id: "paid", label: "Confirmed" },
  { id: "preparing", label: "In the kitchen" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Completed" },
] as const;

const STEP_INDEX: Record<string, number> = {
  pending_payment: 0,
  paid: 1,
  preparing: 2,
  ready: 3,
  completed: 4,
};

export function StatusTimeline({ status }: { status: string }) {
  const currentIdx =
    status === "cancelled" ? -1 : STEP_INDEX[status] ?? 0;

  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
        Status
      </p>
      <ol className="mt-5 grid gap-4 sm:grid-cols-5">
        {STEPS.map((step, idx) => {
          const reached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <li key={step.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                    isCurrent &&
                      "border-gold bg-gold text-charcoal",
                    !isCurrent && reached &&
                      "border-indigo-deep bg-indigo-deep text-ivory",
                    !reached &&
                      "border-charcoal/15 bg-ivory-dim text-charcoal/35"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {idx + 1}
                </span>
                {idx < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1",
                      idx < currentIdx
                        ? "bg-indigo-deep"
                        : "bg-charcoal/10"
                    )}
                    aria-hidden
                  />
                )}
              </div>
              <p
                className={cn(
                  "text-xs",
                  isCurrent
                    ? "font-medium text-indigo-deep"
                    : reached
                      ? "text-charcoal/70"
                      : "text-charcoal/40"
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}