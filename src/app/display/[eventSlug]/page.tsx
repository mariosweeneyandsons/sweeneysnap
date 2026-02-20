"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { DisplayWall } from "@/components/display/DisplayWall";

export default function DisplayPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const event = useQuery(api.events.getBySlug, { slug: eventSlug });
  const selfies = useQuery(
    api.selfies.listApprovedByEvent,
    event ? { eventId: event._id } : "skip"
  );

  if (event === undefined || selfies === undefined) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50">Event not found</p>
      </div>
    );
  }

  return <DisplayWall event={event} selfies={selfies} />;
}
