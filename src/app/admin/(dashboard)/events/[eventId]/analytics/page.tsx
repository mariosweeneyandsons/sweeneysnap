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

  if (event === undefined || analytics === undefined) {
    return <div className="text-center py-12 text-white/50">Loading...</div>;
  }
  if (!event) {
    return <div className="text-center py-12 text-white/50">Event not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/events/${eventId}`}
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Analytics: {event.name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <p className="text-white/50 text-sm">Total Selfies</p>
          <p className="text-3xl font-bold">{analytics?.totalSelfies ?? 0}</p>
        </Card>
        <Card>
          <p className="text-white/50 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-400">
            {analytics?.statusCounts.approved ?? 0}
          </p>
          <div className="flex gap-3 text-xs text-white/40 mt-1">
            <span>{analytics?.statusCounts.pending ?? 0} pending</span>
            <span>{analytics?.statusCounts.rejected ?? 0} rejected</span>
          </div>
        </Card>
        <Card>
          <p className="text-white/50 text-sm">Total Storage</p>
          <p className="text-3xl font-bold">
            {formatBytes(analytics?.totalStorageBytes ?? 0)}
          </p>
        </Card>
        <Card>
          <p className="text-white/50 text-sm">Peak Hour</p>
          <p className="text-xl font-bold">
            {analytics?.peakHour || "N/A"}
          </p>
          <p className="text-xs text-white/40 mt-1">
            Avg {analytics?.averagePerHour ?? 0}/hr
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Upload Timeline</h3>
        <UploadTimeline data={analytics?.timeline ?? []} />
      </Card>
    </div>
  );
}
