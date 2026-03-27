import { Skeleton } from "@/components/ui/Skeleton";

export function EventDetailSkeleton() {
  return (
    <div className="bp-grid -mt-4 pt-4 min-h-screen">
      {/* Header skeleton */}
      <div className="border-b-2 border-border py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-16 rounded-xs" />
            <Skeleton className="h-10 w-72 rounded-xs" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-xs" />
            <Skeleton className="h-8 w-20 rounded-xs" />
            <Skeleton className="h-8 w-20 rounded-xs" />
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-border-separator">
          <Skeleton className="h-4 w-64 rounded-xs" />
        </div>
      </div>

      {/* Two-panel layout skeleton */}
      <div className="py-8 flex gap-6">
        {/* Left: preview panel skeleton */}
        <aside className="hidden xl:block w-[420px] shrink-0 space-y-4">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <Skeleton className="w-full rounded-xs" style={{ aspectRatio: "16 / 9" }} />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xs" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-xs" />
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-xs" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-9 rounded-xs" />
              <Skeleton className="h-9 rounded-xs" />
            </div>
          </div>
        </aside>

        {/* Right: form skeleton */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, col) => (
              <div key={col} className="space-y-4">
                {Array.from({ length: col === 0 ? 3 : 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-card-border rounded-xs bg-surface p-5"
                  >
                    <Skeleton className="h-5 w-36 mb-4 rounded-xs" />
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full rounded-xs" />
                      <Skeleton className="h-10 w-full rounded-xs" />
                      <Skeleton className="h-10 w-3/4 rounded-xs" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
