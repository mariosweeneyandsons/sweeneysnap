"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui/Card";

export default function AdminDashboard() {
  const events = useQuery(api.events.list);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Event
        </Link>
      </div>

      {!events ? (
        <div className="text-center py-12 text-white/50">Loading...</div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-white/50 mb-4">No events yet</p>
          <Link href="/admin/events/new" className="text-white underline hover:no-underline">
            Create your first event
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event._id} href={`/admin/events/${event._id}`}>
              <Card className="hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{event.name}</h3>
                    <p className="text-white/50 text-sm font-mono">/{event.slug}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {event.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  {event.startsAt && (
                    <span>{new Date(event.startsAt).toLocaleDateString()}</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
