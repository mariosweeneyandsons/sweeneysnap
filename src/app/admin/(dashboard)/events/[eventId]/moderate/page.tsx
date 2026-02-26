"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { ModerationGrid } from "@/components/admin/ModerationGrid";
import { ModerationGridSkeleton } from "@/components/admin/skeletons/ModerationGridSkeleton";

export default function AdminModeratePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });

  if (event === undefined) {
    return <ModerationGridSkeleton />;
  }
  if (!event) {
    return <div className="text-center py-12 text-white/50">Event not found</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Moderate: {event.name}</h1>
      </div>
      <ModerationGrid eventId={event._id} mode="admin" />
    </div>
  );
}
