import { Skeleton } from "@/components/ui/Skeleton";

export function EventsListSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-28 mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
