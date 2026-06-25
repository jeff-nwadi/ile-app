import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-[6vw] pb-32 pt-12 md:pt-16" aria-busy="true">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-4 w-24" />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-7 w-24" />
        </div>

        {/* Status timeline */}
        <div className="mt-8 rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="mt-8 overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
          <div className="border-b border-charcoal/10 px-6 py-4">
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="divide-y divide-charcoal/10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 px-6 py-4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-charcoal/10 bg-ivory-dim/60 px-6 py-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-7 w-28" />
          </div>
        </div>

        {/* Contact / notes */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-4 h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
