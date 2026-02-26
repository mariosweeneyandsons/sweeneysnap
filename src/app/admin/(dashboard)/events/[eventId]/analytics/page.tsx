"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { UploadTimeline } from "@/components/admin/AnalyticsChart";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AnalyticsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });
  const analytics = useQuery(api.analytics.getEventAnalytics, {
    eventId: eventId as Id<"events">,
  });
  const crewActivity = useQuery(api.analytics.getCrewActivity, {
    eventId: eventId as Id<"events">,
  });
  const aiStats = useQuery(api.analytics.getAiModerationStats, {
    eventId: eventId as Id<"events">,
  });

  if (event === undefined || analytics === undefined) {
    return <div className="text-center py-12 text-foreground-faint">Loading...</div>;
  }
  if (!event) {
    return <div className="text-center py-12 text-foreground-faint">Event not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/events/${eventId}`}
          className="text-foreground-faint hover:text-foreground-emphasis transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Analytics: {event.name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <p className="text-foreground-faint text-sm">Total Selfies</p>
          <p className="text-3xl font-bold">{analytics?.totalSelfies ?? 0}</p>
          {(analytics?.uniqueUploaders ?? 0) > 0 && (
            <p className="text-xs text-foreground-muted mt-1">
              ~{analytics?.uniqueUploaders} unique uploaders
            </p>
          )}
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Approved</p>
          <p className="text-3xl font-bold text-success">
            {analytics?.statusCounts.approved ?? 0}
          </p>
          <div className="flex gap-3 text-xs text-foreground-faint mt-1">
            <span>{analytics?.statusCounts.pending ?? 0} pending</span>
            <span>{analytics?.statusCounts.rejected ?? 0} rejected</span>
          </div>
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Total Storage</p>
          <p className="text-3xl font-bold">
            {formatBytes(analytics?.totalStorageBytes ?? 0)}
          </p>
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Peak Hour</p>
          <p className="text-xl font-bold">
            {analytics?.peakHour || "N/A"}
          </p>
          <p className="text-xs text-foreground-faint mt-1">
            Avg {analytics?.averagePerHour ?? 0}/hr
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Upload Timeline</h3>
        <UploadTimeline data={analytics?.timeline ?? []} />
      </Card>

      {/* AI Moderation Stats */}
      {aiStats?.hasData && (
        <Card className="mt-6">
          <h3 className="font-semibold mb-4">AI Moderation</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-foreground-faint text-sm">Analyzed</p>
              <p className="text-2xl font-bold">{aiStats.analyzed}</p>
            </div>
            <div>
              <p className="text-foreground-faint text-sm">Flagged</p>
              <p className="text-2xl font-bold text-warning">{aiStats.flagged}</p>
            </div>
            <div>
              <p className="text-foreground-faint text-sm">Auto-Rejected</p>
              <p className="text-2xl font-bold text-destructive">{aiStats.autoRejected}</p>
            </div>
          </div>
          {Object.keys(aiStats.categoryCounts).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(aiStats.categoryCounts).map(([cat, count]) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-full text-xs bg-warning-bg text-warning"
                >
                  {cat}: {count}
                </span>
              ))}
            </div>
          )}
          {aiStats.falsePositiveEstimate > 0 && (
            <p className="text-xs text-foreground-muted">
              ~{aiStats.falsePositiveEstimate} flagged items were later approved (possible false positives)
            </p>
          )}
        </Card>
      )}

      {/* Crew Activity */}
      {crewActivity && crewActivity.totalActions > 0 && (
        <Card className="mt-6">
          <h3 className="font-semibold mb-4">Crew Activity</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-foreground-faint text-sm">Total Actions</p>
              <p className="text-2xl font-bold">{crewActivity.totalActions}</p>
            </div>
            {crewActivity.mostActiveName && (
              <div>
                <p className="text-foreground-faint text-sm">Most Active</p>
                <p className="text-lg font-bold">{crewActivity.mostActiveName}</p>
                <p className="text-xs text-foreground-muted">{crewActivity.mostActiveCount} actions</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(crewActivity.actionCounts).map(([action, count]) => (
              <span
                key={action}
                className="px-2 py-0.5 rounded-full text-xs bg-secondary text-foreground"
              >
                {action}: {count}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Summary link */}
      <div className="mt-8 text-center">
        <Link
          href={`/admin/events/${eventId}/summary`}
          className="text-primary hover:text-primary/80 transition-colors text-sm underline"
        >
          View Post-Event Summary
        </Link>
      </div>
    </div>
  );
}
