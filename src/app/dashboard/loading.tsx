import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-[6vw] pb-32 pt-12 md:pt-16" aria-busy="true">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-32" />
            <Skeleton className="mt-3 h-4 w-96 max-w-full" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-charcoal/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>

        {/* Rows */}
        <div className="mt-8">
          <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
            <div className="divide-y divide-charcoal/10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
