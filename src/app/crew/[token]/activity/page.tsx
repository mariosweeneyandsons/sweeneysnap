"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { ActivityLog } from "@/components/crew/ActivityLog";

export default function CrewActivityPage() {
  const { token } = useParams<{ token: string }>();
  const result = useQuery(api.events.getByCrewTokenOrMember, { token });

  if (result === undefined) {
    return <main className="min-h-dvh bg-background text-foreground flex items-center justify-center"><p className="text-foreground-muted">Loading...</p></main>;
  }

  const event = result.event;
  if (!event) {
    return <main className="min-h-dvh bg-background text-foreground flex items-center justify-center"><p className="text-foreground-muted">Event not found</p></main>;
  }

  return (
    <main className="min-h-dvh bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/crew/${token}`} className="text-foreground-muted hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Activity Log</h1>
            <p className="text-foreground-muted text-sm">{event.name}</p>
          </div>
        </div>

        <ActivityLog eventId={event._id} crewToken={token} />
      </div>
    </main>
  );
}
