"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { ActivityLog } from "@/components/crew/ActivityLog";

export default function AdminActivityPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });

  if (event === undefined) return <div className="text-center py-12 text-foreground-faint">Loading...</div>;
  if (!event) return <div className="text-center py-12 text-foreground-faint">Event not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${eventId}`} className="text-foreground-faint hover:text-foreground-emphasis transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Activity Log: {event.name}</h1>
          <p className="text-foreground-faint text-sm">All crew moderation actions</p>
        </div>
      </div>

      <ActivityLog eventId={eventId} />
    </div>
  );
}
