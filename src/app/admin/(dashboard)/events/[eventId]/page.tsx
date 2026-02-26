"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QRCodeDisplay } from "@/components/admin/QRCodeDisplay";
import { CopyButton } from "@/components/admin/CopyButton";
import { EventForm } from "@/components/admin/EventForm";
import { ExportSelfiesButton } from "@/components/admin/ExportSelfiesButton";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });
  const selfieCount = useQuery(
    api.selfies.countByEvent,
    event ? { eventId: event._id } : "skip"
  );

  const duplicateEvent = useMutation(api.events.duplicate);
  const archiveEvent = useMutation(api.events.archive);
  const removeAllSelfies = useMutation(api.selfies.removeAllByEvent);

  const [duplicating, setDuplicating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<number | null>(null);

  if (event === undefined) {
    return <div className="text-center py-12 text-white/50">Loading...</div>;
  }
  if (!event) {
    return <div className="text-center py-12 text-white/50">Event not found</div>;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const uploadUrl = `${siteUrl}/${event.slug}`;
  const displayUrl = `${siteUrl}/display/${event.slug}`;
  const crewUrl = `${siteUrl}/crew/${event.crewToken}`;

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const newId = await duplicateEvent({ id: event._id as Id<"events"> });
      router.push(`/admin/events/${newId}`);
    } finally {
      setDuplicating(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const result = await archiveEvent({ id: event._id as Id<"events"> });
      if (result.archived) {
        router.push("/admin");
      }
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteAllSelfies = async () => {
    if (!confirm("Are you sure you want to delete ALL selfies for this event? This cannot be undone.")) return;
    if (!confirm("This will permanently delete all photos and data. Type OK to confirm.")) return;

    setDeleting(true);
    setDeleteProgress(0);
    let totalDeleted = 0;

    try {
      let hasMore = true;
      while (hasMore) {
        const result = await removeAllSelfies({ eventId: event._id as Id<"events"> });
        totalDeleted += result.deleted;
        setDeleteProgress(totalDeleted);
        hasMore = result.hasMore;
      }
    } finally {
      setDeleting(false);
      setDeleteProgress(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            {event.archived && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/50">
                Archived
              </span>
            )}
          </div>
          <p className="text-white/50">/{event.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/events/${event._id}/analytics`}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Analytics
          </Link>
          <Link
            href={`/admin/events/${event._id}/moderate`}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Moderate ({selfieCount ?? 0})
          </Link>
          <Link
            href={`/admin/events/${event._id}/display-settings`}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Display Settings
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDuplicate} loading={duplicating}>
            Duplicate
          </Button>
          <Button variant="ghost" size="sm" onClick={handleArchive} loading={archiving}>
            {event.archived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="font-semibold mb-3">Upload Page (QR Code)</h3>
          <QRCodeDisplay url={uploadUrl} size={160} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Display Wall</h3>
          <p className="text-white/50 text-sm mb-3">Open this on the big screen</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded flex-1 truncate">{displayUrl}</code>
            <CopyButton text={displayUrl} />
          </div>
          <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-2 inline-block">
            Open in new tab
          </a>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Crew Console</h3>
          <p className="text-white/50 text-sm mb-3">Share with your AV crew (secret link)</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded flex-1 truncate">{crewUrl}</code>
            <CopyButton text={crewUrl} />
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <ExportSelfiesButton eventId={event._id} eventName={event.name} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Event Settings</h2>
        <EventForm event={event} />
      </div>

      <Card className="border-red-500/30">
        <h3 className="text-red-400 font-semibold mb-3">Danger Zone</h3>
        <p className="text-white/50 text-sm mb-4">
          Permanently delete all selfies for this event. This action cannot be undone.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDeleteAllSelfies}
          loading={deleting}
          disabled={selfieCount === 0}
        >
          {deleteProgress !== null
            ? `Deleting... (${deleteProgress} removed)`
            : `Delete All Selfies (${selfieCount ?? 0})`}
        </Button>
      </Card>
    </div>
  );
}
