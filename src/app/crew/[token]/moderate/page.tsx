"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ModerationGrid } from "@/components/admin/ModerationGrid";
import Link from "next/link";

export default function CrewModeratePage() {
  const { token } = useParams<{ token: string }>();
  const result = useQuery(api.events.getByCrewTokenOrMember, { token });

  if (result === undefined) {
    return <main className="min-h-dvh bg-background text-foreground flex items-center justify-center"><p className="text-foreground-muted">Loading...</p></main>;
  }

  const event = result.event;
  const crewMember = result.crewMember;

  if (!event) {
    return <main className="min-h-dvh bg-background text-foreground flex items-center justify-center"><p className="text-foreground-muted">Event not found</p></main>;
  }

  // Permission guard: viewers cannot moderate
  if (crewMember?.permission === "viewer") {
    return (
      <main className="min-h-dvh bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground-muted mb-4">You do not have permission to moderate selfies.</p>
          <Link href={`/crew/${token}`} className="text-info hover:underline">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/crew/${token}`} className="text-foreground-muted hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Moderate: {event.name}</h1>
          {crewMember && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-info-bg text-info">
              {crewMember.name}
            </span>
          )}
        </div>
        <ModerationGrid
          eventId={event._id}
          mode="crew"
          crewToken={token}
          crewMemberId={crewMember?._id}
        />
      </div>
    </main>
  );
}
