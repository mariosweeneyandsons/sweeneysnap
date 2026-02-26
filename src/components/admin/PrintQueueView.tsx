"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface PrintQueueViewProps {
  eventId: string;
}

const statusColors: Record<string, string> = {
  queued: "bg-blue-500/20 text-blue-400",
  printing: "bg-yellow-500/20 text-yellow-400",
  printed: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

export function PrintQueueView({ eventId }: PrintQueueViewProps) {
  const { toast } = useToast();
  const jobs = useQuery(api.printJobs.listByEvent, {
    eventId: eventId as Id<"events">,
  });
  const updateStatus = useMutation(api.printJobs.updateStatus);

  const handleRetry = async (jobId: string) => {
    try {
      await updateStatus({
        id: jobId as Id<"printJobs">,
        status: "queued",
      });
      toast("Job re-queued", "success");
    } catch {
      toast("Failed to retry", "error");
    }
  };

  if (!jobs) {
    return <p className="text-foreground-muted">Loading print queue...</p>;
  }

  if (jobs.length === 0) {
    return <p className="text-foreground-muted">No print jobs yet</p>;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job._id}
          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10"
        >
          {job.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.imageUrl}
              alt=""
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {job.displayName || "Anonymous"}
            </p>
            <p className="text-xs text-foreground-muted">
              {new Date(job.queuedAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[job.status] || ""}`}
          >
            {job.status}
          </span>
          {job.status === "failed" && (
            <Button size="sm" onClick={() => handleRetry(job._id)}>
              Retry
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
