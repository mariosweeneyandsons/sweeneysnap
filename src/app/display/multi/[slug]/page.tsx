"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DisplayWall } from "@/components/display/DisplayWall";

export default function SavedMultiDisplayPage() {
  const { slug } = useParams<{ slug: string }>();

  const multiDisplay = useQuery(api.multiEventDisplays.getBySlug, { slug });

  const eventIds = (multiDisplay?.eventIds ?? []) as Id<"events">[];

  const selfies = useQuery(
    api.selfies.listApprovedByMultipleEvents,
    eventIds.length > 0 ? { eventIds } : "skip"
  );

  // Fetch events by IDs for branding/config
  const events = useQuery(
    api.events.getByIds,
    eventIds.length > 0 ? { ids: eventIds } : "skip"
  );

  if (multiDisplay === undefined || selfies === undefined) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-foreground/50">Loading...</p>
      </div>
    );
  }

  if (!multiDisplay) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-foreground/50">Display not found</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-foreground/50">Loading events...</p>
      </div>
    );
  }

  // Use the multi-display's own displayConfig, merged with first event's branding
  const displayEvent = {
    ...events[0],
    name: multiDisplay.name,
    displayConfig: multiDisplay.displayConfig,
  };

  return (
    <DisplayWall
      event={displayEvent}
      selfies={selfies}
    />
  );
}
