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
  queued: "bg-primary/10 text-primary",
  printing: "bg-warning-bg text-warning",
  printed: "bg-success-bg text-success",
  failed: "bg-destructive/10 text-destructive",
};

export function PrintQueueView({ eventId }: PrintQueueViewProps) {
  const { toast } = useToast();
  const jobs = useQuery(api.printJobs.listByEvent, {
    eventId: eventId as Id<"events">,
  });
  const adminUpdateStatus = useMutation(api.printJobs.adminUpdateStatus);

  const handleRetry = async (jobId: string) => {
    try {
      await adminUpdateStatus({
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
          className="flex items-center gap-4 p-3 rounded-lg bg-card-bg border border-border-separator"
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
