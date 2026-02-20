"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UploadForm } from "@/components/upload/UploadForm";

export default function UploadPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const event = useQuery(api.events.getBySlug, { slug: eventSlug });

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
    <main className="min-h-dvh bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {event.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.logoUrl} alt="" className="h-12 w-auto mb-6" />
        )}
        <h1 className="text-2xl font-bold mb-2 text-center">{event.name}</h1>
        <p className="text-white/60 mb-8 text-center">
          {event.uploadConfig.welcomeText || "Take a selfie and see it on the big screen!"}
        </p>
        <div className="w-full max-w-sm">
          <UploadForm event={event} />
        </div>
      </div>
    </main>
  );
}
