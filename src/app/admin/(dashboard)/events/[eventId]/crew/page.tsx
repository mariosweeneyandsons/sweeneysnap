"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/admin/CopyButton";
import { CrewMemberManager } from "@/components/admin/CrewMemberManager";

export default function AdminCrewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });

  if (event === undefined) return <div className="text-center py-12 text-foreground-faint">Loading...</div>;
  if (!event) return <div className="text-center py-12 text-foreground-faint">Event not found</div>;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const legacyCrewUrl = `${siteUrl}/crew/${event.crewToken}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${eventId}`} className="text-foreground-faint hover:text-foreground-emphasis transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Manage Crew: {event.name}</h1>
          <p className="text-foreground-faint text-sm">Add individual crew members with specific permissions</p>
        </div>
      </div>

      <Card>
        <h3 className="font-semibold mb-2">Legacy Shared Crew Link</h3>
        <p className="text-foreground-faint text-sm mb-3">
          This shared link gives full moderator access to anyone who has it.
        </p>
        <div className="flex items-center gap-2">
          <code className="text-xs text-foreground-muted bg-surface px-2 py-1 rounded flex-1 truncate">{legacyCrewUrl}</code>
          <CopyButton text={legacyCrewUrl} />
        </div>
      </Card>

      <CrewMemberManager eventId={eventId} />
    </div>
  );
}
