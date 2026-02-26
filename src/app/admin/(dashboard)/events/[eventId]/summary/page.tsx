"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { UploadTimeline } from "@/components/admin/AnalyticsChart";
import { ExportSelfiesButton } from "@/components/admin/ExportSelfiesButton";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(startMs?: number, endMs?: number): string {
  if (!startMs || !endMs) return "N/A";
  const diffMs = endMs - startMs;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatDate(ts?: number): string {
  if (!ts) return "N/A";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SummaryPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const typedId = eventId as Id<"events">;

  const event = useQuery(api.events.getById, { id: typedId });
  const analytics = useQuery(api.analytics.getEventAnalytics, { eventId: typedId });
  const crewActivity = useQuery(api.analytics.getCrewActivity, { eventId: typedId });
  const aiStats = useQuery(api.analytics.getAiModerationStats, { eventId: typedId });
  const highlights = useQuery(api.analytics.getHighlightSelfies, { eventId: typedId });

  if (event === undefined || analytics === undefined) {
    return <div className="text-center py-12 text-foreground-faint">Loading...</div>;
  }
  if (!event) {
    return <div className="text-center py-12 text-foreground-faint">Event not found</div>;
  }

  const approvalRate =
    analytics.totalSelfies > 0
      ? Math.round((analytics.statusCounts.approved / analytics.totalSelfies) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          href={`/admin/events/${eventId}`}
          className="text-foreground-faint hover:text-foreground-emphasis transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <div className="flex items-center gap-3 text-sm text-foreground-muted">
            <span>{formatDate(event.startsAt)} – {formatDate(event.endsAt)}</span>
            <span className="text-foreground-faint">|</span>
            <span>Duration: {formatDuration(event.startsAt, event.endsAt)}</span>
            {event.archived && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                Archived
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards — 2 rows of 3 */}
      <div className="grid grid-cols-3 gap-4 mt-8 mb-8">
        <Card>
          <p className="text-foreground-faint text-sm">Total Selfies</p>
          <p className="text-3xl font-bold">{analytics.totalSelfies}</p>
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Approval Rate</p>
          <p className="text-3xl font-bold text-success">{approvalRate}%</p>
          <p className="text-xs text-foreground-muted mt-1">
            {analytics.statusCounts.approved} approved / {analytics.statusCounts.rejected} rejected
          </p>
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Storage Used</p>
          <p className="text-3xl font-bold">{formatBytes(analytics.totalStorageBytes)}</p>
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Peak Hour</p>
          <p className="text-xl font-bold">{analytics.peakHour || "N/A"}</p>
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Unique Uploaders</p>
          <p className="text-3xl font-bold">{analytics.uniqueUploaders}</p>
        </Card>
        <Card>
          <p className="text-foreground-faint text-sm">Avg / Hour</p>
          <p className="text-3xl font-bold">{analytics.averagePerHour}</p>
        </Card>
      </div>

      {/* Upload Timeline */}
      <Card className="mb-8">
        <h3 className="font-semibold mb-4">Upload Timeline</h3>
        <UploadTimeline data={analytics.timeline} />
      </Card>

      {/* Highlight Photos */}
      {highlights && highlights.length > 0 && (
        <Card className="mb-8">
          <h3 className="font-semibold mb-4">Highlights</h3>
          <div className="grid grid-cols-6 gap-2">
            {highlights.map((selfie) => (
              <div key={selfie._id} className="aspect-square rounded-lg overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selfie.imageUrl || ""}
                  alt={selfie.displayName || "Selfie"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Crew Activity */}
      {crewActivity && crewActivity.totalActions > 0 && (
        <Card className="mb-8">
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

      {/* AI Moderation */}
      {aiStats?.hasData && (
        <Card className="mb-8">
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-separator">
        <ExportSelfiesButton eventId={eventId} eventName={event.name} />
        <Link
          href={`/admin/events/${eventId}/analytics`}
          className="text-primary hover:text-primary/80 transition-colors text-sm underline"
        >
          View Full Analytics
        </Link>
      </div>
    </div>
  );
}
