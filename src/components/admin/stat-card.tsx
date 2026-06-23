import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm",
        className
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl font-medium text-indigo-deep">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-sm text-charcoal/55">{hint}</p>
      )}
    </div>
  );
}
