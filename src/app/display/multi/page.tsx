"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DisplayWall } from "@/components/display/DisplayWall";
import { Suspense } from "react";

function MultiDisplayInner() {
  const searchParams = useSearchParams();
  const eventSlugs = (searchParams.get("events") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const events = useQuery(
    api.events.getBySlugs,
    eventSlugs.length > 0 ? { slugs: eventSlugs } : "skip"
  );

  const eventIds = events?.map((e) => e._id as Id<"events">) ?? [];

  const selfies = useQuery(
    api.selfies.listApprovedByMultipleEvents,
    eventIds.length > 0 ? { eventIds } : "skip"
  );

  if (eventSlugs.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-lg">No events specified</p>
          <p className="text-white/30 text-sm mt-2">
            Add ?events=slug1,slug2 to the URL
          </p>
        </div>
      </div>
    );
  }

  if (events === undefined || selfies === undefined) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50">No active events found</p>
      </div>
    );
  }

  // Use the first event's config as the display config
  const primaryEvent = events[0];

  return (
    <DisplayWall
      event={primaryEvent}
      selfies={selfies}
    />
  );
}

export default function MultiDisplayPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <p className="text-white/50">Loading...</p>
        </div>
      }
    >
      <MultiDisplayInner />
    </Suspense>
  );
}
