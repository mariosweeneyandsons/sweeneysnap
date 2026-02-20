"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { ModerationGrid } from "@/components/admin/ModerationGrid";
import Link from "next/link";

export default function AdminModeratePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });

  if (event === undefined) {
    return <div className="text-center py-12 text-white/50">Loading...</div>;
  }
  if (!event) {
    return <div className="text-center py-12 text-white/50">Event not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/events/${eventId}`} className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Moderate: {event.name}</h1>
      </div>
      <ModerationGrid eventId={event._id} mode="admin" />
    </div>
  );
}
