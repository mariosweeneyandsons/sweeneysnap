import { Skeleton } from "@/components/ui/Skeleton";

export function EventDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <Skeleton className="h-5 w-36 mb-3" />
            <Skeleton className="h-40 w-40 mx-auto rounded-lg" />
          </div>
        ))}
      </div>

      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col gap-5">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
