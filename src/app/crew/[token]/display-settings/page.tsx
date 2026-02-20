"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { DisplaySettingsForm } from "@/components/admin/DisplaySettingsForm";
import Link from "next/link";

export default function CrewDisplaySettingsPage() {
  const { token } = useParams<{ token: string }>();
  const event = useQuery(api.events.getByCrewToken, { token });

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

  return (
    <main className="min-h-dvh bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/crew/${token}`} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Display Settings: {event.name}</h1>
        </div>
        <DisplaySettingsForm event={event} backHref={`/crew/${token}`} />
      </div>
    </main>
  );
}
