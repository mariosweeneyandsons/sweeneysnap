"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { DisplaySettingsForm } from "@/components/admin/DisplaySettingsForm";
import { LivePreviewPanel } from "@/components/admin/LivePreviewPanel";
import { DisplayConfig } from "@/types/database";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function AdminDisplaySettingsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });
  const [liveConfig, setLiveConfig] = useState<DisplayConfig | null>(null);

  if (event === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-8">
          <Skeleton className="w-[400px] h-[300px] rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  if (!event) {
    return <div className="text-center py-12 text-white/50">Event not found</div>;
  }

  const previewConfig = liveConfig ?? event.displayConfig;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/events/${eventId}`} className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Display Settings: {event.name}</h1>
      </div>

      <div className="flex gap-8">
        <div className="w-[400px] shrink-0">
          <LivePreviewPanel eventId={eventId} config={previewConfig} />
        </div>
        <div className="flex-1 min-w-0">
          <DisplaySettingsForm
            event={event}
            backHref={`/admin/events/${eventId}`}
            onConfigChange={setLiveConfig}
          />
        </div>
      </div>
    </div>
  );
}
