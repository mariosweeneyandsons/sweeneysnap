import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { QRCodeDisplay } from "@/components/admin/QRCodeDisplay";
import { CopyButton } from "@/components/admin/CopyButton";
import { EventForm } from "@/components/admin/EventForm";
import { Event } from "@/types/database";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!row) notFound();

  const event = row as unknown as Event;

  const { count: selfieCount } = await supabase
    .from("selfies")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const uploadUrl = `${siteUrl}/${event.slug}`;
  const displayUrl = `${siteUrl}/display/${event.slug}`;
  const crewUrl = `${siteUrl}/crew/${event.crew_token}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-white/50">/{event.slug}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/events/${event.id}/moderate`}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Moderate ({selfieCount || 0})
          </Link>
          <Link
            href={`/admin/events/${event.id}/display-settings`}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Display Settings
          </Link>
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Event Settings</h2>
        <EventForm event={event} />
      </div>
    </div>
  );
}
