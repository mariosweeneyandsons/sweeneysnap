"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface ActivityLogProps {
  eventId: string;
  crewToken?: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  approve: { label: "Approved", color: "text-success" },
  reject: { label: "Rejected", color: "text-destructive" },
  reset: { label: "Reset to Pending", color: "text-warning" },
  delete: { label: "Deleted", color: "text-destructive" },
};

export function ActivityLog({ eventId, crewToken }: ActivityLogProps) {
  const logs = useQuery(api.crewActivityLog.listByEvent, {
    eventId: eventId as Id<"events">,
    crewToken,
  });

  if (logs === undefined) {
    return <p className="text-foreground-muted text-sm">Loading activity log...</p>;
  }

  if (logs.length === 0) {
    return <p className="text-foreground-muted text-sm">No crew activity yet.</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: "text-foreground-muted" };
        const timeAgo = getTimeAgo(log.timestamp);
        const actor = log.crewMemberName || "Legacy Crew";

        return (
          <div
            key={log._id}
            className="flex items-center gap-3 py-2 px-3 rounded-xs bg-secondary text-sm"
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{
              backgroundColor: actionInfo.color === "text-success" ? "var(--success)"
                : actionInfo.color === "text-destructive" ? "var(--destructive)"
                : "var(--warning)",
            }} />
            <span className="text-foreground font-medium">{actor}</span>
            <span className={actionInfo.color}>{actionInfo.label}</span>
            <span className="text-foreground-muted">a selfie</span>
            <span className="ml-auto text-foreground-muted text-xs shrink-0">{timeAgo}</span>
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
