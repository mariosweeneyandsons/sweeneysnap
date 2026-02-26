"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SortableEventGrid } from "@/components/admin/SortableEventGrid";
import { EventsListSkeleton } from "@/components/admin/skeletons/EventsListSkeleton";

function getScheduleBadge(event: { startsAt?: number; endsAt?: number; isActive: boolean }) {
  if (!event.startsAt && !event.endsAt) return null;
  const now = Date.now();
  if (event.startsAt && now < event.startsAt)
    return { label: "Scheduled", color: "bg-info-bg text-info" };
  if (event.endsAt && now > event.endsAt)
    return { label: "Ended", color: "bg-secondary text-foreground-muted" };
  return { label: "Live", color: "bg-success-bg text-success" };
}

export default function AdminDashboard() {
  const [showArchived, setShowArchived] = useState(false);
  const events = useQuery(api.events.list, { includeArchived: showArchived });

  const eventIds = useMemo(
    () => (events || []).map((e) => e._id as Id<"events">),
    [events]
  );

  const selfieCounts = useQuery(
    api.selfies.countsByEvents,
    eventIds.length > 0 ? { eventIds } : "skip"
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex items-center gap-3">
          <Button
            variant={showArchived ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Event
          </Link>
        </div>
      </div>

      {!events ? (
        <EventsListSkeleton />
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-foreground-muted mb-4">No events yet</p>
          <Link href="/admin/events/new" className="text-foreground underline hover:no-underline">
            Create your first event
          </Link>
        </Card>
      ) : (
        <SortableEventGrid
          events={events}
          selfieCounts={selfieCounts ?? undefined}
          getScheduleBadge={getScheduleBadge}
        />
      )}
    </div>
  );
}
