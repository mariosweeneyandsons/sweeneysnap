import { Skeleton } from "@/components/ui/Skeleton";

export function ModerationGridSkeleton() {
  return (
    <div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-xs" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xs border border-card-border overflow-hidden bg-card-bg"
          >
            <Skeleton className="w-full aspect-square rounded-none" />
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-8 flex-1 rounded-xs" />
                <Skeleton className="h-8 flex-1 rounded-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
