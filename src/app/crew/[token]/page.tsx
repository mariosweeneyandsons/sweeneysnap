"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/admin/CopyButton";

export default function CrewDashboardPage() {
  const { token } = useParams<{ token: string }>();
  const event = useQuery(api.events.getByCrewToken, { token });

  const totalSelfies = useQuery(
    api.selfies.countByEvent,
    event ? { eventId: event._id } : "skip"
  );
  const pendingSelfies = useQuery(
    api.selfies.countByEventAndStatus,
    event ? { eventId: event._id, status: "pending" as const } : "skip"
  );
  const approvedSelfies = useQuery(
    api.selfies.countByEventAndStatus,
    event ? { eventId: event._id, status: "approved" as const } : "skip"
  );

  if (event === undefined) {
    return (
      <main className="min-h-dvh bg-black text-white flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-dvh bg-black text-white flex items-center justify-center">
        <p className="text-white/50">Event not found</p>
      </main>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const uploadUrl = `${siteUrl}/${event.slug}`;
  const displayUrl = `${siteUrl}/display/${event.slug}`;

  return (
    <main className="min-h-dvh bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-white/50 text-sm mb-1">Crew Console</p>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <span
            className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              event.isActive
                ? "bg-green-500/20 text-green-400"
                : "bg-white/10 text-white/50"
            }`}
          >
            {event.isActive ? "Live" : "Inactive"}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <p className="text-3xl font-bold">{totalSelfies ?? 0}</p>
            <p className="text-white/50 text-sm">Total</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-yellow-400">{pendingSelfies ?? 0}</p>
            <p className="text-white/50 text-sm">Pending</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-400">{approvedSelfies ?? 0}</p>
            <p className="text-white/50 text-sm">Approved</p>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <h3 className="font-semibold mb-2">Upload Page</h3>
            <div className="flex items-center gap-2">
              <code className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded flex-1 truncate">{uploadUrl}</code>
              <CopyButton text={uploadUrl} />
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">Display Wall</h3>
            <div className="flex items-center gap-2">
              <code className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded flex-1 truncate">{displayUrl}</code>
              <CopyButton text={displayUrl} />
            </div>
            <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-2 inline-block">
              Open display
            </a>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href={`/crew/${token}/moderate`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Moderate Selfies
            {(pendingSelfies || 0) > 0 && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingSelfies}
              </span>
            )}
          </Link>
          <Link
            href={`/crew/${token}/display-settings`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Display Settings
          </Link>
        </div>
      </div>
    </main>
  );
}
