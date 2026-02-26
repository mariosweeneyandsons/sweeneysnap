"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface ActivityLogProps {
  eventId: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  approve: { label: "Approved", color: "text-green-400" },
  reject: { label: "Rejected", color: "text-red-400" },
  reset: { label: "Reset to Pending", color: "text-yellow-400" },
  delete: { label: "Deleted", color: "text-red-500" },
};

export function ActivityLog({ eventId }: ActivityLogProps) {
  const logs = useQuery(api.crewActivityLog.listByEvent, {
    eventId: eventId as Id<"events">,
  });

  if (logs === undefined) {
    return <p className="text-white/50 text-sm">Loading activity log...</p>;
  }

  if (logs.length === 0) {
    return <p className="text-white/40 text-sm">No crew activity yet.</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: "text-white/60" };
        const timeAgo = getTimeAgo(log.timestamp);
        const actor = log.crewMemberName || "Legacy Crew";

        return (
          <div
            key={log._id}
            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5 text-sm"
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{
              backgroundColor: actionInfo.color === "text-green-400" ? "#4ade80"
                : actionInfo.color === "text-red-400" ? "#f87171"
                : actionInfo.color === "text-red-500" ? "#ef4444"
                : "#facc15",
            }} />
            <span className="text-white/70 font-medium">{actor}</span>
            <span className={actionInfo.color}>{actionInfo.label}</span>
            <span className="text-white/30">a selfie</span>
            <span className="ml-auto text-white/30 text-xs shrink-0">{timeAgo}</span>
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
