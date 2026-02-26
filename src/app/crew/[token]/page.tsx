"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/admin/CopyButton";
import { getSiteUrl } from "@/lib/config";

export default function CrewDashboardPage() {
  const { token } = useParams<{ token: string }>();
  const result = useQuery(api.events.getByCrewTokenOrMember, { token });

  const event = result?.event;
  const crewMember = result?.crewMember;

  const totalSelfies = useQuery(
    api.selfies.countByEvent,
    event ? { eventId: event._id, crewToken: token } : "skip"
  );
  const pendingSelfies = useQuery(
    api.selfies.countByEventAndStatus,
    event ? { eventId: event._id, status: "pending" as const, crewToken: token } : "skip"
  );
  const approvedSelfies = useQuery(
    api.selfies.countByEventAndStatus,
    event ? { eventId: event._id, status: "approved" as const, crewToken: token } : "skip"
  );

  if (result === undefined) {
    return (
      <main className="min-h-dvh bg-background text-foreground flex items-center justify-center">
        <p className="text-foreground-muted">Loading...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-dvh bg-background text-foreground flex items-center justify-center">
        <p className="text-foreground-muted">Event not found</p>
      </main>
    );
  }

  const isViewer = crewMember?.permission === "viewer";
  const canModerate = !isViewer;

  const siteUrl = getSiteUrl();
  const uploadUrl = `${siteUrl}/${event.slug}`;
  const displayUrl = `${siteUrl}/display/${event.slug}`;

  return (
    <main className="min-h-dvh bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-foreground-muted text-sm mb-1">Crew Console</p>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                event.isActive
                  ? "bg-success-bg text-success"
                  : "bg-secondary text-foreground-muted"
              }`}
            >
              {event.isActive ? "Live" : "Inactive"}
            </span>
            {crewMember && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-info-bg text-info">
                {crewMember.name} ({crewMember.permission})
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <p className="text-3xl font-bold">{totalSelfies ?? 0}</p>
            <p className="text-foreground-muted text-sm">Total</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-warning">{pendingSelfies ?? 0}</p>
            <p className="text-foreground-muted text-sm">Pending</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-success">{approvedSelfies ?? 0}</p>
            <p className="text-foreground-muted text-sm">Approved</p>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <h3 className="font-semibold mb-2">Upload Page</h3>
            <div className="flex items-center gap-2">
              <code className="text-xs text-foreground-muted bg-secondary px-2 py-1 rounded flex-1 truncate">{uploadUrl}</code>
              <CopyButton text={uploadUrl} />
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">Display Wall</h3>
            <div className="flex items-center gap-2">
              <code className="text-xs text-foreground-muted bg-secondary px-2 py-1 rounded flex-1 truncate">{displayUrl}</code>
              <CopyButton text={displayUrl} />
            </div>
            <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-info hover:underline mt-2 inline-block">
              Open display
            </a>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {canModerate ? (
            <Link
              href={`/crew/${token}/moderate`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background px-4 py-3 rounded-xs font-medium hover:bg-surface-hover transition-colors"
            >
              Moderate Selfies
              {(pendingSelfies || 0) > 0 && (
                <span className="bg-warning text-background text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingSelfies}
                </span>
              )}
            </Link>
          ) : (
            <div className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-foreground-muted px-4 py-3 rounded-xs font-medium cursor-not-allowed">
              Moderate (Viewer Only)
            </div>
          )}
          <Link
            href={`/crew/${token}/display-settings`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-foreground px-4 py-3 rounded-xs font-medium hover:bg-surface-hover transition-colors"
          >
            Display Settings
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href={`/crew/${token}/activity`}
            className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity Log
          </Link>
        </div>
      </div>
    </main>
  );
}
